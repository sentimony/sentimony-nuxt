import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('profile collection status', () => {
  it('keeps retry and pagination actions mounted while they load', () => {
    const status = readProjectFile('app/components/CollectionStatus.vue')

    expect(status.indexOf('v-if="error"')).toBeLessThan(
      status.indexOf('v-else-if="loading && !loaded"'),
    )
    expect(status).toContain("{{ loading ? 'Retrying…' : 'Try again' }}")
    expect(status).toContain("{{ loading ? 'Loading…' : `Show more · ${remaining} left` }}")
    expect(status.match(/:disabled="loading"/g)).toHaveLength(2)
  })

  it('receives the resolved state from every collection page', () => {
    for (const path of [
      'app/components/ProfileCollectionPage.vue',
      'app/pages/profile/tracks.vue',
    ]) {
      expect(readProjectFile(path)).toContain(':loaded="')
    }
  })
})
