export default defineCachedEventHandler(
  async () => {
    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('artists')
        .select('slug, title, visible, category, category_id, location')
        .order('category_id', { ascending: true })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const data = await fetchFirebaseCollection('artists')
    return pickListFields(data, ['slug', 'title', 'visible', 'category', 'category_id', 'location'])
  },
  catalogCacheOptions()
)
