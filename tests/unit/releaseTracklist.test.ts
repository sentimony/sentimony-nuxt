import { describe, it, expect } from 'vitest'
import { hydrateReleaseTracklist } from '../../server/utils/releaseTracklist'
import type { CatalogTrack } from '../../server/utils/releaseTracklist'

describe('hydrateReleaseTracklist', () => {
  const tracksBySlug = new Map<string, CatalogTrack>([
    ['boggy-elf-dream-of-ashvattha-in', {
      slug: 'boggy-elf-dream-of-ashvattha-in',
      title: 'Dream Of Ashvattha (In)',
      artist_name: 'Boggy Elf',
      artist_slug: 'boggy-elf',
      bpm: 80,
      audio_url: 'https://r2.example/01.mp3',
    }],
  ])

  it('hydrates slugs in release order and derives track_number', () => {
    const release = { slug: 'va-tempo-syndicate', tracklist: ['boggy-elf-dream-of-ashvattha-in'] }
    expect(hydrateReleaseTracklist(release, tracksBySlug)).toEqual([{
      track_number: 1,
      slug: 'boggy-elf-dream-of-ashvattha-in',
      artist: 'Boggy Elf',
      artist_slug: 'boggy-elf',
      title: 'Dream Of Ashvattha (In)',
      bpm: 80,
      url: 'https://r2.example/01.mp3',
    }])
  })

  it('skips slugs missing from the catalog but keeps positions', () => {
    const release = { slug: 'x', tracklist: ['missing', 'boggy-elf-dream-of-ashvattha-in'] }
    const result = hydrateReleaseTracklist(release, tracksBySlug)
    expect(result).toHaveLength(1)
    expect(result[0]!.track_number).toBe(2)
  })

  it('returns empty array when release has no tracklist', () => {
    expect(hydrateReleaseTracklist({ slug: 'x' }, tracksBySlug)).toEqual([])
  })
})
