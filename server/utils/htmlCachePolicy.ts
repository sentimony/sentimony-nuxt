const HTML_CACHE_DIRECTIVE = 'public, max-age=3600, stale-while-revalidate=86400'

const privatePrefixes = ['/api/', '/profile']

const privatePaths = new Set([
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/confirm',
])

export function hasSupabaseSession(cookieHeader: string | undefined): boolean {
  return /(?:^|;\s*)sb-[^=;]*auth-token/.test(cookieHeader ?? '')
}

export function htmlCacheHeaders(
  pathname: string,
  cookieHeader: string | undefined,
): Record<string, string> | null {
  if (privatePaths.has(pathname)) return null
  if (privatePrefixes.some(prefix => pathname.startsWith(prefix))) return null
  if (hasSupabaseSession(cookieHeader)) return null

  return {
    'CDN-Cache-Control': HTML_CACHE_DIRECTIVE,
    'Netlify-CDN-Cache-Control': HTML_CACHE_DIRECTIVE,
  }
}
