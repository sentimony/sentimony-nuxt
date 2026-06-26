export type CatalogSource = 'firebase' | 'supabase'

export function getCatalogSource(): CatalogSource {
  return useRuntimeConfig().catalogSource === 'supabase' ? 'supabase' : 'firebase'
}

export function isSupabaseCatalogSource() {
  return getCatalogSource() === 'supabase'
}
