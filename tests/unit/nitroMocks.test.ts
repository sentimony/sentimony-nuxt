import { afterEach, describe, expect, it } from 'vitest'
import { installNitroGlobals } from '../setup/nitroMocks'

const g = globalThis as Record<string, unknown>

describe('installNitroGlobals', () => {
  afterEach(() => {
    delete g.createError
  })

  it('installs passthrough defaults', () => {
    const restore = installNitroGlobals()
    const handler = () => 'ok'

    expect((g.defineEventHandler as (h: unknown) => unknown)(handler)).toBe(handler)
    expect((g.defineCachedEventHandler as (h: unknown) => unknown)(handler)).toBe(handler)
    expect(g.catalogCacheOptions).toBeTypeOf('function')
    expect((g.createError as (i: { statusMessage?: string }) => Error)({ statusMessage: 'boom' }).message).toBe('boom')
    restore()
  })

  it('applies overrides on top of defaults', () => {
    const createError = () => new Error('custom')
    const restore = installNitroGlobals({ createError, supabaseAdmin: 'stub' })

    expect(g.createError).toBe(createError)
    expect(g.supabaseAdmin).toBe('stub')
    expect(g.defineEventHandler).toBeTypeOf('function')
    restore()
  })

  it('restore removes new keys and puts previous values back', () => {
    g.createError = 'previous'
    const restore = installNitroGlobals({ supabaseAdmin: 'stub' })
    restore()

    expect(g.createError).toBe('previous')
    expect('supabaseAdmin' in g).toBe(false)
    expect('defineEventHandler' in g).toBe(false)
  })
})
