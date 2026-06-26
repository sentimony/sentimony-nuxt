const isDev = process.env.NODE_ENV === 'development'

type Artist = Record<string, unknown> & { slug: string }
type Release = Record<string, unknown> & { slug: string }

type TrackRow = {
  slug: string
  title: string
  release_slug: string
  artist_slug: string
  artist_name: string
  track_number: number
  bpm: number | null
}

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing track slug' })

    const { allTracks, track } = await findTrack(id)

    if (!track) {
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }

    const artistSlugs = (track.artist_slug || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const [releaseResult, artistsResult, siblingResult, likeCountResult] = await Promise.all([
      fetchRelease(track.release_slug),
      fetchArtists(artistSlugs),
      fetchTracksForRelease(track.release_slug),
      fetchLikeCount('track_likes', 'track_slug', track.slug),
    ])

    const release = releaseResult
    const artists = artistsResult as Artist[]
    const releaseTracks = siblingResult as TrackRow[]

    const artistsSorted = [...artists].sort((a, b) => {
      const ai = artistSlugs.indexOf(a.slug)
      const bi = artistSlugs.indexOf(b.slug)
      return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi)
    })

    let similarTracks: TrackRow[] = []
    if (artistSlugs.length) {
      similarTracks = allTracks
        .filter(item => item.slug !== track.slug)
        .filter(item => artistSlugs.some(slug => item.artist_slug.split(',').map(s => s.trim()).includes(slug)))
        .slice(0, 8)
    }

    return {
      track,
      release,
      artists: artistsSorted,
      releaseTracks,
      similarTracks,
      likeCount: likeCountResult,
    }
  },
  catalogCacheOptions(),
)

async function fetchRelease(releaseSlug: string): Promise<Release | null> {
  if (isSupabaseCatalogSource()) {
    const { data } = await useSupabase()
      .from('releases')
      .select('*')
      .eq('slug', releaseSlug)
      .eq('visible', true)
      .single()

    return data ? mapReleaseFromSupabase(data) as Release : null
  }

  const data = await fetchFirebaseEntity('releases', releaseSlug)
  return isPublicEntity(data) ? data as Release : null
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

async function fetchTracksForRelease(releaseSlug: string): Promise<TrackRow[]> {
  if (isSupabaseCatalogSource()) {
    const { data } = await supabaseAdmin()
      .from('tracks')
      .select('slug, title, release_slug, artist_slug, artist_name, track_number, bpm')
      .eq('release_slug', releaseSlug)
      .order('track_number')

    return (data ?? []) as TrackRow[]
  }

  return await fetchFirebaseTracksForRelease(releaseSlug) as TrackRow[]
}

async function fetchAllSupabaseTracks(): Promise<TrackRow[]> {
  const { data, error } = await supabaseAdmin()
    .from('tracks')
    .select('slug, title, release_slug, artist_slug, artist_name, track_number, bpm')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []) as TrackRow[]
}

async function findTrack(id: string): Promise<{ allTracks: TrackRow[], track: TrackRow | undefined }> {
  if (isSupabaseCatalogSource()) {
    const supabaseTracks = await fetchAllSupabaseTracks()
    const directTrack = supabaseTracks.find(track => track.slug === id)
    if (directTrack) return { allTracks: supabaseTracks, track: directTrack }

    const firebaseTrack = (await fetchAllFirebaseTracks()).find(track => track.slug === id)
    const equivalentTrack = firebaseTrack
      ? supabaseTracks.find(track =>
          track.release_slug === firebaseTrack.release_slug
          && track.track_number === firebaseTrack.track_number
        )
      : undefined

    return { allTracks: supabaseTracks, track: equivalentTrack ?? firebaseTrack as TrackRow | undefined }
  }

  const firebaseTracks = await fetchAllFirebaseTracks()
  const directTrack = firebaseTracks.find(track => track.slug === id)
  if (directTrack) return { allTracks: firebaseTracks, track: directTrack }

  const supabaseTracks = await fetchAllSupabaseTracks().catch(() => [])
  const supabaseTrack = supabaseTracks.find(track => track.slug === id)
  const equivalentTrack = supabaseTrack
    ? firebaseTracks.find(track =>
        track.release_slug === supabaseTrack.release_slug
        && track.track_number === supabaseTrack.track_number
      )
    : undefined

  return { allTracks: firebaseTracks, track: equivalentTrack ?? supabaseTrack }
}
