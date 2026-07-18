// The track_artists index is an optimization over the CSV artist_slug column.
// Query failures (including a not-yet-migrated table) degrade to empty results
// so callers fall back to CSV matching instead of failing the request.
export async function fetchTrackArtistSlugs(trackSlug: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin()
    .from('track_artists')
    .select('artist_slug, position')
    .eq('track_slug', trackSlug)
    .order('position', { ascending: true })

  if (error) {
    console.warn('track_artists lookup failed, falling back to CSV:', error.message)
    return []
  }
  return ((data ?? []) as { artist_slug: unknown }[]).map(row => String(row.artist_slug))
}

export async function fetchCoArtistTrackSlugs(artistSlugs: string[]): Promise<Set<string>> {
  if (!artistSlugs.length) return new Set()

  const { data, error } = await supabaseAdmin()
    .from('track_artists')
    .select('track_slug')
    .in('artist_slug', artistSlugs)

  if (error) {
    console.warn('track_artists lookup failed, falling back to CSV:', error.message)
    return new Set()
  }
  return new Set(((data ?? []) as { track_slug: unknown }[]).map(row => String(row.track_slug)))
}

export async function fetchArtistTrackSlugs(artistSlug: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin()
    .from('track_artists')
    .select('track_slug')
    .eq('artist_slug', artistSlug)

  if (error) {
    console.warn('track_artists lookup failed, falling back to CSV:', error.message)
    return new Set()
  }
  return new Set(((data ?? []) as { track_slug: unknown }[]).map(row => String(row.track_slug)))
}
