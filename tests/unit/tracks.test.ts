import { describe, expect, it } from 'vitest'
import { splitTitleByArtists, splitTrackArtists } from '../../app/utils/tracks'

describe('splitTrackArtists', () => {
  it('splits multiple artists with matching slugs', () => {
    expect(splitTrackArtists('ExoFlux & Frog Prog', 'exoflux,frog-prog')).toEqual([
      { name: 'ExoFlux', slug: 'exoflux' },
      { name: 'Frog Prog', slug: 'frog-prog' },
    ])
  })

  it('keeps names unlinked when slug count mismatches', () => {
    expect(splitTrackArtists('ExoFlux & Frog Prog', 'exoflux')).toEqual([
      { name: 'ExoFlux', slug: null },
      { name: 'Frog Prog', slug: null },
    ])
  })
})

describe('splitTitleByArtists', () => {
  const artists = [
    { slug: 'frog-prog', title: 'Frog Prog' },
    { slug: 'eleexr', title: 'EleexR' },
  ]

  it('links a remix artist inside the title', () => {
    expect(splitTitleByArtists('Zemnosis (Frog Prog Rmx)', artists)).toEqual([
      { text: 'Zemnosis (', slug: null },
      { text: 'Frog Prog', slug: 'frog-prog' },
      { text: ' Rmx)', slug: null },
    ])
  })

  it('returns the whole title when no artist matches', () => {
    expect(splitTitleByArtists('Mind Tonal', artists)).toEqual([
      { text: 'Mind Tonal', slug: null },
    ])
  })

  it('links feat and remix artists in one title', () => {
    const pool = [
      { slug: 'omega-sound', title: 'Omega Sound' },
      { slug: 'kauyumari', title: 'Kauyumari' },
    ]
    expect(splitTitleByArtists('Kaax (feat. Omega Sound) (Kauyumari Rmx)', pool)).toEqual([
      { text: 'Kaax (feat. ', slug: null },
      { text: 'Omega Sound', slug: 'omega-sound' },
      { text: ') (', slug: null },
      { text: 'Kauyumari', slug: 'kauyumari' },
      { text: ' Rmx)', slug: null },
    ])
  })

  it('does not match artist names inside longer words', () => {
    expect(splitTitleByArtists('Zealous', [{ slug: 'zea', title: 'Zea' }])).toEqual([
      { text: 'Zealous', slug: null },
    ])
  })

  it('returns identical segments across repeated calls with the same artists list', () => {
    const artists = [
      { slug: 'boggy-elf', title: 'Boggy Elf' },
      { slug: 'irukanji', title: 'Irukanji' },
    ]
    const first = splitTitleByArtists('Boggy Elf - Dream', artists)
    const second = splitTitleByArtists('Boggy Elf - Dream', artists)
    expect(second).toEqual(first)
    expect(splitTitleByArtists('Irukanji - Tamed Siren', artists)).toEqual([
      { text: 'Irukanji', slug: 'irukanji' },
      { text: ' - Tamed Siren', slug: null },
    ])
  })
})
