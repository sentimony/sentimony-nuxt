import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function getAdminClient(): SupabaseClient {
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.NUXT_SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('E2E: NUXT_PUBLIC_SUPABASE_URL or NUXT_SUPABASE_SECRET_KEY missing')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const TEST_USER_EMAIL_PREFIX = 'playwright-'
