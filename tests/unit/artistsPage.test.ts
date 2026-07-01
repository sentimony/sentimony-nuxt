import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('artists page', () => {
  const source = readFileSync(resolve(process.cwd(), 'app/pages/artists.vue'), 'utf8')

  it('renders artist categories in the configured order', () => {
    const musicianIndex = source.indexOf('v-for="i in artistsSortedByCategoryIdMusician"')
    const djIndex = source.indexOf('v-for="i in artistsSortedByCategoryIdDj"')
    const masteringIndex = source.indexOf('v-for="i in artistsSortedByCategoryIdMastering"')
    const designerIndex = source.indexOf('v-for="i in artistsSortedByCategoryIdDesigner"')

    expect(musicianIndex).toBeGreaterThanOrEqual(0)
    expect(djIndex).toBeGreaterThan(musicianIndex)
    expect(masteringIndex).toBeGreaterThan(djIndex)
    expect(designerIndex).toBeGreaterThan(masteringIndex)
  })

  it('uses the shared catalog artist sort', () => {
    expect(source).toContain('sortArtistsForCatalog(artists.value)')
  })
})
