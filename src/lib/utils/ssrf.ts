/**
 * SSRF Protection Utility for RECALL.
 * Validates target URLs to prevent Server-Side Request Forgery attacks.
 */

export interface UrlSafetyResult {
  safe: boolean
  reason?: string
  url?: URL
}

export function isSafePublicUrl(inputUrl: string): UrlSafetyResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { safe: false, reason: 'URL must be a non-empty string.' }
  }

  let parsedUrl: URL
  try {
    const formatted = inputUrl.trim().startsWith('http://') || inputUrl.trim().startsWith('https://')
      ? inputUrl.trim()
      : `https://${inputUrl.trim()}`
    parsedUrl = new URL(formatted)
  } catch {
    return { safe: false, reason: 'Invalid URL format.' }
  }

  // 1. Protocol Check (http and https only)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { safe: false, reason: `Unsupported protocol: ${parsedUrl.protocol}` }
  }

  const hostname = parsedUrl.hostname.toLowerCase()

  // 2. Reject obvious localhost / internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home') ||
    hostname.endsWith('.invalid') ||
    hostname.endsWith('.test')
  ) {
    return { safe: false, reason: 'Internal hostnames are not permitted.' }
  }

  // 3. IPv4 Checks
  // Regular expression to check for standard IPv4
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const ipv4Match = hostname.match(ipv4Regex)

  if (ipv4Match) {
    const [, p1, p2, p3, p4] = ipv4Match.map(Number)

    if (p1 > 255 || p2 > 255 || p3 > 255 || p4 > 255) {
      return { safe: false, reason: 'Invalid IP address format.' }
    }

    // 127.0.0.0/8 — Loopback
    if (p1 === 127) {
      return { safe: false, reason: 'Loopback IP addresses are not permitted.' }
    }

    // 10.0.0.0/8 — Private
    if (p1 === 10) {
      return { safe: false, reason: 'Private IP addresses (10.x) are not permitted.' }
    }

    // 172.16.0.0/12 — Private
    if (p1 === 172 && p2 >= 16 && p2 <= 31) {
      return { safe: false, reason: 'Private IP addresses (172.16-31.x) are not permitted.' }
    }

    // 192.168.0.0/16 — Private
    if (p1 === 192 && p2 === 168) {
      return { safe: false, reason: 'Private IP addresses (192.168.x) are not permitted.' }
    }

    // 169.254.0.0/16 — Link-local & AWS Metadata (169.254.169.254)
    if (p1 === 169 && p2 === 254) {
      return { safe: false, reason: 'Link-local / Cloud metadata IP addresses are not permitted.' }
    }

    // 0.0.0.0/8 — Current network
    if (p1 === 0) {
      return { safe: false, reason: 'Zero IP addresses are not permitted.' }
    }

    // 100.64.0.0/10 — Carrier grade NAT
    if (p1 === 100 && p2 >= 64 && p2 <= 127) {
      return { safe: false, reason: 'CGNAT IP addresses are not permitted.' }
    }
  }

  // 4. IPv6 Checks
  if (
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname.startsWith('fe80:') ||
    hostname.startsWith('fc00:') ||
    hostname.startsWith('fd00:') ||
    hostname.includes('::ffff:127.') ||
    hostname.includes('::ffff:10.') ||
    hostname.includes('::ffff:192.168.') ||
    hostname.includes('::ffff:172.')
  ) {
    return { safe: false, reason: 'Internal IPv6 addresses are not permitted.' }
  }

  return { safe: true, url: parsedUrl }
}
