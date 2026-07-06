import type { ReleaseTrackRow } from '../../utils/releaseTracklist'

type Artist = Record<string, unknown> & { slug: string }
type Release = Record<string, unknown> & { slug: string }

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing track slug' })

    const rows = await fetchAllCatalogTrackRows()
    const occurrences = rows.filter(row => row.slug === id)

    if (!occurrences.length) {
      const legacy = id.match(/^(.+)-(\d+)$/)
      if (legacy) {
        const canonical = rows.find(
          row => row.release_slug === legacy[1] && row.track_number === Number(legacy[2]),
        )
        if (canonical) return { redirect: canonical.slug }
      }
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }

    const releases = await fetchReleasesBySlugs(occurrences.map(o => o.release_slug))
    if (!releases.length) throw createError({ statusCode: 404, statusMessage: 'Track not found' })

    releases.sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? '')))
    const release = releases[0]!
    const track = occurrences.find(o => o.release_slug === release.slug) ?? occurrences[0]!

    const artistSlugs = (track.artist_slug || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const [artists, likeCount] = await Promise.all([
      fetchArtists(artistSlugs),
      fetchLikeCount('track_likes', 'track_slug', track.slug),
    ])

    const artistsSorted = [...artists].sort((a, b) => {
      const ai = artistSlugs.indexOf(a.slug)
      const bi = artistSlugs.indexOf(b.slug)
      return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi)
    })

    const releaseTracks = rows.filter(row => row.release_slug === release.slug)

    const seenSimilar = new Set<string>([track.slug])
    const similarTracks: ReleaseTrackRow[] = []
    for (const row of rows) {
      if (seenSimilar.has(row.slug)) continue
      const rowArtists = row.artist_slug.split(',').map(s => s.trim())
      if (!artistSlugs.some(slug => rowArtists.includes(slug))) continue
      seenSimilar.add(row.slug)
      similarTracks.push(row)
      if (similarTracks.length >= 8) break
    }

    return {
      track,
      release,
      releases,
      artists: artistsSorted,
      releaseTracks,
      similarTracks,
      likeCount,
    }
  },
  catalogCacheOptions(),
)

async function fetchReleasesBySlugs(slugs: string[]): Promise<Release[]> {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))]
  if (!uniqueSlugs.length) return []

  if (isSupabaseCatalogSource()) {
    const { data, error } = await useSupabase()
      .from('releases')
      .select('*')
      .in('slug', uniqueSlugs)
      .eq('visible', true)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return (data ?? []).map(row => mapReleaseFromSupabase(row)) as Release[]
  }

  const nodes = await fetchFirebaseEntitiesBySlugs('releases', uniqueSlugs)
  return nodes.filter(node => isPublicEntity(node)) as Release[]
}

async function fetchArtists(artistSlugs: string[]) {
  if (!artistSlugs.length) return []

  if (isSupabaseCatalogSource()) {
    const { data } = await supabaseAdmin()
      .from('artists')
      .select('*')
      .in('slug', artistSlugs)
      .eq('visible', true)

    return (data ?? []) as Artist[]
  }

  return await fetchFirebaseEntitiesBySlugs('artists', artistSlugs) as Artist[]
}
