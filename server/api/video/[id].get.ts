const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing video id' })

    let video: Record<string, unknown>

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('videos')
        .select('*')
        .eq('slug', id)
        .eq('visible', true)
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Video not found' })
      video = data as Record<string, unknown>
    }
    else {
      const data = await fetchFirebaseEntity('videos', id)
      if (!isPublicEntity(data)) throw createError({ statusCode: 404, statusMessage: 'Video not found' })
      video = data as Record<string, unknown>
    }

    return video
  },
  catalogCacheOptions()
)
