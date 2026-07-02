import { parseTrackParagraph } from './firebaseCatalog'

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
  tracklistCompact?: { p: string }[]
}

export interface SitemapCatalogExport {
  releases: Record<string, CatalogRelease>
  artists: Record<string, CatalogEntity>
  videos: Record<string, CatalogEntity>
  playlists: Record<string, CatalogEntity>
  events: Record<string, CatalogEntity>
  friends: Record<string, CatalogEntity>
}

const STATIC_PAGE_URLS: SitemapUrlEntry[] = [
  { loc: '/', changefreq: 'daily', priority: 1 },
  { loc: '/news', changefreq: 'daily', priority: 0.8 },
  { loc: '/releases', changefreq: 'daily', priority: 0.8 },
  { loc: '/artists', changefreq: 'daily', priority: 0.8 },
  { loc: '/tracks', changefreq: 'daily', priority: 0.8 },
  { loc: '/videos', changefreq: 'daily', priority: 0.8 },
  { loc: '/playlists', changefreq: 'daily', priority: 0.8 },
  { loc: '/events', changefreq: 'daily', priority: 0.8 },
  { loc: '/friends', changefreq: 'weekly', priority: 0.7 },
  { loc: '/contacts', changefreq: 'weekly', priority: 0.7 },
]

function visibleEntries<T extends CatalogEntity>(collection: Record<string, T>): [string, T][] {
  return Object.entries(collection ?? {}).filter(([, entity]) => entity?.visible === true)
}

function lastmodOf(entity: CatalogEntity): string | undefined {
  return typeof entity.date === 'string' && entity.date ? entity.date : undefined
}

function buildDetailUrls(collection: Record<string, CatalogEntity>, pathPrefix: string): SitemapUrlEntry[] {
  return visibleEntries(collection).map(([key, entity]) => ({
    loc: `${pathPrefix}/${entity.slug ?? key}`,
    lastmod: lastmodOf(entity),
    changefreq: 'monthly',
    priority: 0.6,
  }))
}

function buildTrackUrls(releases: Record<string, CatalogRelease>): SitemapUrlEntry[] {
  const urls: SitemapUrlEntry[] = []

  for (const [key, release] of visibleEntries(releases)) {
    const releaseSlug = release.slug ?? key
    const tracklist = Array.isArray(release.tracklistCompact) ? release.tracklistCompact : []

    tracklist.forEach((item, index) => {
      const paragraph = typeof item?.p === 'string' ? item.p : ''
      if (!paragraph) return

      const track = parseTrackParagraph(paragraph, releaseSlug, index, new Map())
      if (!track.title) return

      urls.push({
        loc: `/track/${track.slug}`,
        lastmod: lastmodOf(release),
        changefreq: 'monthly',
        priority: 0.5,
      })
    })
  }

  return urls
}

export function buildSitemapUrls(catalog: SitemapCatalogExport): SitemapUrlEntry[] {
  return [
    ...STATIC_PAGE_URLS,
    ...buildDetailUrls(catalog.releases, '/release'),
    ...buildDetailUrls(catalog.artists, '/artist'),
    ...buildTrackUrls(catalog.releases),
    ...buildDetailUrls(catalog.videos, '/video'),
    ...buildDetailUrls(catalog.playlists, '/playlist'),
    ...buildDetailUrls(catalog.events, '/event'),
    ...buildDetailUrls(catalog.friends, '/friend'),
  ]
}
