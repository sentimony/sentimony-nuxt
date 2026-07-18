import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const releases = [
  { slug: 'release-old', date: '2020-01-01T00:00:00.000Z', tracklist: ['track-one', 'track-two'] },
  { slug: 'release-new', date: '2021-01-01T00:00:00.000Z', tracklist: ['track-three'] },
]

const trackRows = [
  { slug: 'track-one', title: 'One', artist_name: 'A', artist_slug: 'a', bpm: 100, audio_url: null },
  { slug: 'track-two', title: 'Two', artist_name: 'B', artist_slug: 'b', bpm: null, audio_url: 'https://cdn/two.mp3' },
  { slug: 'track-three', title: 'Three', artist_name: 'A', artist_slug: 'a', bpm: 120, audio_url: null },
]

describe('fetchAllCatalogTrackRows (tracks page data contract)', () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as Record<string, unknown>).createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    ;(globalThis as Record<string, unknown>).isSupabaseCatalogSource = () => true
    ;(globalThis as Record<string, unknown>).useSupabase = () => ({
      from: () => ({
        select: () => ({ eq: async () => ({ data: releases, error: null }) }),
      }),
    })
    ;(globalThis as Record<string, unknown>).supabaseAdmin = () => ({
      from: () => ({ select: async () => ({ data: trackRows, error: null }) }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of ['createError', 'isSupabaseCatalogSource', 'useSupabase', 'supabaseAdmin']) {
      delete (globalThis as Record<string, unknown>)[key]
    }
  })

  it('returns a non-empty row per tracklist entry with derived track numbers', async () => {
    const { fetchAllCatalogTrackRows } = await import('../../server/utils/catalogTracks')
    const rows = await fetchAllCatalogTrackRows()

    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ slug: 'track-three', release_slug: 'release-new', track_number: 1 })
    expect(rows[1]).toMatchObject({ slug: 'track-one', release_slug: 'release-old', track_number: 1 })
    expect(rows[2]).toMatchObject({ slug: 'track-two', release_slug: 'release-old', track_number: 2 })
  })

  it('keeps track payload fields used by the tracks page', async () => {
    const { fetchAllCatalogTrackRows } = await import('../../server/utils/catalogTracks')
    const rows = await fetchAllCatalogTrackRows()

    expect(rows[2]).toMatchObject({ artist_slug: 'b', bpm: null, audio_url: 'https://cdn/two.mp3' })
  })
})
