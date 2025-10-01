import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing playlist id' })
  }

  // Reuse the cached API route for playlists
  const playlist = await $fetch<any>(`/api/playlist/${id}`).catch(() => null)

  const napster = playlist?.links?.napster as string | undefined
  if (!napster) {
    throw createError({ statusCode: 404, statusMessage: 'Napster link not found' })
  }

  // Permanent redirect for SEO
  return sendRedirect(event, napster, 301)
})
