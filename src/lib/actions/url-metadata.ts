'use server'

import { getCurrentUser } from '@/lib/supabase/auth'
import { fetchUrlMetadata, type UrlMetadataResponse } from '@/lib/utils/url-metadata'

export async function getUrlMetadataAction(url: string): Promise<UrlMetadataResponse> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'You must be signed in to fetch URL metadata.' }
  }

  if (!url || typeof url !== 'string') {
    return { success: false, error: 'URL is required.' }
  }

  return await fetchUrlMetadata(url.trim())
}
