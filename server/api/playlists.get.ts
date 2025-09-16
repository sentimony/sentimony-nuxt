export default defineCachedEventHandler(
  async () => {
    const { public: { firebaseBase } } = useRuntimeConfig()
    return await $fetch(`${firebaseBase}/playlists.json`)
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
)
