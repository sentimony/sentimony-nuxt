import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createMockEvent } from '../../utils/createMockEvent'
import { createSupabaseChainMock, type SupabaseChainMock } from '../../utils/supabaseChainMock'

let supabaseClient: SupabaseChainMock = createSupabaseChainMock()
const supabaseAdminMock = vi.fn(() => supabaseClient)

vi.stubGlobal('supabaseAdmin', () => supabaseAdminMock())
vi.stubGlobal('getRouterParam', (event: { context: { params: Record<string, string> } }, name: string) =>
  event.context.params[name],
)
vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode?: number, statusMessage?: string }
  err.statusCode = opts.statusCode
  err.statusMessage = opts.statusMessage
  return err
})

describe('GET /api/tracks/[release_slug]', () => {
  beforeEach(() => {
    vi.resetModules()
    supabaseAdminMock.mockClear()
    supabaseClient = createSupabaseChainMock()
    delete process.env.RELEASES_SOURCE
  })

  it('returns [] without querying Supabase when content source is Firebase', async () => {
    process.env.RELEASES_SOURCE = 'firebase'

    const handler = (await import('../../../server/api/tracks/[release_slug].get')).default
    const result = await handler(createMockEvent({ params: { release_slug: 'release-a' } }) as never)

    expect(result).toEqual([])
    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })
})
