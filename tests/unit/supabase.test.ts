import { describe, expect, expectTypeOf, it } from 'vitest'
import { mapReleaseFromSupabase } from '../../server/utils/supabase'

describe('mapReleaseFromSupabase', () => {
  it('preserves release fields while mapping Supabase compact field names', () => {
    const release = mapReleaseFromSupabase({
      slug: 'va-gamayun-tale',
      title: 'VA - Gamayun Tale',
      visible: true,
      is_new: false,
      tracklist_compact: [{ p: 'Track 1' }],
      credits_compact: [{ p: 'Credit 1' }],
    })

    expectTypeOf(release.slug).toEqualTypeOf<string>()
    expect(release).toEqual({
      slug: 'va-gamayun-tale',
      title: 'VA - Gamayun Tale',
      visible: true,
      new: false,
      tracklistCompact: [{ p: 'Track 1' }],
      creditsCompact: [{ p: 'Credit 1' }],
    })
  })
})
