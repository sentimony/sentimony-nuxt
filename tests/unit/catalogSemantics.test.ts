import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

const listPages = [
  'app/pages/release/[id].vue',
  'app/pages/track/[id].vue',
  'app/pages/artist/[id].vue',
  'app/pages/event/[id].vue',
  'app/pages/tracks.vue',
  'app/pages/playlist/[id].vue',
  'app/components/player/PagePlayer.vue',
  'app/components/AudioMixPlayer.vue',
]

// Release credits are CMS paragraphs, not a list; every other repeated block is one.
const allowedParagraphLoops: Record<string, number> = { 'app/pages/release/[id].vue': 1 }

describe('catalog lists are list elements', () => {
  it.each(listPages)('%s repeats items as <li>, never as <p>', (path) => {
    const source = readProjectFile(path)
    const repeatedParagraphs = source.match(/<p\s*\n\s*v-for=/g) ?? []
    expect(repeatedParagraphs.length, 'v-for on <p> is a list wearing paragraph markup').toBe(allowedParagraphLoops[path] ?? 0)
    expect(source).toMatch(/<(ol|ul)[^>]*class="[^"]*list-none/)
    expect(source).toMatch(/<li\s*\n\s*v-for=/)
  })

  it('playlist releases are list items with a nested tracklist', () => {
    const source = readProjectFile('app/pages/playlist/[id].vue')
    const listStart = source.indexOf('<ul class="list-none">')
    const firstChild = source.slice(listStart).match(/<(?!template)[a-z]+/g)?.[1]
    expect(firstChild).toBe('<li')
    expect(source).not.toContain('<ol class="list-decimal')
  })

  it('artist page renders releases from a filtered list, not empty paragraphs', () => {
    const source = readProjectFile('app/pages/artist/[id].vue')
    expect(source).toContain('const artistReleases = computed(')
    expect(source).toContain('v-if="artistReleases.length > 0"')
    expect(source).not.toMatch(/<RelativeItem\s*\n\s*v-if="i\.artists/)
  })
})

describe('embedded players are named', () => {
  const pages = [
    'app/pages/release/[id].vue',
    'app/pages/track/[id].vue',
    'app/pages/artist/[id].vue',
    'app/pages/video/[id].vue',
    'app/pages/playlist/[id].vue',
  ]

  it.each(pages)('%s gives every <iframe> a title with a spaced label', (path) => {
    const source = readProjectFile(path)
    const iframes = source.match(/<iframe\b[^>]*>/g) ?? []
    expect(iframes.length).toBeGreaterThan(0)
    for (const iframe of iframes) {
      const title = iframe.match(/:?title="([^"]*)"/)?.[1]
      expect(title, 'iframe without a title').toBeTruthy()
      expect(title).not.toMatch(/\+ '[A-Za-z]/)
      expect(title).not.toContain('Iframe')
    }
  })
})

describe('catalog images declare their dimensions', () => {
  const files = [
    'app/components/OpenImage.vue',
    'app/components/RelativeItem.vue',
    'app/pages/artist/[id].vue',
    'app/pages/friend/[id].vue',
  ]

  it.each(files)('%s sets width and height on every rendered <img>', (path) => {
    const source = readProjectFile(path)
    // The zoom dialog image is viewport-bound; its size is unknown before load.
    const images = (source.match(/<img\b[^>]*>/g) ?? []).filter(image => !image.includes('vh]'))
    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      expect(image, 'img without width').toMatch(/:?width=/)
      expect(image, 'img without height').toMatch(/:?height=/)
    }
  })
})

describe('embedded player heights come from one map', () => {
  it('release and track pages carry no page-level style block', () => {
    for (const file of ['app/pages/release/[id].vue', 'app/pages/track/[id].vue']) {
      expect(readProjectFile(file)).not.toContain('<style')
    }
  })

  it('tailwind.css holds the superset of both former maps', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')
    for (const selector of ['.BandcampIframe.tracks-1', '.BandcampIframe.tracks-22', '.SoundcloudIframe.tracks-27']) {
      expect(css).toContain(selector)
    }
  })
})
