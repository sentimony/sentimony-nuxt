import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
  }

  const release = await $fetch<any>(`/api/release/${id}`).catch(() => null)
  const bandcamp = release?.links?.bandcamp_url as string | undefined
  if (bandcamp) {
    return sendRedirect(event, bandcamp, 302)
  }

  // Fallback: if 24-bit Bandcamp exists, redirect to it
  const bandcamp24 = release?.links?.bandcamp24_url as string | undefined
  if (bandcamp24) {
    return sendRedirect(event, bandcamp24, 302)
  }

  throw createError({ statusCode: 404, statusMessage: 'Bandcamp link not found' })
})
