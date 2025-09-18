import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
  }

  // Reuse the cached API route for releases
  const release = await $fetch<any>(`/api/release/${id}`).catch(() => null)

  const tidal = release?.links?.tidal as string | undefined
  if (!tidal) {
    throw createError({ statusCode: 404, statusMessage: 'Tidal link not found' })
  }

  // Permanent redirect for SEO
  return sendRedirect(event, tidal, 301)
})
