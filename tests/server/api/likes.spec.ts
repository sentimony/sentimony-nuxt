import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSupabaseChainMock, type SupabaseChainMock } from '../../utils/supabaseChainMock'
import { createMockEvent } from '../../utils/createMockEvent'

const supabaseUserMock = vi.fn()
vi.mock('#supabase/server', () => ({
  serverSupabaseUser: (...args: unknown[]) => supabaseUserMock(...args),
}))

let supabaseClient: SupabaseChainMock = createSupabaseChainMock()
const supabaseAdminMock = vi.fn(() => supabaseClient)

vi.stubGlobal('supabaseAdmin', () => supabaseAdminMock())
vi.stubGlobal('getRouterParam', (event: { context: { params: Record<string, string> } }, name: string) =>
  event.context.params[name],
)
vi.stubGlobal('readBody', async (event: { _body: unknown }) => event._body)
vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode?: number, statusMessage?: string }
  err.statusCode = opts.statusCode
  err.statusMessage = opts.statusMessage
  return err
})

describe('GET /api/likes', () => {
  beforeEach(() => {
    supabaseUserMock.mockReset()
    supabaseAdminMock.mockClear()
    supabaseClient = createSupabaseChainMock()
  })

  it('повертає масив release_slug для залогіненого юзера', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })
    supabaseClient = createSupabaseChainMock({
      data: [{ release_slug: 'rel-a' }, { release_slug: 'rel-b' }],
      error: null,
    })

    const handler = (await import('../../../server/api/likes.get')).default
    const result = await handler(createMockEvent() as never)

    expect(result).toEqual(['rel-a', 'rel-b'])
    expect(supabaseClient.from).toHaveBeenCalledWith('release_likes')
    expect(supabaseClient.select).toHaveBeenCalledWith('release_slug')
    expect(supabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('повертає [] для незалогіненого гостя без виклику Supabase', async () => {
    supabaseUserMock.mockResolvedValue(null)

    const handler = (await import('../../../server/api/likes.get')).default
    const result = await handler(createMockEvent() as never)

    expect(result).toEqual([])
    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })

  it('повертає [] коли в БД немає рядків для юзера', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-2' })
    supabaseClient = createSupabaseChainMock({ data: null, error: null })

    const handler = (await import('../../../server/api/likes.get')).default
    const result = await handler(createMockEvent() as never)

    expect(result).toEqual([])
  })
})

describe('POST /api/likes', () => {
  beforeEach(() => {
    supabaseUserMock.mockReset()
    supabaseAdminMock.mockClear()
    supabaseClient = createSupabaseChainMock()
  })

  it('upsert-ить лайк і повертає { ok: true }', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })
    supabaseClient = createSupabaseChainMock({ error: null })

    const handler = (await import('../../../server/api/likes.post')).default
    const result = await handler(createMockEvent({ body: { slug: 'rel-x' } }) as never)

    expect(result).toEqual({ ok: true })
    expect(supabaseClient.from).toHaveBeenCalledWith('release_likes')
    expect(supabaseClient.upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', release_slug: 'rel-x' },
      { onConflict: 'user_id,release_slug', ignoreDuplicates: true },
    )
  })

  it('кидає 401 для незалогіненого', async () => {
    supabaseUserMock.mockResolvedValue(null)

    const handler = (await import('../../../server/api/likes.post')).default
    await expect(
      handler(createMockEvent({ body: { slug: 'rel-x' } }) as never),
    ).rejects.toMatchObject({ statusCode: 401 })

    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })

  it('кидає 400 коли slug відсутній у body', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })

    const handler = (await import('../../../server/api/likes.post')).default
    await expect(
      handler(createMockEvent({ body: {} }) as never),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/likes/[slug]', () => {
  beforeEach(() => {
    supabaseUserMock.mockReset()
    supabaseAdminMock.mockClear()
    supabaseClient = createSupabaseChainMock()
  })

  it('видаляє рядок за парою (user, slug) і повертає { ok: true }', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })
    supabaseClient = createSupabaseChainMock({ error: null })

    const handler = (await import('../../../server/api/likes/[slug].delete')).default
    const result = await handler(createMockEvent({ params: { slug: 'rel-y' } }) as never)

    expect(result).toEqual({ ok: true })
    expect(supabaseClient.delete).toHaveBeenCalled()
    expect(supabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(supabaseClient.eq).toHaveBeenCalledWith('release_slug', 'rel-y')
  })

  it('кидає 401 для незалогіненого', async () => {
    supabaseUserMock.mockResolvedValue(null)

    const handler = (await import('../../../server/api/likes/[slug].delete')).default
    await expect(
      handler(createMockEvent({ params: { slug: 'rel-y' } }) as never),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('кидає 400 коли slug відсутній у route params', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })

    const handler = (await import('../../../server/api/likes/[slug].delete')).default
    await expect(
      handler(createMockEvent({ params: {} }) as never),
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('GET /api/likes/count/[slug]', () => {
  beforeEach(() => {
    supabaseAdminMock.mockClear()
    supabaseClient = createSupabaseChainMock()
  })

  it('повертає { count } з head-select для slug', async () => {
    supabaseClient = createSupabaseChainMock({ count: 42, error: null })

    const handler = (await import('../../../server/api/likes/count/[slug].get')).default
    const result = await handler(createMockEvent({ params: { slug: 'rel-z' } }) as never)

    expect(result).toEqual({ count: 42 })
    expect(supabaseClient.from).toHaveBeenCalledWith('release_likes')
    expect(supabaseClient.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
    expect(supabaseClient.eq).toHaveBeenCalledWith('release_slug', 'rel-z')
  })

  it('повертає { count: 0 } коли БД повертає null', async () => {
    supabaseClient = createSupabaseChainMock({ count: null, error: null })

    const handler = (await import('../../../server/api/likes/count/[slug].get')).default
    const result = await handler(createMockEvent({ params: { slug: 'rel-z' } }) as never)

    expect(result).toEqual({ count: 0 })
  })

  it('кидає 400 без slug', async () => {
    const handler = (await import('../../../server/api/likes/count/[slug].get')).default
    await expect(
      handler(createMockEvent({ params: {} }) as never),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })
})
