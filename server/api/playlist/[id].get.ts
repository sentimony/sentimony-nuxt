const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing playlist id' })

    let playlist: Record<string, unknown>

    if (useRuntimeConfig().releasesSource === 'supabase') {
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
      const { public: { firebaseBase } } = useRuntimeConfig()
      const url = `${firebaseBase}/playlists/${id}.json`
      const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)

      if (!isPublicEntity(data)) throw createError({ statusCode: 404, statusMessage: 'Playlist not found' })
      playlist = data as Record<string, unknown>
    }

    const { count } = await supabaseAdmin()
      .from('playlist_likes')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_slug', id)

    return { ...playlist, like_count: count ?? 0 }
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
