// A day of freshness plus a week of stale-while-revalidate: catalog content
// changes on deploy, not on a clock, and every hour of TTL is another forced
// revalidation per page against a 125k/month function budget.
const HTML_CACHE_DIRECTIVE = 'public, max-age=86400, stale-while-revalidate=604800'
const HTML_DURABLE_DIRECTIVE = 'public, durable, max-age=86400, stale-while-revalidate=604800'

// Netlify varies serverless cache keys on the full query string by default, so
// every ?utm_source=… link would miss the cache and force a full SSR. No page
// reads query params, and Netlify folds all non-matches of an allowlist into a
// single cache object, so an allowlist of one unused name drops query from the
// key entirely. Add a real param here before shipping a query-driven page.
const HTML_VARY = 'query=_'

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
    'Netlify-CDN-Cache-Control': HTML_DURABLE_DIRECTIVE,
    'Netlify-Vary': HTML_VARY,
  }
}
