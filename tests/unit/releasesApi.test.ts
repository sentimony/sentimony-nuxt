import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickListFields } from '../../server/utils/pickListFields'
import { fakeEvent, installNitroGlobals } from '../setup/nitroMocks'

const release = {
  slug: 'va-ocean-scenes-higher-titans',
  title: 'VA Ocean Scenes: Higher Titans',
  cover_xl: '/cover.jpg',
  date: '2009-11-21T12:00:00.000Z',
  visible: true,
  coming_soon: false,
  is_new: false,
  artists: 'irukanji',
  at_playlists: 'sentimony-official',
  style: 'Psytrance',
}

const shared = {
  mapReleaseFromSupabase: (row: Record<string, unknown>) => row,
  pickListFields,
}

describe('releases API', () => {
  let restore: () => void = () => {}

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    restore()
  })

  it('includes release style when Firebase is the catalog source', async () => {
    restore = installNitroGlobals({
      ...shared,
      isSupabaseCatalogSource: () => false,
      fetchFirebaseCollection: vi.fn(async () => ({
        [release.slug]: { ...release, new: release.is_new },
      })),
    })

    const { default: handler } = await import('../../server/api/releases.get')

    await expect(handler(fakeEvent())).resolves.toMatchObject({
      [release.slug]: { style: 'Psytrance' },
    })
  })

  it('includes release style when Supabase is the catalog source', async () => {
    let selectedFields = ''
    restore = installNitroGlobals({
      ...shared,
      isSupabaseCatalogSource: () => true,
      useSupabase: () => ({
        from: () => ({
          select: (fields: string) => {
            selectedFields = fields
            return {
              eq: () => ({
                order: async () => ({
                  data: [Object.fromEntries(
                    selectedFields.split(',').map(field => field.trim()).map(field => [field, release[field as keyof typeof release]])
                  )],
                  error: null,
                }),
              }),
            }
          },
        }),
      }),
    })

    const { default: handler } = await import('../../server/api/releases.get')

    await expect(handler(fakeEvent())).resolves.toEqual([
      expect.objectContaining({ style: 'Psytrance' }),
    ])
  })
})
