import { expandReleaseTracks, type CatalogTrack, type ReleaseTrackRow } from './releaseTracklist'

type FirebaseNode = Record<string, unknown>
type FirebaseCollection = Record<string, FirebaseNode>

export type FirebaseTrack = ReleaseTrackRow

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

export function parseTrackParagraph(
  paragraph: string,
  releaseSlug: string,
  index: number,
  artistByTitle: Map<string, string>,
): FirebaseTrack {
  const numMatch = paragraph.match(/<small>(\d+)\.<\/small>/)
  const trackNumber = numMatch ? Number.parseInt(numMatch[1]!, 10) : index + 1

  const withoutBpm = paragraph.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/i, '')
  const prefixMatch = withoutBpm.match(/^<small>\d+\.<\/small>[^<]*((?:<b>.*?<\/b>(?:\s*&(?:amp;)?\s*)?)+)\s*-\s*/)
  const artistHtml = prefixMatch ? prefixMatch[1]! : (withoutBpm.match(/<b>.*?<\/b>/)?.[0] ?? '')
  const artistNames = [...artistHtml.matchAll(/<b>(.*?)<\/b>/g)].map(m => m[1]!.trim()).filter(Boolean)
  const artistName = artistNames.join(' & ')
  const artistSlug = artistNames
    .map(name => artistByTitle.get(name.toLowerCase()) || slugifyFirebaseTrackPart(name))
    .join(',')

  const titleRaw = prefixMatch
    ? withoutBpm.slice(prefixMatch[0].length)
    : withoutBpm.replace(/^<small>\d+\.<\/small>[^<]*<b>.*?<\/b>\s*-\s*/, '')
  const title = titleRaw.replace(/<[^>]+>/g, '').replace(/\s*\(\d+(?:-\d+)?bpm\)\s*$/i, '').trim()

  const bpmMatch = paragraph.match(/\((\d+)(?:-(\d+))?bpm\)/i)
  const parsedBpm = bpmMatch ? Number.parseInt(bpmMatch[1]!, 10) : null
  const bpm = parsedBpm === 0 ? null : parsedBpm

  return {
    slug: slugifyFirebaseTrackPart(`${artistName} ${title}`),
    release_slug: releaseSlug,
    track_number: trackNumber,
    title,
    artist_name: artistName,
    artist_slug: artistSlug,
    bpm,
    audio_url: null,
  }
}

function toCatalogTrack(node: FirebaseNode): CatalogTrack | null {
  if (typeof node.slug !== 'string' || typeof node.title !== 'string') return null
  return {
    slug: node.slug,
    title: node.title,
    artist_slug: typeof node.artist_slug === 'string' ? node.artist_slug : '',
    artist_name: typeof node.artist_name === 'string' ? node.artist_name : '',
    bpm: typeof node.bpm === 'number' ? node.bpm : null,
    audio_url: typeof node.audio_url === 'string' ? node.audio_url : null,
  }
}

export async function fetchFirebaseCatalogTracks(): Promise<Map<string, CatalogTrack>> {
  const stored = await fetchFirebaseCollection('tracks')
  const map = new Map<string, CatalogTrack>()
  for (const node of Object.values(stored)) {
    const track = toCatalogTrack(node)
    if (track) map.set(track.slug, track)
  }
  return map
}

async function parseCompactTracks(release: FirebaseNode, releaseSlug: string): Promise<FirebaseTrack[]> {
  const artists = await fetchFirebaseCollection('artists')
  const artistByTitle = buildArtistTitleMap(artists)
  const tracklist = Array.isArray(release.tracklistCompact) ? release.tracklistCompact : []

  return tracklist
    .map((item, index) => {
      const paragraph = typeof item === 'object' && item && 'p' in item ? String(item.p ?? '') : ''
      return parseTrackParagraph(paragraph, releaseSlug, index, artistByTitle)
    })
    .filter(track => track.title)
}

export async function fetchFirebaseTracksForRelease(releaseSlug: string): Promise<FirebaseTrack[]> {
  const release = await fetchFirebaseEntity('releases', releaseSlug)
  if (!isPublicEntity(release)) return []

  if (Array.isArray(release.tracklist)) {
    const tracksBySlug = await fetchFirebaseCatalogTracks()
    return expandReleaseTracks(release, tracksBySlug)
  }

  return await parseCompactTracks(release, releaseSlug)
}

export async function fetchAllFirebaseTracks(): Promise<FirebaseTrack[]> {
  const [releases, tracksBySlug] = await Promise.all([
    fetchFirebaseCollection('releases'),
    fetchFirebaseCatalogTracks(),
  ])

  const tracks: FirebaseTrack[] = []
  for (const [releaseSlug, release] of Object.entries(releases)) {
    if (!isPublicEntity(release)) continue

    if (Array.isArray(release.tracklist)) {
      tracks.push(...expandReleaseTracks({ ...release, slug: releaseSlug }, tracksBySlug))
      continue
    }

    tracks.push(...await parseCompactTracks(release, releaseSlug))
  }

  return tracks
}
