const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('releases')
        .select('slug, title, cover_xl, date, visible, coming_soon, is_new, artists, at_playlists, style')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data?.map(mapReleaseFromSupabase) ?? []
    }

    const data = await fetchFirebaseCollection('releases')
    return pickListFields(data, ['slug', 'title', 'cover_xl', 'date', 'visible', 'coming_soon', 'new', 'artists', 'at_playlists', 'style'], { visibleOnly: true })
  },
  catalogCacheOptions()
)
