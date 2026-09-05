import { describe, expect, it } from 'vitest'
import { bustUrl, cacheStateOf, summarize } from '../../scripts/lib/perfStats.mjs'

describe('summarize', () => {
  it('collapses a single sample into every statistic', () => {
    expect(summarize([10])).toEqual({ min: 10, median: 10, p95: 10, n: 1 })
  })

  it('sorts before picking min and median', () => {
    const result = summarize([5, 1, 3])
    expect(result).not.toBeNull()
    expect(result?.min).toBe(1)
    expect(result?.median).toBe(3)
  })

  it('uses nearest-rank p95 so the number is reproducible', () => {
    const samples = Array.from({ length: 100 }, (_, index) => index + 1)
    expect(summarize(samples)?.p95).toBe(95)
  })

  it('returns null for an empty sample set', () => {
    expect(summarize([])).toBeNull()
  })
})

describe('cacheStateOf', () => {
  it('prefers the Cloudflare header', () => {
    expect(cacheStateOf(new Headers({ 'cf-cache-status': 'HIT' }))).toBe('HIT')
  })

  it('falls back to the standard Cache-Status header', () => {
    expect(cacheStateOf(new Headers({ 'cache-status': '"Netlify Edge"; hit' }))).toContain('hit')
  })

  it('reports unknown when no cache header is present', () => {
    expect(cacheStateOf(new Headers())).toBe('unknown')
  })
})

describe('bustUrl', () => {
  it('appends the cache-busting parameter', () => {
    expect(bustUrl('https://x/a', 't1')).toContain('_pb=t1')
  })

  it('keeps existing query parameters', () => {
    const busted = bustUrl('https://x/a?b=1', 't1')
    expect(busted).toContain('b=1')
    expect(busted).toContain('_pb=t1')
  })
})
