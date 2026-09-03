import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installNitroGlobals } from '../setup/nitroMocks'

describe('artist page API', () => {
  let restore: () => void

  beforeEach(() => {
    vi.resetModules()
    restore = installNitroGlobals({
      isSupabaseCatalogSource: () => false,
      isPublicEntity: (value: Record<string, unknown> | null) => value?.visible === true,
      fetchFirebaseEntity: vi.fn(async () => ({
        slug: 'yngvarr',
        title: 'Yngvarr',
        visible: false,
      })),
    })
  })

  afterEach(() => {
    restore()
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
