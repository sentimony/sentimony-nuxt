import { describe, expect, it } from 'vitest'
import { buildSitemapUrls, type SitemapCatalogExport } from '../../server/utils/sitemapUrls'

const catalog: SitemapCatalogExport = {
  releases: {
    'visible-release': {
      slug: 'visible-release',
      visible: true,
      date: '2020-01-01T00:00:00.000Z',
      tracklistCompact: [
        { p: '<small>01.</small> <b>Test Artist</b> - Opening Track <small>(120bpm)</small>' },
        { p: '<small>02.</small> <b>Test Artist</b> - Second Track <small>(128bpm)</small>' },
      ],
    },
    'hidden-release': {
      slug: 'hidden-release',
      visible: false,
      date: '2019-01-01T00:00:00.000Z',
      tracklistCompact: [
        { p: '<small>01.</small> <b>Hidden Artist</b> - Should Not Appear' },
      ],
    },
  },
  artists: {
    irukanji: { slug: 'irukanji', visible: true },
    hidden: { slug: 'hidden', visible: false },
  },
  videos: {
    'visible-video': { slug: 'visible-video', visible: true, date: '2021-05-01T00:00:00.000Z' },
    'hidden-video': { slug: 'hidden-video', visible: false },
  },
  playlists: {
    'visible-playlist': { slug: 'visible-playlist', visible: true },
    'hidden-playlist': { slug: 'hidden-playlist', visible: false },
  },
  events: {
    'visible-event': { slug: 'visible-event', visible: true, date: '2022-03-01T00:00:00.000Z' },
  },
  friends: {
    'visible-friend': { slug: 'visible-friend', visible: true },
    'hidden-friend': { slug: 'hidden-friend', visible: false },
  },
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

  it('derives track URLs from visible releases using the tracklistCompact slug logic', () => {
    const locs = buildSitemapUrls(catalog).map(entry => entry.loc)

    expect(locs).toContain('/track/visible-release-1')
    expect(locs).toContain('/track/visible-release-2')
    expect(locs).not.toContain('/track/hidden-release-1')
  })

  it('includes public static/list pages', () => {
    const locs = buildSitemapUrls(catalog).map(entry => entry.loc)

    for (const staticLoc of ['/', '/news', '/releases', '/artists', '/tracks', '/videos', '/playlists', '/events', '/friends', '/contacts']) {
      expect(locs).toContain(staticLoc)
    }
  })

  it('produces deterministic output for the same input', () => {
    expect(buildSitemapUrls(catalog)).toEqual(buildSitemapUrls(catalog))
  })
})
