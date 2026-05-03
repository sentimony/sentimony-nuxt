const isDev = import.meta.dev

const getReleases = async () => {
  if (usesSupabaseContentSource()) {
    const { data, error } = await useSupabase()
      .from('releases')
      .select('slug, title, cover_th, date, visible, coming_soon, is_new, artists, at_playlists')
      .eq('visible', true)
      .order('date', { ascending: false })

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data?.map(mapReleaseFromSupabase) ?? []
  }

  const { public: { firebaseBase } } = useRuntimeConfig()
  const url = `${firebaseBase}/releases.json`
  return isDev ? await $fetch(`${url}?_t=${Date.now()}`) : await $fetch(url)
}

export default isDev
  ? defineEventHandler(getReleases)
  : defineCachedEventHandler(
    getReleases,
  {
    maxAge: 60 * 60,
    swr: true,
  }
  )
