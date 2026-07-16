import type { ArtistRef } from '../../../utils/artistTracks'
import { splitTitleByArtists, titleMentionsArtist } from '../../../utils/artistTracks'

const RELEASE_FALLBACK: Record<string, string> = {
  hagen: 'va-tempo-syndicate',
}

export default defineCachedEventHandler(async (event) => {
  const artistSlug = getRouterParam(event, 'id')
  if (!artistSlug) throw createError({ statusCode: 400, statusMessage: 'Missing artist id' })

  const [allRows, artists] = await Promise.all([
    fetchAllCatalogTrackRows(),
    fetchArtistRefs(),
  ])

  const self = artists.find(a => a.slug === artistSlug)

  let artistRows = allRows.filter((row) => {
    if (!row.audio_url) return false
    if (splitArtistSlugs(row.artist_slug).includes(artistSlug)) return true
    return self ? titleMentionsArtist(row.title, self) : false
  })

  const fallbackRelease = RELEASE_FALLBACK[artistSlug]
  if (!artistRows.length && fallbackRelease) {
    artistRows = allRows.filter(row => row.release_slug === fallbackRelease && !!row.audio_url)
  }

  if (!artistRows.length) return []

  const releaseSlugs = [...new Set(artistRows.map(row => row.release_slug))]
  const coverBySlug = await fetchReleaseCovers(releaseSlugs)

  const tracks = artistRows.map(row => ({
    slug: row.slug,
    title: row.title,
    artist_name: row.artist_name,
    artist_slug: row.artist_slug,
    displaySegments: splitTitleByArtists(`${row.artist_name} - ${row.title}`, artists),
    artistSegments: splitTitleByArtists(row.artist_name, artists),
    nameSegments: splitTitleByArtists(row.title, artists),
    url: row.audio_url as string,
    release_slug: row.release_slug,
    cover: coverBySlug.get(row.release_slug) ?? null,
  }))

  const countMap = await fetchLikeCounts('track_likes', 'track_slug', tracks.map(t => t.slug))

  return tracks.map(t => ({ ...t, like_count: countMap[t.slug] ?? 0 }))
}, catalogCacheOptions(60 * 5))

function splitArtistSlugs(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

async function fetchArtistRefs(): Promise<ArtistRef[]> {
  if (isSupabaseCatalogSource()) {
    const { data, error } = await useSupabase().from('artists').select('slug, title')
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return (data ?? [])
      .map(r => ({ slug: String(r.slug ?? ''), title: String(r.title ?? '') }))
      .filter(a => a.slug && a.title)
  }

  const data = await fetchFirebaseCollection('artists')
  const collection = pickListFields(data, ['slug', 'title'])
  const refs: ArtistRef[] = []
  for (const [key, value] of Object.entries(collection)) {
    const slug = typeof value.slug === 'string' ? value.slug : key
    const title = typeof value.title === 'string' ? value.title : ''
    if (slug && title) refs.push({ slug, title })
  }
  return refs
}

async function fetchReleaseCovers(slugs: string[]): Promise<Map<string, string | null>> {
  if (!slugs.length) return new Map()

  if (isSupabaseCatalogSource()) {
    const { data, error } = await useSupabase()
      .from('releases')
      .select('slug, cover_xl')
      .in('slug', slugs)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return new Map((data ?? []).map(r => [String(r.slug), (r.cover_xl as string) ?? null]))
  }

  const data = await fetchFirebaseCollection('releases')
  const collection = pickListFields(data, ['slug', 'cover_xl'], { visibleOnly: true })
  const wanted = new Set(slugs)
  const covers = new Map<string, string | null>()
  for (const [key, value] of Object.entries(collection)) {
    const slug = typeof value.slug === 'string' ? value.slug : key
    if (!wanted.has(slug)) continue
    covers.set(slug, typeof value.cover_xl === 'string' ? value.cover_xl : null)
  }
  return covers
}
