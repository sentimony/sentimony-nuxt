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
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
      release = mapReleaseFromSupabase(data)
    }
    else {
      const data = await fetchFirebaseEntity('releases', id)
      if (!data) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
      release = data as Record<string, unknown>
    }

    const slugs = releaseTracklistSlugs(release)
    const tracksBySlug = slugs.length ? await fetchCatalogTracksBySlug(slugs) : new Map()

    return { ...release, tracklist: hydrateReleaseTracklist(release, tracksBySlug) }
  },
  catalogCacheOptions()
)
