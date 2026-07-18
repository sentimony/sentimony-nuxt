import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const rows = [
  { slug: 'main-track', title: 'Main', artist_name: 'Zymosis', artist_slug: 'zymosis', bpm: 100, audio_url: null, release_slug: 'rel-1', track_number: 1 },
  { slug: 'alias-track', title: 'Alias', artist_name: 'E.R.S.', artist_slug: 'ers', bpm: 90, audio_url: null, release_slug: 'rel-1', track_number: 2 },
  { slug: 'csv-track', title: 'Csv', artist_name: 'Zymosis', artist_slug: 'zymosis', bpm: 85, audio_url: null, release_slug: 'rel-1', track_number: 3 },
  { slug: 'unrelated-track', title: 'Other', artist_name: 'Other', artist_slug: 'other', bpm: 80, audio_url: null, release_slug: 'rel-1', track_number: 4 },
]

const releaseRow = { slug: 'rel-1', date: '2020-01-01T00:00:00.000Z', visible: true }

const GLOBALS = [
  'defineCachedEventHandler', 'catalogCacheOptions', 'createError',
  'fetchAllCatalogTrackRows', 'isSupabaseCatalogSource', 'useSupabase',
  'mapReleaseFromSupabase', 'supabaseAdmin',
  'fetchTrackArtistSlugs', 'fetchCoArtistTrackSlugs',
  'fetchFirebaseEntitiesBySlugs', 'isPublicEntity',
]

function makeEvent(id: string) {
  return { context: { params: { id } } }
}

describe('track detail similar tracks', () => {
  beforeEach(() => {
    const g = globalThis as Record<string, unknown>
    vi.resetModules()
    g.defineCachedEventHandler = (handler: unknown) => handler
    g.catalogCacheOptions = () => ({})
    g.createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    g.fetchAllCatalogTrackRows = async () => rows
    g.mapReleaseFromSupabase = (row: Record<string, unknown>) => row
    g.useSupabase = () => ({
      from: () => ({
        select: () => ({ in: () => ({ eq: async () => ({ data: [releaseRow], error: null }) }) }),
      }),
    })
    g.supabaseAdmin = () => ({
      from: () => ({
        select: () => ({ in: async () => ({ data: [{ slug: 'zymosis', title: 'Zymosis' }], error: null }) }),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of GLOBALS) delete (globalThis as Record<string, unknown>)[key]
  })

  it('uses track_artists links in Supabase mode (catches CSV alias mismatches)', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => true
    g.fetchTrackArtistSlugs = vi.fn(async () => ['zymosis'])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set(['main-track', 'alias-track']))

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['alias-track'])
    expect(g.fetchCoArtistTrackSlugs).toHaveBeenCalledWith(['zymosis'])
  })

  it('falls back to CSV matching when track_artists is empty', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => true
    g.fetchTrackArtistSlugs = vi.fn(async () => [])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set<string>())

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['csv-track'])
  })

  it('falls back to CSV matching when the co-artist index is empty', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => true
    g.fetchTrackArtistSlugs = vi.fn(async () => ['zymosis'])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set<string>())

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['csv-track'])
    expect(g.fetchCoArtistTrackSlugs).toHaveBeenCalledWith(['zymosis'])
  })

  it('keeps CSV matching in Firebase mode without querying track_artists', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => false
    g.isPublicEntity = () => true
    g.fetchFirebaseEntitiesBySlugs = async (collection: string) =>
      collection === 'releases' ? [releaseRow] : [{ slug: 'zymosis', title: 'Zymosis' }]
    g.fetchTrackArtistSlugs = vi.fn(async () => ['must-not-be-called'])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set(['must-not-be-called']))

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['csv-track'])
    expect(g.fetchTrackArtistSlugs).not.toHaveBeenCalled()
    expect(g.fetchCoArtistTrackSlugs).not.toHaveBeenCalled()
  })
})
