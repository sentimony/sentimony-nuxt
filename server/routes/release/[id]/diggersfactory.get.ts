import { createError, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing release id' })

  const release = await $fetch<any>(`/api/release/${id}`).catch(() => null)
  const url = release?.links?.diggersfactory_url as string | undefined
  if (!url) throw createError({ statusCode: 404, statusMessage: 'Diggers Factory link not found' })

  return sendRedirect(event, url, 302)
})

