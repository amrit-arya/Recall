import { isSafePublicUrl } from './ssrf'

export interface UrlMetadata {
  title?: string
  description?: string
  domain: string
  faviconUrl?: string
  siteName?: string
  canonicalUrl: string
}

export interface UrlMetadataResponse {
  success: boolean
  metadata?: UrlMetadata
  error?: string
}

/** Helper to decode basic HTML entities in extracted titles and descriptions */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Helper to resolve relative icon URLs against base origin */
function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).href
  } catch {
    return href
  }
}

export async function fetchUrlMetadata(inputUrl: string): Promise<UrlMetadataResponse> {
  const safety = isSafePublicUrl(inputUrl)
  if (!safety.safe || !safety.url) {
    return { success: false, error: safety.reason || 'Invalid or unsafe URL.' }
  }

  const targetUrl = safety.url
  const canonicalUrl = targetUrl.href
  const domain = targetUrl.hostname.replace(/^www\./, '')
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`

  try {
    // 4-second sensible timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const response = await fetch(canonicalUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: true,
        metadata: {
          domain,
          canonicalUrl,
          faviconUrl: fallbackFavicon,
        },
      }
    }

    // Limit read to first 512KB to avoid excessive content scraping / memory exhaustion
    const reader = response.body?.getReader()
    let html = ''
    if (reader) {
      const decoder = new TextDecoder('utf-8')
      let bytesRead = 0
      const maxBytes = 512 * 1024 // 512 KB limit

      while (bytesRead < maxBytes) {
        const { done, value } = await reader.read()
        if (done || !value) break
        bytesRead += value.byteLength
        html += decoder.decode(value, { stream: true })
      }
      reader.cancel()
    } else {
      html = await response.text()
      html = html.substring(0, 512 * 1024)
    }

    // 1. Extract Title
    let title: string | undefined
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
    const twitterTitleMatch = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)
    const htmlTitleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)

    if (ogTitleMatch?.[1]) {
      title = decodeHtmlEntities(ogTitleMatch[1])
    } else if (twitterTitleMatch?.[1]) {
      title = decodeHtmlEntities(twitterTitleMatch[1])
    } else if (htmlTitleMatch?.[1]) {
      title = decodeHtmlEntities(htmlTitleMatch[1])
    }

    // 2. Extract Description
    let description: string | undefined
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)

    if (ogDescMatch?.[1]) {
      description = decodeHtmlEntities(ogDescMatch[1])
    } else if (metaDescMatch?.[1]) {
      description = decodeHtmlEntities(metaDescMatch[1])
    }

    // 3. Extract Site Name
    let siteName: string | undefined
    const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)
    if (siteNameMatch?.[1]) {
      siteName = decodeHtmlEntities(siteNameMatch[1])
    }

    // 4. Extract Favicon
    let faviconUrl = fallbackFavicon
    const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut icon|icon)["'][^>]*href=["']([^"']+)["']/i)
      || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut icon|icon)["']/i)

    if (iconMatch?.[1]) {
      faviconUrl = resolveUrl(iconMatch[1], canonicalUrl)
    }

    return {
      success: true,
      metadata: {
        title,
        description,
        domain,
        faviconUrl,
        siteName,
        canonicalUrl,
      },
    }
  } catch {
    // Metadata fetch failures must NEVER prevent saving — return fallback with domain
    return {
      success: true,
      metadata: {
        domain,
        canonicalUrl,
        faviconUrl: fallbackFavicon,
      },
    }
  }
}
