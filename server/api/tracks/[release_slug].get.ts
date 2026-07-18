export default defineCachedEventHandler(async (event) => {
  const releaseSlug = getRouterParam(event, 'release_slug')
  if (!releaseSlug) throw createError({ statusCode: 400, statusMessage: 'Missing release_slug' })

  let releaseTracks

  if (isSupabaseCatalogSource()) {
    const { data: release, error } = await useSupabase()
      .from('releases')
      .select('slug, tracklist')
      .eq('slug', releaseSlug)
      .eq('visible', true)
      .maybeSingle()

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    if (!release) return []

    const slugs = releaseTracklistSlugs(release as Record<string, unknown>)
    if (!slugs.length) return []

    const tracksBySlug = await fetchSupabaseCatalogTracks(slugs)
    releaseTracks = expandReleaseTracks(release as Record<string, unknown>, tracksBySlug)
  }
  else {
    releaseTracks = await fetchFirebaseTracksForRelease(releaseSlug)
  }

  if (!releaseTracks.length) return []

  return releaseTracks
}, catalogCacheOptions(60 * 5))
