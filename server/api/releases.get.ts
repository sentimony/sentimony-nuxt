export default defineCachedEventHandler(
  async () => {
    // Proxy Firebase and allow Nitro to cache the result
    return await $fetch('https://sentimony-db.firebaseio.com/releases.json')
  },
  {
    // Cache for 1 hour; serve stale while revalidating
    maxAge: 60 * 60,
    swr: true,
  }
)
