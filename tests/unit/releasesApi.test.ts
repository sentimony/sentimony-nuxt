import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickListFields } from '../../server/utils/pickListFields'

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

describe('releases API', () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as Record<string, unknown>).defineCachedEventHandler = (handler: unknown) => handler
    ;(globalThis as Record<string, unknown>).catalogCacheOptions = () => ({})
    ;(globalThis as Record<string, unknown>).createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    ;(globalThis as Record<string, unknown>).mapReleaseFromSupabase = (row: Record<string, unknown>) => row
    ;(globalThis as Record<string, unknown>).pickListFields = pickListFields
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of [
      'defineCachedEventHandler',
      'catalogCacheOptions',
      'createError',
      'mapReleaseFromSupabase',
      'pickListFields',
      'isSupabaseCatalogSource',
      'useSupabase',
      'fetchFirebaseCollection',
    ]) {
      delete (globalThis as Record<string, unknown>)[key]
    }
  })

  it('includes release style when Firebase is the catalog source', async () => {
    ;(globalThis as Record<string, unknown>).isSupabaseCatalogSource = () => false
    ;(globalThis as Record<string, unknown>).fetchFirebaseCollection = vi.fn(async () => ({
      [release.slug]: { ...release, new: release.is_new },
    }))

    const { default: handler } = await import('../../server/api/releases.get')

    await expect(handler()).resolves.toMatchObject({
      [release.slug]: { style: 'Psytrance' },
    })
  })

  it('includes release style when Supabase is the catalog source', async () => {
    let selectedFields = ''
    ;(globalThis as Record<string, unknown>).isSupabaseCatalogSource = () => true
    ;(globalThis as Record<string, unknown>).useSupabase = () => ({
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
    })

    const { default: handler } = await import('../../server/api/releases.get')

    await expect(handler()).resolves.toEqual([
      expect.objectContaining({ style: 'Psytrance' }),
    ])
  })
})
