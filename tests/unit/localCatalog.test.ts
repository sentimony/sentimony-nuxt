import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchFirebaseEntity } from '../../server/utils/firebaseCatalog'
import { fetchLocalCatalogNode } from '../../server/utils/localCatalog'
import { installNitroGlobals } from '../setup/nitroMocks'

describe('fetchLocalCatalogNode', () => {
  it('keys array collections from the YAML by slug', () => {
    const artists = fetchLocalCatalogNode<Record<string, { slug: string }>>('artists')
    expect(artists?.['frog-prog']?.slug).toBe('frog-prog')
  })

  it('resolves a nested collection/slug path', () => {
    const release = fetchLocalCatalogNode<{ title: string }>('releases/frog-prog-songs-of-buffo')
    expect(release?.title).toBe('Frog Prog «Songs Of Buffo»')
  })

  it('returns null for a missing path', () => {
    expect(fetchLocalCatalogNode('releases/no-such-release')).toBeNull()
  })
})

describe('fetchFirebaseEntity with the local catalog source', () => {
  let restore: () => void = () => {}

  afterEach(() => {
    restore()
  })

  it('reads from the YAML without a network call', async () => {
    const fetchSpy = vi.fn()
    restore = installNitroGlobals({
      useRuntimeConfig: () => ({ catalogSource: 'local', public: {} }),
      $fetch: fetchSpy,
    })

    const release = await fetchFirebaseEntity('releases', 'frog-prog-songs-of-buffo')
    expect(release?.cat_no).toBe('SENCD100')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
