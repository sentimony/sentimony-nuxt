import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing playlist id' })
  }

  // Reuse the cached API route for playlists
  const playlist = await $fetch<any>(`/api/playlist/${id}`).catch(() => null)

  const appleMusic = playlist?.links?.apple_music as string | undefined
  if (!appleMusic) {
    throw createError({ statusCode: 404, statusMessage: 'Apple Music link not found' })
  }

  // Permanent redirect for SEO
  return sendRedirect(event, appleMusic, 301)
})
