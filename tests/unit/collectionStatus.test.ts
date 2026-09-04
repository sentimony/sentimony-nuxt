import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('CollectionStatus', () => {
  const source = () => readProjectFile('app/components/CollectionStatus.vue')

  it('keeps retry ahead of loading so a failure is not masked', () => {
    expect(source().indexOf('v-if="error"')).toBeLessThan(
      source().indexOf('v-else-if="loading && !loaded"'),
    )
    expect(source()).toContain('role="alert"')
  })

  it('announces progress from an always-mounted status region', () => {
    const statusIndex = source().indexOf('role="status"')
    expect(statusIndex).toBeGreaterThan(-1)
    expect(statusIndex, 'the live region must exist before the first state change').toBeLessThan(source().indexOf('v-if="error"'))
    expect(source()).toMatch(/role="status"\s+aria-live="polite"\s+aria-atomic="true"/)
    expect(source()).toContain('collectionAnnouncement(next, previous)')
  })

  it('keeps both actions mounted while they load', () => {
    expect(source()).toContain("{{ loading ? 'Retrying…' : 'Try again' }}")
    expect(source()).toContain("{{ loading ? 'Loading…' : `Show more · ${remaining} left` }}")
    expect(source().match(/:disabled="loading"/g)).toHaveLength(2)
  })

  it('takes an overridable empty message and optional pagination props', () => {
    expect(source()).toContain('emptyText?: string')
    expect(source()).toContain('hasMore?: boolean')
    expect(source()).toContain('remaining?: number')
    expect(source()).toContain("emptyText: 'Nothing saved here yet'")
  })
})

describe('list pages report their state', () => {
  const LIST_FILES = [
    'app/pages/releases/index.vue',
    'app/pages/videos.vue',
    'app/pages/events.vue',
    'app/pages/playlists.vue',
    'app/pages/friends.vue',
    'app/pages/news.vue',
    'app/pages/artists/index.vue',
    'app/pages/artists/all.vue',
    'app/pages/releases/all.vue',
    'app/pages/tracks.vue',
    'app/components/ReleasesFiltered.vue',
  ]

  it('mounts the shared status on every list surface', () => {
    for (const file of LIST_FILES) {
      const source = readProjectFile(file)
      expect(source, `${file} renders no empty or error state`).toContain('<CollectionStatus')
      expect(source, `${file} never reads the request status`).toContain("status === 'pending'")
      expect(source, `${file} offers no retry`).toContain('@retry="refresh()"')
    }
  })

  it('gives the genre filter its own empty line', () => {
    expect(readProjectFile('app/components/ReleasesFiltered.vue'))
      .toContain('empty-text="No releases in this genre yet"')
  })

  it('receives the resolved state from the profile collection pages', () => {
    for (const file of ['app/components/ProfileCollectionPage.vue', 'app/pages/profile/tracks.vue']) {
      expect(readProjectFile(file)).toContain(':loaded="')
    }
  })

  it('leaves no reference to the profile-only component name', () => {
    for (const file of [...LIST_FILES, 'app/components/ProfileCollectionPage.vue', 'app/pages/profile/tracks.vue']) {
      expect(readProjectFile(file)).not.toContain('ProfileCollectionStatus')
    }
  })
})
