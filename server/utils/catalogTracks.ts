import type { CatalogTrack, ReleaseTrackRow } from './releaseTracklist'
import { expandReleaseTracks, releaseTracklistSlugs } from './releaseTracklist'
import { fetchFirebaseCatalogTracks, fetchAllFirebaseTracks } from './firebaseCatalog'

const CATALOG_TRACK_COLUMNS = 'slug, title, artist_name, artist_slug, bpm, audio_url'

function toCatalogTrack(row: Record<string, unknown>): CatalogTrack {
  return {
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    artist_name: String(row.artist_name ?? ''),
    artist_slug: String(row.artist_slug ?? ''),
    bpm: typeof row.bpm === 'number' ? row.bpm : null,
    audio_url: typeof row.audio_url === 'string' ? row.audio_url : null,
  }
}

export async function fetchSupabaseCatalogTracks(slugs?: string[]): Promise<Map<string, CatalogTrack>> {
  let query = supabaseAdmin().from('tracks').select(CATALOG_TRACK_COLUMNS)
  if (slugs?.length) query = query.in('slug', slugs)

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return new Map((data ?? []).map((row) => {
    const track = toCatalogTrack(row as Record<string, unknown>)
    return [track.slug, track]
  }))
}

export async function fetchCatalogTracksBySlug(slugs?: string[]): Promise<Map<string, CatalogTrack>> {
  if (isSupabaseCatalogSource()) return await fetchSupabaseCatalogTracks(slugs)
  return await fetchFirebaseCatalogTracks()
}

export async function fetchAllCatalogTrackRows(): Promise<ReleaseTrackRow[]> {
  if (isSupabaseCatalogSource()) {
    const [releasesResult, tracksBySlug] = await Promise.all([
      useSupabase().from('releases').select('slug, date, tracklist').eq('visible', true),
      fetchSupabaseCatalogTracks(),
    ])
    if (releasesResult.error) throw createError({ statusCode: 500, statusMessage: releasesResult.error.message })

    const releases = (releasesResult.data ?? []) as Record<string, unknown>[]
    releases.sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')))
    return releases.flatMap(release => expandReleaseTracks(release, tracksBySlug))
  }

  return await fetchAllFirebaseTracks()
}

export function trackSlugsOf(release: Record<string, unknown>): string[] {
  return releaseTracklistSlugs(release)
}
