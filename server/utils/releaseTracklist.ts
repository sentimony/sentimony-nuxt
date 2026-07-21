export type ReleaseTracklistEntry = {
  track_number: number
  slug: string
  artist: string
  artist_slug: string
  title: string
  bpm: number | null
  url: string
}

export type CatalogTrack = {
  slug: string
  title: string
  artist_name: string
  artist_slug: string
  bpm: number | null
  audio_url: string | null
}

export function slugifyTrack(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function releaseTracklistSlugs(release: Record<string, unknown>): string[] {
  const list = Array.isArray(release.tracklist) ? release.tracklist : []
  return list.filter((slug): slug is string => typeof slug === 'string')
}

export type ReleaseTrackRow = CatalogTrack & {
  release_slug: string
  track_number: number
}

export function expandReleaseTracks(
  release: Record<string, unknown> & { slug?: unknown },
  tracksBySlug: Map<string, CatalogTrack>,
): ReleaseTrackRow[] {
  const releaseSlug = typeof release.slug === 'string' ? release.slug : ''
  return releaseTracklistSlugs(release)
    .map((slug, index) => {
      const track = tracksBySlug.get(slug)
      if (!track) return null
      return { ...track, release_slug: releaseSlug, track_number: index + 1 }
    })
    .filter((row): row is ReleaseTrackRow => row !== null)
}

export function hydrateReleaseTracklist(
  release: Record<string, unknown>,
  tracksBySlug: Map<string, CatalogTrack>,
): ReleaseTracklistEntry[] {
  const slugs = Array.isArray(release.tracklist) ? release.tracklist as unknown[] : []
  return slugs
    .map((slug, index) => {
      const track = typeof slug === 'string' ? tracksBySlug.get(slug) : undefined
      if (!track) return null
      return {
        track_number: index + 1,
        slug: track.slug,
        artist: track.artist_name,
        artist_slug: track.artist_slug,
        title: track.title,
        bpm: track.bpm,
        url: track.audio_url ?? '',
      }
    })
    .filter((entry): entry is ReleaseTracklistEntry => entry !== null)
}
