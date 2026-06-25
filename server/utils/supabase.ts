import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

function createAnonClient() {
  const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
  return createClient<Database>(supabaseUrl, supabaseKey)
}

let client: ReturnType<typeof createAnonClient> | null = null

export function useSupabase() {
  if (!client) client = createAnonClient()
  return client
}

export function mapReleaseFromSupabase({ is_new, tracklist_compact, credits_compact, ...rest }: Record<string, unknown>) {
  return { ...rest, new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact }
}
