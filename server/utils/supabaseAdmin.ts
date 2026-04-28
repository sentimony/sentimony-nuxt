import { createClient } from '@supabase/supabase-js'

export function supabaseAdmin() {
  const config = useRuntimeConfig()
  return createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
