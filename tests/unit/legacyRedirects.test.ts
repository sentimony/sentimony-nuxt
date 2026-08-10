import { describe, expect, it } from 'vitest'
import { resolveLegacyRedirect } from '../../server/utils/legacyRedirects'

describe('resolveLegacyRedirect', () => {
  const cases: Array<[string, string | null]> = [
    ['/sencd097.htm', '/sencd097'],
    ['/artists.htm', '/artists'],
    ['/events.html', '/events'],
    ['/index.htm', '/'],
    ['/index.html', '/'],
    ['/artists/index.htm', '/artists/'],
    ['/events/index.html', '/events/'],
    ['/login', '/signin'],
    ['/login/', '/signin'],
    ['/release/va-futured-vol-1/googleplay', '/release/va-futured-vol-1/youtubemusic'],
    ['/release/zymosis-nichna/googleplaymarket', '/release/zymosis-nichna/youtubemusic'],
    ['/releases', null],
    ['/release/va-fantazma/spotify', null],
  ]

  for (const [input, expected] of cases) {
    it(`maps ${input} to ${expected ?? 'null'}`, () => {
      expect(resolveLegacyRedirect(input)).toBe(expected)
    })
  }
})
