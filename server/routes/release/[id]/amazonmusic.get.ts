import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
  }

  // Reuse the cached API route for releases
  const release = await $fetch<any>(`/api/release/${id}`).catch(() => null)

  const amazonMusic = release?.links?.amazon_music as string | undefined
  if (!amazonMusic) {
    throw createError({ statusCode: 404, statusMessage: 'Amazon Music link not found' })
  }

  // Permanent redirect for SEO
  return sendRedirect(event, amazonMusic, 301)
})
