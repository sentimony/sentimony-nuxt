export function buildTrackArtistRows(
  tracks: Array<{ slug: string, artist_slug?: string | null }>,
): Array<{ track_slug: string, artist_slug: string, position: number }>
