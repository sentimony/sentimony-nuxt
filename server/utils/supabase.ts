import { createClient } from '@supabase/supabase-js'

export function useSupabase() {
  const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
  return createClient(supabaseUrl, supabaseKey)
}

export function usesSupabaseContentSource() {
  const contentSource = process.env.RELEASES_SOURCE?.toLowerCase()

  if (contentSource === 'firebase') return false
  if (contentSource === 'supabase') return true
  if (process.env.NUXT_PUBLIC_SUPABASE_URL && process.env.NUXT_PUBLIC_SUPABASE_KEY) return true

  const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
  return Boolean(supabaseUrl && supabaseKey)
}

export function mapReleaseFromSupabase({ is_new, tracklist_compact, credits_compact, ...rest }: Record<string, unknown>) {
  return { ...rest, new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact }
}
