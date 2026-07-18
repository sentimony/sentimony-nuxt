import { describe, expect, it } from 'vitest'
import { buildApiRouteRules } from '../../server/utils/cachePolicy'

describe('buildApiRouteRules', () => {
  it('caches only explicitly public catalog endpoints', () => {
    const rules = buildApiRouteRules()

    expect(rules['/api/releases']).toEqual({
      headers: {
        'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
    expect(rules['/api/release/**']).toEqual(rules['/api/releases'])
  })

  it('marks user-specific likes endpoints as private', () => {
    const rules = buildApiRouteRules()
    const privateRule = {
      headers: {
        'Cache-Control': 'private, no-store',
        'Netlify-CDN-Cache-Control': 'private, no-store',
      },
    }

    expect(rules['/api/likes']).toEqual(privateRule)
    expect(rules['/api/likes/releases']).toEqual(privateRule)
    expect(rules['/api/artist-likes']).toEqual(privateRule)
    expect(rules['/api/artist-likes/artists']).toEqual(privateRule)
  })

  it('keeps public like counters cacheable while mutations remain private', () => {
    const rules = buildApiRouteRules()

    expect(rules['/api/track-likes/count/**']?.headers?.['Netlify-CDN-Cache-Control'])
      .toBe('public, max-age=60, stale-while-revalidate=300')
    expect(rules['/api/track-likes/**']?.headers?.['Netlify-CDN-Cache-Control'])
      .toBe('private, no-store')
  })
})
