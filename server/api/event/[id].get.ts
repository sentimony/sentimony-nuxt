import { createError } from 'h3'

const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing event id' })
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const url = `${firebaseBase}/events/${id}.json`

    // In development, add cache-busting timestamp
    const data = isDev
      ? await $fetch(`${url}?_t=${Date.now()}`)
      : await $fetch(url)

    if (!data) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    return data
  },
  {
    // Cache for 1 hour in production; no cache in development
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
