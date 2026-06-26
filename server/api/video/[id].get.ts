const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing video id' })

    let video: Record<string, unknown>

    if (useRuntimeConfig().releasesSource === 'supabase') {
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
      const { public: { firebaseBase } } = useRuntimeConfig()
      const url = `${firebaseBase}/videos/${id}.json`
      const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)

      if (!isPublicEntity(data)) throw createError({ statusCode: 404, statusMessage: 'Video not found' })
      video = data as Record<string, unknown>
    }

    const { count } = await supabaseAdmin()
      .from('video_likes')
      .select('*', { count: 'exact', head: true })
      .eq('video_slug', id)

    return { ...video, like_count: count ?? 0 }
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
