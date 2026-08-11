import { describe, expect, it } from 'vitest'
import { buildApiRouteRules } from '../../server/utils/cachePolicy'

describe('buildApiRouteRules', () => {
  it('caches only explicitly public catalog endpoints', () => {
    const rules = buildApiRouteRules()

    expect(rules['/api/releases']).toEqual({
      headers: {
        'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Netlify-CDN-Cache-Control': 'public, durable, max-age=3600, stale-while-revalidate=86400',
      },
    })
    expect(rules['/api/release/**']).toEqual(rules['/api/releases'])
  })

  it('marks user-specific likes endpoints as private', () => {
    const rules = buildApiRouteRules()
    const privateRule = {
      headers: {
        'Cache-Control': 'private, no-store',
        'CDN-Cache-Control': 'private, no-store',
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
      .toBe('public, durable, max-age=60, stale-while-revalidate=300')
    expect(rules['/api/track-likes/**']?.headers?.['Netlify-CDN-Cache-Control'])
      .toBe('private, no-store')
  })

  it('mirrors every Netlify CDN directive into the standard CDN-Cache-Control header', () => {
    const rules = buildApiRouteRules()
    const entries = Object.entries(rules)

    expect(entries.length).toBeGreaterThan(0)

    for (const [route, rule] of entries) {
      const netlify = rule.headers['Netlify-CDN-Cache-Control']
      expect(netlify, `${route} must keep the Netlify header while prod runs on Netlify`).toBeTruthy()
      expect(rule.headers['CDN-Cache-Control'], `${route} must mirror the Netlify directive`)
        .toBe(netlify?.replace('durable, ', ''))
    }
  })

  it('marks public responses durable and never the private ones', () => {
    const rules = buildApiRouteRules()

    for (const [route, rule] of Object.entries(rules)) {
      const netlify = rule.headers['Netlify-CDN-Cache-Control'] ?? ''
      expect(netlify.includes('durable'), `${route} durability must follow its visibility`)
        .toBe(netlify.startsWith('public'))
      expect(rule.headers['CDN-Cache-Control'], `${route} must not leak the Netlify-only directive`)
        .not.toContain('durable')
    }
  })

  it('keeps private routes uncacheable through the browser Cache-Control header', () => {
    const rules = buildApiRouteRules()

    expect(rules['/api/likes']?.headers?.['Cache-Control']).toBe('private, no-store')
    expect(rules['/api/profile/summary']?.headers?.['Cache-Control']).toBe('private, no-store')
    expect(rules['/api/track-plays']?.headers?.['Cache-Control']).toBe('private, no-store')
    expect(rules['/api/releases']?.headers?.['Cache-Control']).toBeUndefined()
  })
})
