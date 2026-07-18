import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('artist page API', () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as Record<string, unknown>).defineCachedEventHandler = (handler: unknown) => handler
    ;(globalThis as Record<string, unknown>).catalogCacheOptions = () => ({})
    ;(globalThis as Record<string, unknown>).createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    ;(globalThis as Record<string, unknown>).isSupabaseCatalogSource = () => false
    ;(globalThis as Record<string, unknown>).isPublicEntity = (value: Record<string, unknown> | null) => value?.visible === true
    ;(globalThis as Record<string, unknown>).fetchFirebaseEntity = vi.fn(async () => ({
      slug: 'yngvarr',
      title: 'Yngvarr',
      visible: false,
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (globalThis as Record<string, unknown>).defineCachedEventHandler
    delete (globalThis as Record<string, unknown>).catalogCacheOptions
    delete (globalThis as Record<string, unknown>).createError
    delete (globalThis as Record<string, unknown>).isSupabaseCatalogSource
    delete (globalThis as Record<string, unknown>).isPublicEntity
    delete (globalThis as Record<string, unknown>).fetchFirebaseEntity
  })

  it('returns hidden artists by direct slug route', async () => {
    const { default: handler } = await import('../../server/api/artist/[id].get')

    await expect(handler({
      context: {
        params: { id: 'yngvarr' },
      },
    } as never)).resolves.toMatchObject({
      slug: 'yngvarr',
      title: 'Yngvarr',
      visible: false,
    })
  })
})
