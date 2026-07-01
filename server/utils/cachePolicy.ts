type RouteRule = {
  headers: Record<string, string>
}

const publicCacheRule: RouteRule = {
  headers: {
    'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
}

const privateCacheRule: RouteRule = {
  headers: {
    'Cache-Control': 'private, no-store',
    'Netlify-CDN-Cache-Control': 'private, no-store',
  },
}

const catalogRoutes = [
  '/api/releases',
  '/api/release/**',
  '/api/artists',
  '/api/artist/**',
  '/api/events',
  '/api/event/**',
  '/api/friends',
  '/api/friend/**',
  '/api/playlists',
  '/api/playlist/**',
  '/api/videos',
  '/api/video/**',
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
    rules[`${base}/count/**`] = publicCacheRule
  }

  for (const route of likedItemsRoutes) {
    rules[route] = privateCacheRule
  }

  rules['/api/profile/summary'] = privateCacheRule

  return rules
}
