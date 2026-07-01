import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchFirebaseEntity } from '../../server/utils/firebaseCatalog'

describe('fetchFirebaseEntity', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete (globalThis as Record<string, unknown>).useRuntimeConfig
    delete (globalThis as Record<string, unknown>).$fetch
  })

  it('finds entities by slug when Firebase stores the collection under numeric keys', async () => {
    ;(globalThis as Record<string, unknown>).useRuntimeConfig = () => ({
      public: { firebaseBase: 'https://example.firebaseio.com' },
    })

    ;(globalThis as Record<string, unknown>).$fetch = vi.fn(async (url: string) => {
      if (url === 'https://example.firebaseio.com/artists/irukanji.json') return null
      if (url === 'https://example.firebaseio.com/artists.json') {
        return {
          0: { slug: 'irukanji', title: 'Irukanji', visible: true },
          1: { slug: 'hidden', title: 'Hidden', visible: false },
        }
      }
      return null
    })

    await expect(fetchFirebaseEntity('artists', 'irukanji')).resolves.toEqual({
      slug: 'irukanji',
      title: 'Irukanji',
      visible: true,
    })
  })
})
