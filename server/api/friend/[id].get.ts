const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing friend id' })

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('friends')
        .select('*')
        .eq('slug', id)
        .eq('visible', true)
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Friend not found' })
      return data
    }

    const data = await fetchFirebaseEntity('friends', id)
    if (!isPublicEntity(data)) throw createError({ statusCode: 404, statusMessage: 'Friend not found' })
    return data
  },
  catalogCacheOptions()
)
