import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

function createAnonClient() {
  const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
  return createClient<Database>(supabaseUrl, supabaseKey)
}

let client: ReturnType<typeof createAnonClient> | null = null

export type SupabaseReleaseRow = Record<string, unknown> & { slug: string }
type MappedReleaseRow<T extends SupabaseReleaseRow> =
  Omit<T, 'is_new' | 'tracklist_compact' | 'credits_compact'>
  & {
    slug: T['slug']
    new: T['is_new']
    tracklistCompact: T['tracklist_compact']
    creditsCompact: T['credits_compact']
  }

export function useSupabase() {
  if (!client) client = createAnonClient()
  return client
}

export function mapReleaseFromSupabase<T extends SupabaseReleaseRow>(row: T): MappedReleaseRow<T> {
  const { is_new, tracklist_compact, credits_compact, ...rest } = row
  return { ...rest, new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact } as MappedReleaseRow<T>
}
