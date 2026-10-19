export type CatalogSource = 'firebase' | 'supabase' | 'local'

export function getCatalogSource(): CatalogSource {
  const source = useRuntimeConfig().catalogSource
  return source === 'supabase' || source === 'local' ? source : 'firebase'
}

export function isSupabaseCatalogSource() {
  return getCatalogSource() === 'supabase'
}
