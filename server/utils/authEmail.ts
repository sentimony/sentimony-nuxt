import { createError } from 'h3'
import { supabaseAdmin } from './supabaseAdmin'

const PAGE_SIZE = 1000

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function emailExists(email: string) {
  const normalized = normalizeEmail(email)
  if (!normalized) return false

  const admin = supabaseAdmin()

  for (let page = 1; page < 1000; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    const users = data.users ?? []
    if (users.some(user => user.email?.trim().toLowerCase() === normalized)) {
      return true
    }

    if (users.length < PAGE_SIZE) return false
  }

  return false
}
