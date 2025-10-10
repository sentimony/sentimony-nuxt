const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async () => {
    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/events.json`

    // In development, add cache-busting timestamp to bypass all caches
    if (isDev) {
      return await $fetch(`${url}?_t=${Date.now()}`)
    }

    return await $fetch(url)
  },
  {
    // Cache for 1 hour in production; no cache in development
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
