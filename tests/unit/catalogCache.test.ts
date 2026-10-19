import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadCatalogCacheOptions(nodeEnv: string) {
  vi.stubEnv('NODE_ENV', nodeEnv)
  vi.resetModules()
  const { catalogCacheOptions } = await import('../../server/utils/catalogCache')
  return catalogCacheOptions()
}

describe('catalogCacheOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // Nitro reads `maxAge: 0` as "never expires", so dev must bypass the cache instead.
  it('bypasses the server cache in dev so catalog edits show on reload', async () => {
    const options = await loadCatalogCacheOptions('development')
    expect(options.shouldBypassCache()).toBe(true)
  })

  it('keeps the cache with swr in production', async () => {
    const options = await loadCatalogCacheOptions('production')
    expect(options.shouldBypassCache()).toBe(false)
    expect(options.maxAge).toBe(60 * 60)
    expect(options.swr).toBe(true)
  })
})
