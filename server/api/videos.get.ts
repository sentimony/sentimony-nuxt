export default defineCachedEventHandler(
  async () => {
    const { public: { firebaseBase } } = useRuntimeConfig()
    return await $fetch(`${firebaseBase}/videos.json`)
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
)
