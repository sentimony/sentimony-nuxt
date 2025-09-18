import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing playlist id' })
  }

  // Reuse the cached API route for playlists
  const playlist = await $fetch<any>(`/api/playlist/${id}`).catch(() => null)

  const spotify = playlist?.links?.spotify as string | undefined
  if (!spotify) {
    throw createError({ statusCode: 404, statusMessage: 'Spotify link not found' })
  }

  // Permanent redirect for SEO
  return sendRedirect(event, spotify, 301)
})
