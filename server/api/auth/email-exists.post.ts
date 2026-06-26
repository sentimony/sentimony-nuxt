import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = body.email?.trim()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Missing email' })
  }

  return { exists: await emailExists(email) }
})
