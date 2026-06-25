const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (useRuntimeConfig().releasesSource === 'supabase') {
      const { data, error } = await useSupabase()
        .from('events')
        .select('slug, title, flyer_a_xl, date, visible')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/events.json`
    const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)
    return pickListFields(data, ['slug', 'title', 'flyer_a_xl', 'date', 'visible'])
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
