const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (useRuntimeConfig().releasesSource === 'supabase') {
      const { data, error } = await useSupabase()
        .from('friends')
        .select('slug, title, visible')
        .eq('visible', true)

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/friends.json`
    const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)
    return pickListFields(data, ['slug', 'title', 'visible'], { visibleOnly: true })
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
