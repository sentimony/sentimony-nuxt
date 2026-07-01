const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('videos')
        .select('slug, title, cover_xl, date, visible')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const data = await fetchFirebaseCollection('videos')
    return pickListFields(data, ['slug', 'title', 'cover_xl', 'date', 'visible'], { visibleOnly: true })
  },
  catalogCacheOptions()
)
