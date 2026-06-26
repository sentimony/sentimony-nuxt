const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(async (event) => {
  const releaseSlug = getRouterParam(event, 'release_slug')
  if (!releaseSlug) throw createError({ statusCode: 400, statusMessage: 'Missing release_slug' })

  if (useRuntimeConfig().releasesSource === 'firebase') {
    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/tracks.json`
    const allTracks = await $fetch(url)

    if (!allTracks) return []

    const releaseTracks = Object.values(allTracks as Record<string, any>)
      .filter(t => t.release_slug === releaseSlug)
      .sort((a, b) => (a.track_number || 0) - (b.track_number || 0))

    return releaseTracks.map((t: any) => ({
      slug: t.slug,
      title: t.title,
      artist_name: t.artist_name,
      track_number: t.track_number,
      bpm: t.bpm,
      like_count: t.like_count ?? 0,
    }))
  }

  const { data: tracks, error } = await supabaseAdmin()
    .from('tracks')
    .select('slug, title, artist_slug, artist_name, track_number, bpm')
    .eq('release_slug', releaseSlug)
    .order('track_number')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!tracks?.length) return []

  const { data: likesRaw } = await supabaseAdmin()
    .from('track_likes')
    .select('track_slug')
    .in('track_slug', tracks.map(t => t.slug))

  const countMap: Record<string, number> = {}
  likesRaw?.forEach((l: { track_slug: string }) => {
    countMap[l.track_slug] = (countMap[l.track_slug] ?? 0) + 1
  })

  return tracks.map(t => ({ ...t, like_count: countMap[t.slug] ?? 0 }))
}, {
  maxAge: isDev ? 0 : 60 * 5,
  swr: !isDev,
})
