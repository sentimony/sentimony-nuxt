export function buildTrackArtistRows(tracks) {
  return tracks.flatMap((track) => {
    const slugs = [...new Set(
      String(track.artist_slug ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    )]
    return slugs.map((artist_slug, index) => ({
      track_slug: track.slug,
      artist_slug,
      position: index,
    }))
  })
}
