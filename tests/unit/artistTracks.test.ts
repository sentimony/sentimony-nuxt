import { describe, expect, it } from 'vitest'
import { splitTitleByArtists, titleMentionsArtist } from '../../server/utils/artistTracks'

const frogProg = { slug: 'frog-prog', title: 'Frog Prog' }

describe('titleMentionsArtist', () => {
  it('matches an artist named inside a remix title', () => {
    expect(titleMentionsArtist('Zemnosis (Frog Prog Rmx)', frogProg)).toBe(true)
  })

  it('does not match on a partial word', () => {
    expect(titleMentionsArtist('Frogprogging', frogProg)).toBe(false)
  })

  it('returns false for empty artist title', () => {
    expect(titleMentionsArtist('Anything', { slug: 'x', title: '' })).toBe(false)
  })
})

describe('splitTitleByArtists (server)', () => {
  const artists = [frogProg, { slug: 'eleexr', title: 'EleexR' }]

  it('links every artist appearing in the display string', () => {
    const segments = splitTitleByArtists('EleexR - Zemnosis (Frog Prog Rmx)', artists)
    expect(segments.filter(s => s.slug).map(s => s.slug)).toEqual(['eleexr', 'frog-prog'])
  })

  it('returns a single plain segment when no artist matches', () => {
    expect(splitTitleByArtists('Unknown - Track', artists)).toEqual([
      { text: 'Unknown - Track', slug: null },
    ])
  })
})
