const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('friends')
        .select('slug, title, visible')
        .eq('visible', true)

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const data = await fetchFirebaseCollection('friends')
    return pickListFields(data, ['slug', 'title', 'visible'], { visibleOnly: true })
  },
  catalogCacheOptions()
)
