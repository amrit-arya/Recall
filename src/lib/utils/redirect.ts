/**
 * Ensures that a redirect target is a safe internal relative URL.
 * Prevents open-redirect vulnerabilities (e.g. //evil.com, https://evil.com, /\evil.com).
 */
export function getSafeRedirect(
  target: string | null | undefined,
  fallback: string = '/dashboard'
): string {
  if (!target || typeof target !== 'string') {
    return fallback
  }

  const trimmed = target.trim()

  // Must start with '/' and NOT start with '//' or '/\' or contain protocol scheme
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes('://')
  ) {
    return trimmed
  }

  return fallback
}
