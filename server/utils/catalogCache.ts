import type { H3Event } from 'h3'

const isDev = process.env.NODE_ENV === 'development'

export function catalogCacheOptions(maxAge = 60 * 60) {
  return {
    maxAge: isDev ? 0 : maxAge,
    swr: !isDev,
    getKey: (event: H3Event) => `${getCatalogSource()}:${event.path}`,
  }
}
