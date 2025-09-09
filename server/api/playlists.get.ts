export default defineCachedEventHandler(
  async () => {
    return await $fetch('https://sentimony-db.firebaseio.com/playlists.json')
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
)
