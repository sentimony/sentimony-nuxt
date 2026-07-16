export type TitleSegment = { text: string, slug: string | null }
export type ArtistRef = { slug: string, title: string }

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildArtistPattern(artists: ArtistRef[]): RegExp | null {
  const known = artists.filter(a => a.title && a.slug)
  if (!known.length) return null
  const sorted = [...known].sort((a, b) => b.title.length - a.title.length)
  return new RegExp(
    `(?<![A-Za-z0-9])(?:${sorted.map(a => escapeRegExp(a.title)).join('|')})(?![A-Za-z0-9])`,
    'gi',
  )
}

export function splitTitleByArtists(title: string, artists: ArtistRef[]): TitleSegment[] {
  const pattern = buildArtistPattern(artists)
  if (!title || !pattern) return [{ text: title, slug: null }]

  const segments: TitleSegment[] = []
  let cursor = 0

  for (const match of title.matchAll(pattern)) {
    const index = match.index!
    if (index > cursor) segments.push({ text: title.slice(cursor, index), slug: null })
    const artist = artists.find(a => a.title.toLowerCase() === match[0].toLowerCase())
    segments.push({ text: match[0], slug: artist?.slug ?? null })
    cursor = index + match[0].length
  }

  if (cursor < title.length) segments.push({ text: title.slice(cursor), slug: null })
  return segments
}

export function titleMentionsArtist(title: string, artist: ArtistRef): boolean {
  const pattern = buildArtistPattern([artist])
  if (!pattern) return false
  return pattern.test(title)
}
