import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PAGES = [
  { file: 'app/pages/release/[id].vue', label: 'release' },
  { file: 'app/pages/artist/[id].vue', label: 'artist' },
  { file: 'app/pages/playlist/[id].vue', label: 'playlist' },
  { file: 'app/pages/video/[id].vue', label: 'video' },
]

for (const { file, label } of PAGES) {
  const src = readFileSync(resolve(__dirname, '..', file), 'utf8')
  describe(`page contract: ${label}`, () => {
    it('contains zero raw <iframe> tags', () => {
      expect(src).not.toMatch(/<iframe\b/)
    })
    it('renders LazyIframe (the single-iframe component)', () => {
      const matches = src.match(/<LazyIframe\b/g) ?? []
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
    it('uses useTabState with the default platform "youtube"', () => {
      expect(src).toMatch(new RegExp(`useTabState\\(\\s*['"]${label}['"]\\s*,\\s*['"]youtube['"]\\s*\\)`))
    })
  })
}
