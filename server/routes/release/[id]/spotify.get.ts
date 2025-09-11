import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
  }

  // Reuse the cached API route for releases
  const release = await $fetch<any>(`/api/release/${id}`).catch(() => null)

  const spotify = release?.links?.spotify as string | undefined
  if (!spotify) {
    throw createError({ statusCode: 404, statusMessage: 'Spotify link not found' })
  }

  // Use 302 for safety; change to 301 if you want it permanent
  return sendRedirect(event, spotify, 302)
})
