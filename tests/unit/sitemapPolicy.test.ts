import { describe, expect, it } from 'vitest'
import { isSitemapEnabled } from '../../server/utils/sitemapPolicy'

describe('isSitemapEnabled', () => {
  it('is enabled by default', () => {
    expect(isSitemapEnabled({})).toBe(true)
  })

  it('honours the explicit flag', () => {
    expect(isSitemapEnabled({ NUXT_SITEMAP_ENABLED: 'false' })).toBe(false)
    expect(isSitemapEnabled({ NUXT_SITEMAP_ENABLED: 'true' })).toBe(true)
  })

  it('stays disabled on Netlify stage and deploy previews', () => {
    expect(isSitemapEnabled({ URL: 'https://stage--sentimony-nuxt.netlify.app' })).toBe(false)
    expect(isSitemapEnabled({ CONTEXT: 'deploy-preview' })).toBe(false)
    expect(isSitemapEnabled({ URL: 'https://sentimony.com', CONTEXT: 'production' })).toBe(true)
  })

  it('lets the explicit flag override the Netlify heuristics', () => {
    expect(isSitemapEnabled({
      NUXT_SITEMAP_ENABLED: 'true',
      URL: 'https://stage--sentimony-nuxt.netlify.app',
    })).toBe(true)

    expect(isSitemapEnabled({
      NUXT_SITEMAP_ENABLED: 'true',
      CONTEXT: 'deploy-preview',
    })).toBe(true)

    expect(isSitemapEnabled({
      NUXT_SITEMAP_ENABLED: 'false',
      URL: 'https://sentimony.com',
      CONTEXT: 'production',
    })).toBe(false)
  })
})
