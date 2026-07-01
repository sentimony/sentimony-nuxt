type FirebaseNode = Record<string, unknown>
type FirebaseCollection = Record<string, FirebaseNode>

export type FirebaseTrack = {
  slug: string
  title: string
  release_slug: string
  artist_slug: string
  artist_name: string
  track_number: number
  bpm: number | null
}

const isDev = process.env.NODE_ENV === 'development'

function firebaseUrl(path: string) {
  const { public: { firebaseBase } } = useRuntimeConfig()
  const normalizedPath = path.replace(/^\/+|\/+$/g, '')
  const url = `${firebaseBase}/${normalizedPath}.json`
  return isDev ? `${url}?_t=${Date.now()}` : url
}

export function slugifyFirebaseTrackPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function fetchFirebaseNode<T = FirebaseNode>(path: string): Promise<T | null> {
  return await $fetch<T | null>(firebaseUrl(path)).catch(() => null) as T | null
}

export async function fetchFirebaseCollection(path: string): Promise<FirebaseCollection> {
  const data = await fetchFirebaseNode<FirebaseCollection>(path)
  return data && typeof data === 'object' ? data : {}
}

export async function fetchFirebaseEntity(collection: string, slug: string): Promise<(FirebaseNode & { slug: string }) | null> {
  const data = await fetchFirebaseNode<FirebaseNode>(`${collection}/${slug}`)
  if (data) return { ...data, slug }

  const collectionData = await fetchFirebaseCollection(collection)
  const entity = Object.values(collectionData).find(item => item?.slug === slug)
  return entity ? { ...entity, slug } : null
}

export async function fetchFirebaseEntitiesBySlugs(collection: string, slugs: string[]) {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))]
  const nodes = await Promise.all(uniqueSlugs.map(slug => fetchFirebaseEntity(collection, slug)))
  return nodes.filter((node): node is FirebaseNode & { slug: string } => Boolean(node))
}

function buildArtistTitleMap(artists: FirebaseCollection) {
  const map = new Map<string, string>()
  for (const [slug, artist] of Object.entries(artists)) {
    const title = typeof artist.title === 'string' ? artist.title : ''
    if (title) map.set(title.toLowerCase(), slug)
  }
  return map
}

function parseTrackParagraph(
  paragraph: string,
  releaseSlug: string,
  index: number,
  artistByTitle: Map<string, string>,
): FirebaseTrack {
  const numMatch = paragraph.match(/<small>(\d+)\.<\/small>/)
  const trackNumber = numMatch ? Number.parseInt(numMatch[1]!, 10) : index + 1

  const artistMatch = paragraph.match(/<b>(.*?)<\/b>/)
  const artistName = artistMatch ? artistMatch[1]!.trim() : ''
  const artistSlug = artistByTitle.get(artistName.toLowerCase()) || slugifyFirebaseTrackPart(artistName)

  const withoutBpm = paragraph.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/i, '')
  const titleRaw = withoutBpm.replace(/^<small>\d+\.<\/small>\s*<b>.*?<\/b>\s*-\s*/, '')
  const title = titleRaw.replace(/<\/?b>/g, '').trim()

  const bpmMatch = paragraph.match(/\((\d+)(?:-(\d+))?bpm\)/i)
  const parsedBpm = bpmMatch ? Number.parseInt(bpmMatch[2] ?? bpmMatch[1]!, 10) : null
  const bpm = parsedBpm === 0 ? null : parsedBpm

  return {
    slug: `${releaseSlug}-${trackNumber}`,
    release_slug: releaseSlug,
    track_number: trackNumber,
    title,
    artist_name: artistName,
    artist_slug: artistSlug,
    bpm,
  }
}

export async function fetchFirebaseTracksForRelease(releaseSlug: string) {
  const [release, artists] = await Promise.all([
    fetchFirebaseEntity('releases', releaseSlug),
    fetchFirebaseCollection('artists'),
  ])

  if (!isPublicEntity(release)) return []

  const artistByTitle = buildArtistTitleMap(artists)
  const tracklist = Array.isArray(release.tracklistCompact) ? release.tracklistCompact : []

  return tracklist
    .map((item, index) => {
      const paragraph = typeof item === 'object' && item && 'p' in item ? String(item.p ?? '') : ''
      return parseTrackParagraph(paragraph, releaseSlug, index, artistByTitle)
    })
    .filter(track => track.title)
}

export async function fetchAllFirebaseTracks() {
  const [releases, artists] = await Promise.all([
    fetchFirebaseCollection('releases'),
    fetchFirebaseCollection('artists'),
  ])
  const artistByTitle = buildArtistTitleMap(artists)
  const tracks: FirebaseTrack[] = []

  for (const [releaseSlug, release] of Object.entries(releases)) {
    if (!isPublicEntity(release)) continue

    const tracklist = Array.isArray(release.tracklistCompact) ? release.tracklistCompact : []
    for (const [index, item] of tracklist.entries()) {
      const paragraph = typeof item === 'object' && item && 'p' in item ? String(item.p ?? '') : ''
      const track = parseTrackParagraph(paragraph, releaseSlug, index, artistByTitle)
      if (track.title) tracks.push(track)
    }
  }

  return tracks
}
