import { createError } from 'h3'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing artist id' })
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const data = await $fetch(`${firebaseBase}/artists/${id}.json`)

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
    }

    return data
  },
  {
    maxAge: 60 * 60,
    swr: true,
  }
)
