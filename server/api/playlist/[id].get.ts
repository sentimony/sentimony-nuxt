export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) return null
    return await $fetch(`https://sentimony-db.firebaseio.com/playlists/${id}.json`)
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
)
