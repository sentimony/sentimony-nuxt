import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installNitroGlobals } from '../setup/nitroMocks'

type CounterRow = { slug: string, total: number | string }

function mockSupabaseAdmin(pages: (from: number, to: number, entity: string) => { data: CounterRow[] | null, error: { message: string } | null }) {
  return () => ({
    from: () => ({
      select: () => ({
        eq: (_col: string, entity: string) => ({
          order: () => ({
            range: async (from: number, to: number) => pages(from, to, entity),
          }),
        }),
      }),
    }),
  })
}

describe('likeCountersHandler', () => {
  let restore: () => void = () => {}

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    restore()
  })

  it('returns slug/total pairs filtered by entity', async () => {
    let filteredEntity = ''
    restore = installNitroGlobals({
      supabaseAdmin: mockSupabaseAdmin((_from, _to, entity) => {
        filteredEntity = entity
        return { data: [{ slug: 'va-fantazma', total: 7 }, { slug: 'other', total: '3' }], error: null }
      }),
    })

    const { likeCountersHandler } = await import('../../server/utils/likeCountersHandler')
    const handler = likeCountersHandler('release') as () => Promise<{ slug: string, total: number }[]>

    await expect(handler()).resolves.toEqual([
      { slug: 'va-fantazma', total: 7 },
      { slug: 'other', total: 3 },
    ])
    expect(filteredEntity).toBe('release')
  })

  it('pages past the 1000-row PostgREST cap', async () => {
    const firstPage: CounterRow[] = Array.from({ length: 1000 }, (_, i) => ({ slug: `track-${i}`, total: 1 }))
    const ranges: [number, number][] = []
    restore = installNitroGlobals({
      supabaseAdmin: mockSupabaseAdmin((from, to) => {
        ranges.push([from, to])
        return { data: from === 0 ? firstPage : [{ slug: 'track-1000', total: 5 }], error: null }
      }),
    })

    const { likeCountersHandler } = await import('../../server/utils/likeCountersHandler')
    const handler = likeCountersHandler('track') as () => Promise<{ slug: string, total: number }[]>

    const rows = await handler()
    expect(rows).toHaveLength(1001)
    expect(rows[1000]).toEqual({ slug: 'track-1000', total: 5 })
    expect(ranges).toEqual([[0, 999], [1000, 1999]])
  })

  it('throws on query error', async () => {
    restore = installNitroGlobals({
      supabaseAdmin: mockSupabaseAdmin(() => ({ data: null, error: { message: 'boom' } })),
    })

    const { likeCountersHandler } = await import('../../server/utils/likeCountersHandler')
    const handler = likeCountersHandler('release') as () => Promise<unknown>

    await expect(handler()).rejects.toThrow('boom')
  })
})
