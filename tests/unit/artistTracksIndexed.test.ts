import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const rows = [
  { slug: 'linked-track', title: 'Linked', artist_name: 'E.R.S.', artist_slug: 'ers', bpm: 90, audio_url: 'https://cdn/a.mp3', release_slug: 'rel-1', track_number: 1 },
  { slug: 'other-track', title: 'Other', artist_name: 'Other', artist_slug: 'other', bpm: 80, audio_url: 'https://cdn/b.mp3', release_slug: 'rel-1', track_number: 2 },
]

const GLOBALS = [
  'defineCachedEventHandler', 'catalogCacheOptions', 'createError', 'getRouterParam',
  'fetchAllCatalogTrackRows', 'isSupabaseCatalogSource', 'useSupabase',
  'fetchArtistTrackSlugs',
]

describe('artist tracks endpoint with track_artists index', () => {
  beforeEach(() => {
    const g = globalThis as Record<string, unknown>
    vi.resetModules()
    g.defineCachedEventHandler = (handler: unknown) => handler
    g.catalogCacheOptions = () => ({})
    g.createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    g.getRouterParam = (event: { context: { params: Record<string, string> } }, key: string) => event.context.params[key]
    g.fetchAllCatalogTrackRows = async () => rows
    g.isSupabaseCatalogSource = () => true
    g.useSupabase = () => ({
      from: (table: string) => ({
        select: () => {
          if (table === 'artists') {
            return Promise.resolve({ data: [{ slug: 'e-r-s', title: 'E.R.S.' }], error: null })
          }
          return { in: async () => ({ data: [{ slug: 'rel-1', cover_xl: '/cover.jpg' }], error: null }) }
        },
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of GLOBALS) delete (globalThis as Record<string, unknown>)[key]
  })

  it('selects tracks via track_artists membership, not CSV aliases', async () => {
    const g = globalThis as Record<string, unknown>
    g.fetchArtistTrackSlugs = vi.fn(async () => new Set(['linked-track']))

    const { default: handler } = await import('../../server/api/artist/[id]/tracks.get')
    const result = await (handler as (e: unknown) => Promise<{ slug: string }[]>)({ context: { params: { id: 'e-r-s' } } })

    expect(result.map(t => t.slug)).toEqual(['linked-track'])
    expect(g.fetchArtistTrackSlugs).toHaveBeenCalledWith('e-r-s')
  })

  it('falls back to CSV split when the index has no rows for the artist', async () => {
    const g = globalThis as Record<string, unknown>
    g.fetchArtistTrackSlugs = vi.fn(async () => new Set<string>())

    const { default: handler } = await import('../../server/api/artist/[id]/tracks.get')
    const result = await (handler as (e: unknown) => Promise<{ slug: string }[]>)({ context: { params: { id: 'ers' } } })

    expect(result.map(t => t.slug)).toEqual(['linked-track'])
  })
})
