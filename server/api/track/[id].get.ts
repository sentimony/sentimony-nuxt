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

    const track = await findTrack(id)

    if (!track) {
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }

    const artistSlugs = (track.artist_slug || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const [releaseResult, artistsResult, siblingResult, likeCountResult, artistTracksResult] = await Promise.all([
      fetchRelease(track.release_slug),
      fetchArtists(artistSlugs),
      fetchTracksForRelease(track.release_slug),
      fetchLikeCount('track_likes', 'track_slug', track.slug),
      fetchTracksByArtists(artistSlugs),
    ])

    if (!releaseResult) {
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }

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
      similarTracks = (artistTracksResult as TrackRow[])
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

const TRACK_COLUMNS = 'slug, title, release_slug, artist_slug, artist_name, track_number, bpm'

async function fetchTracksForRelease(releaseSlug: string): Promise<TrackRow[]> {
  if (isSupabaseCatalogSource()) {
    const { data } = await supabaseAdmin()
      .from('tracks')
      .select(TRACK_COLUMNS)
      .eq('release_slug', releaseSlug)
      .order('track_number')

    return (data ?? []) as TrackRow[]
  }

  return await fetchFirebaseTracksForRelease(releaseSlug) as TrackRow[]
}

async function fetchSupabaseTrackBySlug(slug: string): Promise<TrackRow | undefined> {
  const { data, error } = await supabaseAdmin()
    .from('tracks')
    .select(TRACK_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? undefined) as TrackRow | undefined
}

async function fetchSupabaseTrackByPosition(releaseSlug: string, trackNumber: number): Promise<TrackRow | undefined> {
  const { data, error } = await supabaseAdmin()
    .from('tracks')
    .select(TRACK_COLUMNS)
    .eq('release_slug', releaseSlug)
    .eq('track_number', trackNumber)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? undefined) as TrackRow | undefined
}

async function fetchTracksByArtists(artistSlugs: string[]): Promise<TrackRow[]> {
  if (!artistSlugs.length) return []

  if (isSupabaseCatalogSource()) {
    const { data } = await supabaseAdmin()
      .from('tracks')
      .select(TRACK_COLUMNS)
      .or(artistSlugs.map(slug => `artist_slug.ilike.%${slug}%`).join(','))

    return (data ?? []) as TrackRow[]
  }

  return await fetchAllFirebaseTracks() as TrackRow[]
}

async function findTrack(id: string): Promise<TrackRow | undefined> {
  if (isSupabaseCatalogSource()) {
    const directTrack = await fetchSupabaseTrackBySlug(id)
    if (directTrack) return directTrack

    const firebaseTrack = (await fetchAllFirebaseTracks()).find(track => track.slug === id)
    if (!firebaseTrack) return undefined

    const equivalentTrack = await fetchSupabaseTrackByPosition(firebaseTrack.release_slug, firebaseTrack.track_number)
    return equivalentTrack ?? firebaseTrack as TrackRow
  }

  const firebaseTracks = await fetchAllFirebaseTracks()
  const directTrack = firebaseTracks.find(track => track.slug === id)
  if (directTrack) return directTrack

  const supabaseTrack = await fetchSupabaseTrackBySlug(id).catch(() => undefined)
  if (!supabaseTrack) return undefined

  return firebaseTracks.find(track =>
    track.release_slug === supabaseTrack.release_slug
    && track.track_number === supabaseTrack.track_number
  ) ?? supabaseTrack
}
