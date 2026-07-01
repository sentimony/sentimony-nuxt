const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('events')
        .select('slug, title, flyer_a_xl, date, visible')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const data = await fetchFirebaseCollection('events')
    return pickListFields(data, ['slug', 'title', 'flyer_a_xl', 'date', 'visible'], { visibleOnly: true })
  },
  catalogCacheOptions()
)
