import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
  }

  // Reuse the cached API route for releases
  const release = await $fetch<any>(`/api/release/${id}`).catch(() => null)

  const qobuz = release?.links?.qobuz as string | undefined
  if (!qobuz) {
    throw createError({ statusCode: 404, statusMessage: 'Qobuz link not found' })
  }

  // Permanent redirect for SEO
  return sendRedirect(event, qobuz, 301)
})
