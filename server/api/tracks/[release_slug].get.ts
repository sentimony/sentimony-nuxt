const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(async (event) => {
  const releaseSlug = getRouterParam(event, 'release_slug')
  if (!releaseSlug) throw createError({ statusCode: 400, statusMessage: 'Missing release_slug' })

  if (isSupabaseCatalogSource()) {
    const { data: tracks, error } = await supabaseAdmin()
      .from('tracks')
      .select('slug, title, release_slug, artist_slug, artist_name, track_number, bpm')
      .eq('release_slug', releaseSlug)
      .order('track_number')

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    if (!tracks?.length) return []

    const countMap = await fetchLikeCounts('track_likes', 'track_slug', tracks.map(t => t.slug))
    return tracks.map(t => ({ ...t, like_count: countMap[t.slug] ?? 0 }))
  }

  const releaseTracks = await fetchFirebaseTracksForRelease(releaseSlug)

  if (!releaseTracks.length) return []

  const countMap = await fetchLikeCounts('track_likes', 'track_slug', releaseTracks.map(t => t.slug))

  return releaseTracks.map(t => ({
    slug: t.slug,
    title: t.title,
    artist_name: t.artist_name,
    artist_slug: t.artist_slug,
    release_slug: t.release_slug,
    track_number: t.track_number,
    bpm: t.bpm,
    like_count: countMap[t.slug] ?? 0,
  }))
}, catalogCacheOptions(60 * 5))
