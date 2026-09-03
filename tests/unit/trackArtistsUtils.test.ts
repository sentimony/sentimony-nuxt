import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installNitroGlobals } from '../setup/nitroMocks'

describe('trackArtists utils degrade on query errors', () => {
  let restore: () => void = () => {}

  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    restore()
  })

  function mockError(message: string) {
    const result = { data: null, error: { message } }
    restore = installNitroGlobals({
      supabaseAdmin: () => ({
        from: () => ({
          select: () => ({
            eq: (..._args: unknown[]) => ({
              order: async () => result,
              then: (resolve: (value: typeof result) => unknown) => resolve(result),
            }),
            in: async () => result,
          }),
        }),
      }),
    })
  }

  it('fetchTrackArtistSlugs returns [] when the table is missing', async () => {
    mockError('relation "public.track_artists" does not exist')
    const { fetchTrackArtistSlugs } = await import('../../server/utils/trackArtists')

    await expect(fetchTrackArtistSlugs('some-track')).resolves.toEqual([])
    expect(console.warn).toHaveBeenCalled()
  })

  it('fetchCoArtistTrackSlugs returns an empty set on error', async () => {
    mockError('boom')
    const { fetchCoArtistTrackSlugs } = await import('../../server/utils/trackArtists')

    await expect(fetchCoArtistTrackSlugs(['zymosis'])).resolves.toEqual(new Set())
  })

  it('fetchArtistTrackSlugs returns an empty set on error', async () => {
    mockError('boom')
    const { fetchArtistTrackSlugs } = await import('../../server/utils/trackArtists')

    await expect(fetchArtistTrackSlugs('zymosis')).resolves.toEqual(new Set())
  })
})
