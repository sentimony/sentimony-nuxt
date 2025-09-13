import { createError } from 'h3'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const data = await $fetch(`${firebaseBase}/releases/${id}.json`)

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Release not found' })
    }

    return data
  },
  {
    // Cache for 1 hour; serve stale while revalidating
    maxAge: 60 * 60,
    swr: true,
  }
)
