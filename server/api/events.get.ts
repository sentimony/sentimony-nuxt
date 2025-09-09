export default defineCachedEventHandler(
  async () => {
    return await $fetch('https://sentimony-db.firebaseio.com/events.json')
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
)
