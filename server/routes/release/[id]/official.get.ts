import { createError, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing release id' })
  }

  // Redirect to the canonical release page
  const target = `/release/${id}`
  return sendRedirect(event, target, 301)
})
