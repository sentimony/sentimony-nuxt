const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing artist id' })

    let artist: Record<string, unknown>

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('artists')
        .select('*')
        .eq('slug', id)
        .eq('visible', true)
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
      artist = data as Record<string, unknown>
    }
    else {
      const data = await fetchFirebaseEntity('artists', id)
      if (!isPublicEntity(data)) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
      artist = data as Record<string, unknown>
    }

    const count = await fetchLikeCount('artist_likes', 'artist_slug', id)

    return { ...artist, like_count: count }
  },
  catalogCacheOptions()
)
