import { describe, expect, it } from 'vitest'
// @ts-expect-error - plain ESM script module without type declarations
import { assetTargets, dynamicRoutes, staticRoutes } from '../../scripts/lib/routes.mjs'

describe('shared route inventory', () => {
  it('covers every page kind used by web-debug', () => {
    for (const route of ['/', '/releases', '/artists', '/tracks', '/signin']) {
      expect(staticRoutes).toContain(route)
    }
  })

  it('has no duplicate static routes', () => {
    expect(new Set(staticRoutes as string[]).size).toBe((staticRoutes as string[]).length)
  })

  it('builds a slug-based path for every dynamic route', () => {
    expect((dynamicRoutes as unknown[]).length).toBeGreaterThan(0)
    for (const route of dynamicRoutes as { api: string, path: (slug: string) => string }[]) {
      expect(route.api.startsWith('/api/')).toBe(true)
      const path = route.path('x')
      expect(path.startsWith('/')).toBe(true)
      expect(path).toContain('x')
    }
  })

  it('lists one asset target per delivery host', () => {
    const hosts = (assetTargets as { label: string, url: string }[]).map(target => new URL(target.url).host)
    expect(hosts).toContain('content.sentimony.com')
    expect(hosts.some(host => host.endsWith('r2.dev'))).toBe(true)
  })
})
