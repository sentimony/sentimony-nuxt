import { createClient } from '@supabase/supabase-js'

export function supabaseAdmin() {
  const config = useRuntimeConfig()
  return createClient(
    config.supabaseUrl,
    config.supabaseSecretKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
