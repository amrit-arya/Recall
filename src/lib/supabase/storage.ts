export const STORAGE_BUCKET = 'memories'
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

/**
 * Validates file size and MIME type.
 * Returns error string if invalid, or null if valid.
 */
export function validateAttachmentFile(file: File): string | null {
  if (!file) {
    return 'No file selected.'
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1)
    return `File size (${sizeInMb} MB) exceeds the maximum allowed limit of 10 MB.`
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `Unsupported file type (${file.type || 'unknown'}). Allowed types: PNG, JPG, WEBP, GIF, PDF.`
  }

  return null
}

/**
 * Sanitizes filename to prevent directory traversal or broken URLs.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_')
}

/**
 * Generates path for storage uploads: {user_id}/{timestamp}_{filename}
 */
export function buildStoragePath(userId: string, fileName: string): string {
  const safeName = sanitizeFileName(fileName)
  return `${userId}/${Date.now()}_${safeName}`
}
