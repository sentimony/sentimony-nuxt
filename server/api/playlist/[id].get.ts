const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing playlist id' })

    let playlist: Record<string, unknown>

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('playlists')
        .select('*')
        .eq('slug', id)
        .eq('visible', true)
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Playlist not found' })
      playlist = data as Record<string, unknown>
    }
    else {
      const data = await fetchFirebaseEntity('playlists', id)
      if (!isPublicEntity(data)) throw createError({ statusCode: 404, statusMessage: 'Playlist not found' })
      playlist = data as Record<string, unknown>
    }

    const count = await fetchLikeCount('playlist_likes', 'playlist_slug', id)

    return { ...playlist, like_count: count }
  },
  catalogCacheOptions()
)
