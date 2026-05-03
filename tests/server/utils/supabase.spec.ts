import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('usesSupabaseContentSource', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    delete process.env.RELEASES_SOURCE
    delete process.env.NUXT_PUBLIC_SUPABASE_URL
    delete process.env.NUXT_PUBLIC_SUPABASE_KEY
  })

  it('uses Supabase when runtime config has public Supabase credentials', async () => {
    process.env.NUXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NUXT_PUBLIC_SUPABASE_KEY = 'sb_publishable_example'

    const { usesSupabaseContentSource } = await import('../../../server/utils/supabase')

    expect(usesSupabaseContentSource()).toBe(true)
  })

  it('keeps Firebase fallback when Supabase credentials are absent', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        supabaseUrl: '',
        supabaseKey: '',
      },
    }))

    const { usesSupabaseContentSource } = await import('../../../server/utils/supabase')

    expect(usesSupabaseContentSource()).toBe(false)
  })

  it('uses Firebase when RELEASES_SOURCE explicitly requests it', async () => {
    process.env.RELEASES_SOURCE = 'firebase'
    process.env.NUXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NUXT_PUBLIC_SUPABASE_KEY = 'sb_publishable_example'

    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        supabaseUrl: 'https://example.supabase.co',
        supabaseKey: 'sb_publishable_example',
      },
    }))

    const { usesSupabaseContentSource } = await import('../../../server/utils/supabase')

    expect(usesSupabaseContentSource()).toBe(false)
  })
})
