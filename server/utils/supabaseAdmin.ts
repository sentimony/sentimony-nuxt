import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

function createAdminClient() {
  const config = useRuntimeConfig()
  return createClient<Database>(
    config.supabaseUrl,
    config.supabaseSecretKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

let admin: ReturnType<typeof createAdminClient> | null = null

export function supabaseAdmin() {
  if (!admin) admin = createAdminClient()
  return admin
}
