import { describe, expect, it } from 'vitest'
import { buildTrackArtistRows } from '../../scripts/lib/track-artists.mjs'

describe('buildTrackArtistRows', () => {
  it('splits a multi-artist CSV preserving order via position', () => {
    expect(buildTrackArtistRows([
      { slug: 'collab-track', artist_slug: 'zymosis, cj-art' },
    ])).toEqual([
      { track_slug: 'collab-track', artist_slug: 'zymosis', position: 0 },
      { track_slug: 'collab-track', artist_slug: 'cj-art', position: 1 },
    ])
  })

  it('produces no rows for empty or missing artist_slug', () => {
    expect(buildTrackArtistRows([
      { slug: 'orphan-track', artist_slug: '' },
      { slug: 'null-track', artist_slug: null },
    ])).toEqual([])
  })

  it('trims entries and drops duplicate artists within one track', () => {
    expect(buildTrackArtistRows([
      { slug: 't', artist_slug: ' zymosis ,, zymosis , cj-art' },
    ])).toEqual([
      { track_slug: 't', artist_slug: 'zymosis', position: 0 },
      { track_slug: 't', artist_slug: 'cj-art', position: 1 },
    ])
  })
})
