import { createClient } from '@supabase/supabase-js'

function createAnonClient() {
  const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
  return createClient(supabaseUrl, supabaseKey)
}

let client: ReturnType<typeof createAnonClient> | null = null

export function useSupabase() {
  if (!client) client = createAnonClient()
  return client
}

export function mapReleaseFromSupabase({ is_new, tracklist_compact, credits_compact, ...rest }: Record<string, unknown>) {
  return { ...rest, new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact }
}
