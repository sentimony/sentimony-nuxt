const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing release id' })

    let release: Record<string, unknown>

    if (useRuntimeConfig().releasesSource === 'supabase') {
      const { data, error } = await useSupabase()
        .from('releases')
        .select('*')
        .eq('slug', id)
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
      release = mapReleaseFromSupabase(data)
    }
    else {
      const { public: { firebaseBase } } = useRuntimeConfig()
      const url = `${firebaseBase}/releases/${id}.json`
      const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)

      if (!data) throw createError({ statusCode: 404, statusMessage: 'Release not found' })
      release = data as Record<string, unknown>
    }

    const { count } = await supabaseAdmin()
      .from('release_likes')
      .select('*', { count: 'exact', head: true })
      .eq('release_slug', id)

    return { ...release, like_count: count ?? 0 }
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
