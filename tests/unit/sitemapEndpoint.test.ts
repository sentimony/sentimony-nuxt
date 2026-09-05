import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildSitemapUrls } from '../../server/utils/sitemapUrls'
import { installNitroGlobals } from '../setup/nitroMocks'

describe('/api/__sitemap__/urls', () => {
  let restore: () => void = () => {}

  afterEach(() => {
    restore()
  })

  it('returns the sitemap url builder output shape', async () => {
    restore = installNitroGlobals({
      defineSitemapEventHandler: (handler: () => unknown) => handler,
      buildSitemapUrls,
    })

    const handler = (await import('../../server/api/__sitemap__/urls.get')).default as () => Array<{ loc: string }>
    const result = handler()

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(entry => typeof entry.loc === 'string' && entry.loc.startsWith('/'))).toBe(true)
    expect(result.some(entry => entry.loc === '/')).toBe(true)
    expect(result.some(entry => entry.loc === '/release/va-fantazma')).toBe(true)
  })
})

describe('nuxt.config sitemap wiring', () => {
  it('registers the sitemap urls endpoint as a source', () => {
    const configSource = readFileSync(resolve(process.cwd(), 'nuxt.config.ts'), 'utf-8')
    expect(configSource).toMatch(/sources:\s*\[\s*['"]\/api\/__sitemap__\/urls['"]/)
  })
})
