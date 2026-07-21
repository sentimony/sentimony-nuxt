import { describe, expect, it } from 'vitest'
import { mergePlayCounts } from '../../app/utils/playCounts'

describe('mergePlayCounts', () => {
  it('keeps the higher of local and incoming counts per slug', () => {
    const base = { a: 5, b: 2 }
    mergePlayCounts(base, { a: 3, b: 4, c: 1 })
    expect(base).toEqual({ a: 5, b: 4, c: 1 })
  })

  it('never lowers an optimistic local increment below the server value', () => {
    const base = { a: 10 }
    mergePlayCounts(base, { a: 9 })
    expect(base.a).toBe(10)
  })

  it('leaves the base untouched when incoming is undefined', () => {
    const base = { a: 1 }
    expect(mergePlayCounts(base, undefined)).toBe(base)
    expect(base).toEqual({ a: 1 })
  })

  it('mutates and returns the same base reference', () => {
    const base: Record<string, number> = {}
    expect(mergePlayCounts(base, { a: 2 })).toBe(base)
    expect(base).toEqual({ a: 2 })
  })
})
