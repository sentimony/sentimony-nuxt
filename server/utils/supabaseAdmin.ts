import { createClient } from '@supabase/supabase-js'

function createAdminClient() {
  const config = useRuntimeConfig()
  return createClient(
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
