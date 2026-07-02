import { describe, expect, it } from 'vitest'
import { fetchPagedRows } from '../../server/utils/likeCounts'

describe('fetchPagedRows', () => {
  it('collects all pages until a short page', async () => {
    const source = Array.from({ length: 2500 }, (_, i) => ({ id: i }))
    const calls: [number, number][] = []

    const rows = await fetchPagedRows(1000, async (from, to) => {
      calls.push([from, to])
      return source.slice(from, to + 1)
    })

    expect(rows).toHaveLength(2500)
    expect(calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]])
  })

  it('stops after one call when the first page is short', async () => {
    let calls = 0
    const rows = await fetchPagedRows(1000, async () => {
      calls++
      return [{ id: 1 }]
    })

    expect(rows).toHaveLength(1)
    expect(calls).toBe(1)
  })
})
