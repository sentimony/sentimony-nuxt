import { describe, expect, it } from 'vitest'
import { buildSitemapUrls, type SitemapCatalogExport } from '../../server/utils/sitemapUrls'

const catalog: SitemapCatalogExport = {
  releases: {
    'visible-release': {
      slug: 'visible-release',
      visible: true,
      date: '2020-01-01T00:00:00.000Z',
      tracklist: ['test-artist-opening-track', 'test-artist-second-track'],
    },
    'hidden-release': {
      slug: 'hidden-release',
      visible: false,
      date: '2019-01-01T00:00:00.000Z',
      tracklist: ['hidden-artist-should-not-appear'],
    },
  },
  tracks: [
    { slug: 'test-artist-opening-track' },
    { slug: 'test-artist-second-track' },
    { slug: 'hidden-artist-should-not-appear' },
  ],
  artists: [
    { slug: 'irukanji', visible: true },
    { slug: 'hidden', visible: false },
  ],
  videos: [
    { slug: 'visible-video', visible: true, date: '2021-05-01T00:00:00.000Z' },
    { slug: 'hidden-video', visible: false },
  ],
  playlists: {
    'visible-playlist': { slug: 'visible-playlist', visible: true },
    'hidden-playlist': { slug: 'hidden-playlist', visible: false },
  },
  events: [
    { slug: 'visible-event', visible: true, date: '2022-03-01T00:00:00.000Z' },
  ],
  friends: [
    { slug: 'visible-friend', visible: true },
    { slug: 'hidden-friend', visible: false },
  ],
}

describe('buildSitemapUrls', () => {
  it('includes visible detail URLs for every catalog entity type', () => {
    const locs = buildSitemapUrls(catalog).map(entry => entry.loc)

    expect(locs).toContain('/release/visible-release')
    expect(locs).toContain('/artist/irukanji')
    expect(locs).toContain('/video/visible-video')
    expect(locs).toContain('/playlist/visible-playlist')
    expect(locs).toContain('/event/visible-event')
    expect(locs).toContain('/friend/visible-friend')
  })

  it('excludes entities marked visible: false', () => {
    const locs = buildSitemapUrls(catalog).map(entry => entry.loc)

    expect(locs).not.toContain('/release/hidden-release')
    expect(locs).not.toContain('/artist/hidden')
    expect(locs).not.toContain('/video/hidden-video')
    expect(locs).not.toContain('/playlist/hidden-playlist')
    expect(locs).not.toContain('/friend/hidden-friend')
  })

  it('excludes auth and profile utility routes', () => {
    const locs = buildSitemapUrls(catalog).map(entry => entry.loc)

    for (const loc of locs) {
      expect(loc.startsWith('/profile')).toBe(false)
      expect(['/signin', '/signup', '/forgot-password', '/reset-password', '/confirm']).not.toContain(loc)
    }
  })

  it('derives track URLs from the tracks section, limited to visible releases', () => {
    const locs = buildSitemapUrls(catalog).map(entry => entry.loc)

    expect(locs).toContain('/track/test-artist-opening-track')
    expect(locs).toContain('/track/test-artist-second-track')
    expect(locs).not.toContain('/track/hidden-artist-should-not-appear')
  })

  it('includes public static/list pages', () => {
    const locs = buildSitemapUrls(catalog).map(entry => entry.loc)

    for (const staticLoc of ['/', '/news', '/releases', '/releases/all', '/releases/psytrance', '/releases/psychill', '/artists', '/artists/all', '/tracks', '/videos', '/playlists', '/events', '/friends', '/contacts']) {
      expect(locs).toContain(staticLoc)
    }
  })

  it('produces deterministic output for the same input', () => {
    expect(buildSitemapUrls(catalog)).toEqual(buildSitemapUrls(catalog))
  })
})
