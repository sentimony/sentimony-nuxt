export interface SitemapUrlEntry {
  loc: string
  lastmod?: string
  changefreq?: 'daily' | 'weekly' | 'monthly'
  priority?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1
}

interface CatalogEntity {
  slug: string
  visible?: boolean
  date?: string
}

interface CatalogRelease extends CatalogEntity {
  tracklist?: string[]
}

export interface SitemapCatalogExport {
  releases: Record<string, CatalogRelease>
  artists: CatalogEntity[]
  tracks: { slug: string }[]
  videos: CatalogEntity[]
  playlists: Record<string, CatalogEntity>
  events: CatalogEntity[]
  friends: CatalogEntity[]
}

const STATIC_PAGE_URLS: SitemapUrlEntry[] = [
  { loc: '/', changefreq: 'daily', priority: 1 },
  { loc: '/news', changefreq: 'daily', priority: 0.8 },
  { loc: '/releases', changefreq: 'daily', priority: 0.8 },
  { loc: '/releases/all', changefreq: 'weekly', priority: 0.7 },
  { loc: '/releases/psytrance', changefreq: 'weekly', priority: 0.7 },
  { loc: '/releases/psychill', changefreq: 'weekly', priority: 0.7 },
  { loc: '/artists', changefreq: 'daily', priority: 0.8 },
  { loc: '/artists/all', changefreq: 'weekly', priority: 0.7 },
  { loc: '/tracks', changefreq: 'daily', priority: 0.8 },
  { loc: '/videos', changefreq: 'daily', priority: 0.8 },
  { loc: '/playlists', changefreq: 'daily', priority: 0.8 },
  { loc: '/events', changefreq: 'daily', priority: 0.8 },
  { loc: '/friends', changefreq: 'weekly', priority: 0.7 },
  { loc: '/contacts', changefreq: 'weekly', priority: 0.7 },
]

function entitiesOf<T extends CatalogEntity>(collection: Record<string, T> | T[] | undefined): T[] {
  if (!collection) return []
  return Array.isArray(collection) ? collection : Object.values(collection)
}

function visibleEntities<T extends CatalogEntity>(collection: Record<string, T> | T[] | undefined): T[] {
  return entitiesOf(collection).filter(entity => entity?.visible === true)
}

function lastmodOf(entity: CatalogEntity): string | undefined {
  return typeof entity.date === 'string' && entity.date ? entity.date : undefined
}

function buildDetailUrls(collection: Record<string, CatalogEntity> | CatalogEntity[], pathPrefix: string): SitemapUrlEntry[] {
  return visibleEntities(collection).map(entity => ({
    loc: `${pathPrefix}/${entity.slug}`,
    lastmod: lastmodOf(entity),
    changefreq: 'monthly',
    priority: 0.6,
  }))
}

function buildTrackUrls(
  tracks: { slug: string }[],
  releases: Record<string, CatalogRelease>,
): SitemapUrlEntry[] {
  const lastmodByTrack = new Map<string, string | undefined>()

  for (const release of visibleEntities(releases)) {
    for (const slug of Array.isArray(release.tracklist) ? release.tracklist : []) {
      if (typeof slug !== 'string') continue
      if (!lastmodByTrack.has(slug)) lastmodByTrack.set(slug, lastmodOf(release))
    }
  }

  return (tracks ?? [])
    .filter(track => lastmodByTrack.has(track.slug))
    .map(track => ({
      loc: `/track/${track.slug}`,
      lastmod: lastmodByTrack.get(track.slug),
      changefreq: 'monthly' as const,
      priority: 0.5 as const,
    }))
}

export function buildSitemapUrls(catalog: SitemapCatalogExport): SitemapUrlEntry[] {
  return [
    ...STATIC_PAGE_URLS,
    ...buildDetailUrls(catalog.releases, '/release'),
    ...buildDetailUrls(catalog.artists, '/artist'),
    ...buildTrackUrls(catalog.tracks, catalog.releases),
    ...buildDetailUrls(catalog.videos, '/video'),
    ...buildDetailUrls(catalog.playlists, '/playlist'),
    ...buildDetailUrls(catalog.events, '/event'),
    ...buildDetailUrls(catalog.friends, '/friend'),
  ]
}
