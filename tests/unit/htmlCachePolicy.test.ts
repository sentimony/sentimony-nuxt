import { describe, expect, it } from 'vitest'
import { htmlCacheHeaders } from '../../server/utils/htmlCachePolicy'

const publicHeaders = {
  'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
}

describe('htmlCacheHeaders', () => {
  it('caches anonymous catalog pages', () => {
    expect(htmlCacheHeaders('/', '')).toEqual(publicHeaders)
    expect(htmlCacheHeaders('/releases', '')).toEqual(publicHeaders)
    expect(htmlCacheHeaders('/release/vorg-cyber-soul-chill', '')).toEqual(publicHeaders)
    expect(htmlCacheHeaders('/artists/all', undefined)).toEqual(publicHeaders)
  })

  it('never caches a request carrying a Supabase session', () => {
    expect(htmlCacheHeaders('/', 'sb-dugbgewuzowoogglccue-auth-token=abc')).toBeNull()
    expect(htmlCacheHeaders('/releases', 'sb-dugbgewuzowoogglccue-auth-token.0=abc')).toBeNull()
    expect(htmlCacheHeaders('/', 'theme=dark; sb-dugbgewuzowoogglccue-auth-token=abc')).toBeNull()
  })

  it('ignores cookies unrelated to auth', () => {
    expect(htmlCacheHeaders('/', 'sentimony_anon_id=6f1c6e0e-0000-4000-8000-000000000000')).toEqual(publicHeaders)
    expect(htmlCacheHeaders('/', 'theme=dark')).toEqual(publicHeaders)
  })

  it('never caches private surfaces', () => {
    for (const path of ['/profile', '/profile/releases', '/signin', '/signup', '/forgot-password', '/reset-password', '/confirm']) {
      expect(htmlCacheHeaders(path, ''), path).toBeNull()
    }
  })

  it('leaves API routes to the routeRules policy', () => {
    expect(htmlCacheHeaders('/api/releases', '')).toBeNull()
    expect(htmlCacheHeaders('/api/likes', '')).toBeNull()
  })

  it('mirrors the two CDN headers', () => {
    const headers = htmlCacheHeaders('/', '')
    expect(headers?.['CDN-Cache-Control']).toBe(headers?.['Netlify-CDN-Cache-Control'])
  })
})
