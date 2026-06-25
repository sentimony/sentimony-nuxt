const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    if (useRuntimeConfig().releasesSource === 'supabase') {
      const { data, error } = await useSupabase()
        .from('artists')
        .select('slug, title, photo_th, visible, category, category_id')
        .eq('visible', true)
        .order('category_id', { ascending: true })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return data ?? []
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/artists.json`
    const data = isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)
    return pickListFields(data, ['slug', 'title', 'photo_th', 'visible', 'category', 'category_id'])
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
