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

    const admin = supabaseAdmin()

    const { data: track, error: trackError } = await admin
      .from('tracks')
      .select('slug, title, release_slug, artist_slug, artist_name, track_number, bpm')
      .eq('slug', id)
      .single<TrackRow>()

    if (trackError || !track) {
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }

    const artistSlugs = (track.artist_slug || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const [releaseResult, artistsResult, siblingResult, likeCountResult] = await Promise.all([
      fetchRelease(track.release_slug),
      artistSlugs.length
        ? admin.from('artists').select('*').in('slug', artistSlugs)
        : Promise.resolve({ data: [] as Artist[], error: null }),
      admin
        .from('tracks')
        .select('slug, title, release_slug, artist_slug, artist_name, track_number, bpm')
        .eq('release_slug', track.release_slug)
        .order('track_number'),
      admin
        .from('track_likes')
        .select('*', { count: 'exact', head: true })
        .eq('track_slug', track.slug),
    ])

    const release = releaseResult
    const artists = (artistsResult.data ?? []) as Artist[]
    const releaseTracks = ((siblingResult.data ?? []) as TrackRow[])

    const artistsSorted = [...artists].sort((a, b) => {
      const ai = artistSlugs.indexOf(a.slug)
      const bi = artistSlugs.indexOf(b.slug)
      return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi)
    })

    let similarTracks: TrackRow[] = []
    if (artistSlugs.length) {
      const { data } = await admin
        .from('tracks')
        .select('slug, title, release_slug, artist_slug, artist_name, track_number, bpm')
        .neq('slug', track.slug)
        .or(artistSlugs.map(s => `artist_slug.ilike.%${s}%`).join(','))
        .limit(8)
      similarTracks = (data ?? []) as TrackRow[]
    }

    return {
      track,
      release,
      artists: artistsSorted,
      releaseTracks,
      similarTracks,
      likeCount: likeCountResult.count ?? 0,
    }
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  },
)

async function fetchRelease(releaseSlug: string): Promise<Release | null> {
  if (process.env.RELEASES_SOURCE === 'supabase') {
    const { data } = await useSupabase()
      .from('releases')
      .select('*')
      .eq('slug', releaseSlug)
      .single()
    return data ? (mapReleaseFromSupabase(data) as unknown as Release) : null
  }

  try {
    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/releases/${releaseSlug}.json`
    const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)
    return (data as Release) || null
  } catch {
    return null
  }
}
