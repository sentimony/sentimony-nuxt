export default defineCachedEventHandler(
  async () => {
    const { public: { firebaseBase } } = useRuntimeConfig()
    return await $fetch(`${firebaseBase}/events.json`)
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
)
