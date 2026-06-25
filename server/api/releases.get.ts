const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (useRuntimeConfig().releasesSource === 'supabase') {
      const { data, error } = await useSupabase()
        .from('releases')
        .select('slug, title, cover_th, date, visible, coming_soon, is_new, artists, at_playlists')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data?.map(mapReleaseFromSupabase) ?? []
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/releases.json`
    const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)
    return pickListFields(data, ['slug', 'title', 'cover_th', 'date', 'visible', 'coming_soon', 'new', 'artists', 'at_playlists'], { visibleOnly: true })
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
