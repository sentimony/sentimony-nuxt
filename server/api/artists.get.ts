const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('artists')
        .select('slug, title, photo_xl, visible, category, category_id')
        .eq('visible', true)

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const data = await fetchFirebaseCollection('artists')
    return pickListFields(data, ['slug', 'title', 'photo_xl', 'visible', 'category', 'category_id'], { visibleOnly: true })
  },
  catalogCacheOptions()
)
