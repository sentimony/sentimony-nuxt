type RouteRule = {
  headers: Record<string, string>
}

// `durable` opts a serverless response into Netlify's central cache layer, so a
// cold PoP is served from it instead of re-invoking the function. It is a
// Netlify extension, hence never mirrored into the portable CDN-Cache-Control.
function cdnHeaders(directive: string, durable = false): Record<string, string> {
  return {
    'CDN-Cache-Control': directive,
    'Netlify-CDN-Cache-Control': durable ? directive.replace('public,', 'public, durable,') : directive,
  }
}

// Both are also set straight from a handler, because `/api/track-plays` serves
// a public GET and a private POST off one path and route rules cannot tell the
// two methods apart.
export const publicCounterHeaders = cdnHeaders('public, max-age=60, stale-while-revalidate=300', true)

export const privateHeaders: Record<string, string> = {
  'Cache-Control': 'private, no-store',
  ...cdnHeaders('private, no-store'),
}

const publicCacheRule: RouteRule = {
  headers: cdnHeaders('public, max-age=3600, stale-while-revalidate=86400', true),
}

const privateCacheRule: RouteRule = {
  headers: privateHeaders,
}

const countCacheRule: RouteRule = {
  headers: publicCounterHeaders,
}

const catalogRoutes = [
  '/api/releases',
  '/api/releases-all',
  '/api/release/**',
  '/api/artists',
  '/api/artists-all',
  '/api/artist/**',
  '/api/artist-track-counts',
  '/api/events',
  '/api/event/**',
  '/api/friends',
  '/api/friend/**',
  '/api/playlists',
  '/api/playlist/**',
  '/api/videos',
  '/api/video/**',
  '/api/tracks',
  '/api/tracks/**',
  '/api/track/**',
] as const

const likesBases = [
  '/api/likes',
  '/api/artist-likes',
  '/api/event-likes',
  '/api/playlist-likes',
  '/api/track-likes',
  '/api/video-likes',
] as const

const likedItemsRoutes = [
  '/api/likes/releases',
  '/api/artist-likes/artists',
  '/api/event-likes/events',
  '/api/playlist-likes/playlists',
  '/api/track-likes/tracks',
  '/api/video-likes/videos',
] as const

export function buildApiRouteRules(): Record<string, RouteRule> {
  const rules: Record<string, RouteRule> = {}

  for (const route of catalogRoutes) {
    rules[route] = publicCacheRule
  }

  for (const base of likesBases) {
    rules[base] = privateCacheRule
    rules[`${base}/**`] = privateCacheRule
    rules[`${base}/count/**`] = countCacheRule
  }

  for (const route of likedItemsRoutes) {
    rules[route] = privateCacheRule
  }

  rules['/api/profile/summary'] = privateCacheRule

  return rules
}
