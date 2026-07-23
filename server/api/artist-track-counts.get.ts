export default defineCachedEventHandler(
  async () => {
    const tracks = await fetchCatalogTracksBySlug()
    const counts: Record<string, number> = {}

    for (const track of tracks.values()) {
      const slugs = track.artist_slug.split(',').map(s => s.trim()).filter(Boolean)
      for (const slug of slugs) counts[slug] = (counts[slug] ?? 0) + 1
    }

    return counts
  },
  catalogCacheOptions()
)
