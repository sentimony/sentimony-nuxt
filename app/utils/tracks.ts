export interface TrackArtistRef {
  name: string
  slug: string | null
}

export interface TitleSegment {
  text: string
  slug: string | null
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

type CompiledArtists = {
  known: { slug: string, title: string }[]
  pattern: RegExp | null
}

const compiledCache = new WeakMap<object, CompiledArtists>()

function compileArtists(artists: { slug: string, title?: string }[]): CompiledArtists {
  const cached = compiledCache.get(artists)
  if (cached) return cached

  const known = artists
    .filter((artist): artist is { slug: string, title: string } => Boolean(artist.title && artist.slug))
    .sort((a, b) => b.title.length - a.title.length)

  const pattern = known.length
    ? new RegExp(
        `(?<![A-Za-z0-9])(?:${known.map(artist => escapeRegExp(artist.title)).join('|')})(?![A-Za-z0-9])`,
        'gi',
      )
    : null

  const compiled = { known, pattern }
  compiledCache.set(artists, compiled)
  return compiled
}

export function splitTitleByArtists(title: string, artists: { slug: string, title?: string }[]): TitleSegment[] {
  const { known, pattern } = compileArtists(artists)

  if (!title || !pattern) return [{ text: title, slug: null }]

  const segments: TitleSegment[] = []
  let cursor = 0

  for (const match of title.matchAll(pattern)) {
    const index = match.index!
    if (index > cursor) segments.push({ text: title.slice(cursor, index), slug: null })
    const artist = known.find(a => a.title.toLowerCase() === match[0].toLowerCase())
    segments.push({ text: match[0], slug: artist?.slug ?? null })
    cursor = index + match[0].length
  }

  if (cursor < title.length) segments.push({ text: title.slice(cursor), slug: null })
  return segments
}

export function splitTrackArtists(artistName: string, artistSlug?: string | null): TrackArtistRef[] {
  const names = (artistName || '').split(/\s*&\s*/).map(name => name.trim()).filter(Boolean)
  const slugs = (artistSlug || '').split(',').map(slug => slug.trim()).filter(Boolean)

  return names.map((name, index) => ({
    name,
    slug: names.length === slugs.length ? slugs[index]! : (names.length === 1 ? slugs[0] ?? null : null),
  }))
}
