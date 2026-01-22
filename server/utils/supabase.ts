import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function useSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const config = useRuntimeConfig()

  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
  }

  supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseClient
}
