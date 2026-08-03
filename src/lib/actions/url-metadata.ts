'use server'

import { fetchUrlMetadata, type UrlMetadataResponse } from '@/lib/utils/url-metadata'

export async function getUrlMetadataAction(url: string): Promise<UrlMetadataResponse> {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'URL is required.' }
  }

  return await fetchUrlMetadata(url.trim())
}
