const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing release id' })

    let release: Record<string, unknown>

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('releases')
        .select('*')
        .eq('slug', id)
        .eq('visible', true)
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
      release = mapReleaseFromSupabase(data)
    }
    else {
      const data = await fetchFirebaseEntity('releases', id)
      if (!isPublicEntity(data)) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
      release = data as Record<string, unknown>
    }

    const slugs = releaseTracklistSlugs(release)
    const [count, tracksBySlug] = await Promise.all([
      fetchLikeCount('release_likes', 'release_slug', id),
      slugs.length ? fetchCatalogTracksBySlug(slugs) : Promise.resolve(new Map()),
    ])

    return { ...release, tracklist: hydrateReleaseTracklist(release, tracksBySlug), like_count: count }
  },
  catalogCacheOptions()
)
