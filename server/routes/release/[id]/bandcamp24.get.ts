import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
  }

  const release = await $fetch<any>(`/api/release/${id}`).catch(() => null)
  const url24 = release?.links?.bandcamp24_url as string | undefined

  if (url24) {
    return sendRedirect(event, url24, 301)
  }

  // Fallback to the standard Bandcamp route (temporary)
  return sendRedirect(event, `/release/${id}/bandcamp`, 302)
})
