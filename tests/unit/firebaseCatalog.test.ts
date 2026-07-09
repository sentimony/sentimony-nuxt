import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchFirebaseEntity, parseTrackParagraph } from '../../server/utils/firebaseCatalog'

describe('fetchFirebaseEntity', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete (globalThis as Record<string, unknown>).useRuntimeConfig
    delete (globalThis as Record<string, unknown>).$fetch
  })

  it('finds entities by slug when Firebase stores the collection under numeric keys', async () => {
    ;(globalThis as Record<string, unknown>).useRuntimeConfig = () => ({
      public: { firebaseBase: 'https://example.firebaseio.com' },
    })

    ;(globalThis as Record<string, unknown>).$fetch = vi.fn(async (url: string) => {
      if (url === 'https://example.firebaseio.com/artists/irukanji.json') return null
      if (url === 'https://example.firebaseio.com/artists.json') {
        return {
          0: { slug: 'irukanji', title: 'Irukanji', visible: true },
          1: { slug: 'hidden', title: 'Hidden', visible: false },
        }
      }
      return null
    })

    await expect(fetchFirebaseEntity('artists', 'irukanji')).resolves.toEqual({
      slug: 'irukanji',
      title: 'Irukanji',
      visible: true,
    })
  })
})

describe('parseTrackParagraph', () => {
  it('uses the lower bound of a bpm range', () => {
    const track = parseTrackParagraph(
      '<small>1.</small> <b>Artist</b> - Ranged Track <small>(130-160bpm)</small>',
      'test-release',
      0,
      new Map(),
    )

    expect(track.bpm).toBe(130)
  })

  it('strips a bpm marker not wrapped in small from the title', () => {
    const track = parseTrackParagraph(
      '<small>2.</small> <b>Artist</b> - Bare Track (140bpm)',
      'test-release',
      1,
      new Map(),
    )

    expect(track.title).toBe('Bare Track')
    expect(track.bpm).toBe(140)
  })

  it('parses multiple bold artists joined by &', () => {
    const track = parseTrackParagraph(
      '<small>5.</small> <b>ExoFlux</b> & <b>Frog Prog</b> - VIsions <small>(132bpm)</small>',
      'test-release',
      4,
      new Map([['exoflux', 'exoflux'], ['frog prog', 'frog-prog']]),
    )

    expect(track.slug).toBe('exoflux-frog-prog-visions')
    expect(track.artist_name).toBe('ExoFlux & Frog Prog')
    expect(track.artist_slug).toBe('exoflux,frog-prog')
    expect(track.title).toBe('VIsions')
    expect(track.bpm).toBe(132)
  })

  it('keeps a bold remix artist inside the title out of the artist list', () => {
    const track = parseTrackParagraph(
      '<small>7.</small> <b>EleexR</b> - Zemnosis (<b>Frog Prog</b> Rmx) <small>(138bpm)</small>',
      'test-release',
      6,
      new Map([['eleexr', 'eleexr'], ['frog prog', 'frog-prog']]),
    )

    expect(track.slug).toBe('eleexr-zemnosis-frog-prog-rmx')
    expect(track.artist_name).toBe('EleexR')
    expect(track.artist_slug).toBe('eleexr')
    expect(track.title).toBe('Zemnosis (Frog Prog Rmx)')
  })
})
