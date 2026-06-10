const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing artist id' })

    if (useRuntimeConfig().releasesSource === 'supabase') {
      const { data, error } = await useSupabase()
        .from('artists')
        .select('*')
        .eq('slug', id)
        .single()

      if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
      return data
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/artists/${id}.json`
    const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)

    if (!data) throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
    return data
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
