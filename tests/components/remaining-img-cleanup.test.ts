import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = resolve(__dirname, '../..')

const openImageSrc = readFileSync(resolve(repoRoot, 'app/components/OpenImage.vue'), 'utf8')
const friendPageSrc = readFileSync(resolve(repoRoot, 'app/pages/friend/[id].vue'), 'utf8')
const trackPageSrc = readFileSync(resolve(repoRoot, 'app/pages/track/[id].vue'), 'utf8')

describe('app/components/OpenImage.vue', () => {
  it('contains no raw <img> tags (single- or multi-line)', () => {
    expect(openImageSrc).not.toMatch(/<img[^a-zA-Z]/)
  })

  it('uses NuxtImg for the image_th thumbnail', () => {
    expect(openImageSrc).toMatch(/<NuxtImg[\s\S]*?image_th/)
  })

  it('uses NuxtImg for the props.image_xl modal image', () => {
    expect(openImageSrc).toMatch(/<NuxtImg[\s\S]*?props\.image_xl/)
  })
})

describe('app/pages/friend/[id].vue', () => {
  it('contains no raw <img> tags (single- or multi-line)', () => {
    expect(friendPageSrc).not.toMatch(/<img[^a-zA-Z]/)
  })

  it('uses NuxtImg for item.cover_th', () => {
    expect(friendPageSrc).toMatch(/<NuxtImg[\s\S]*?item\.cover_th/)
  })
})

describe('app/pages/track/[id].vue', () => {
  it('contains no raw <img> tags (single- or multi-line)', () => {
    expect(trackPageSrc).not.toMatch(/<img[^a-zA-Z]/)
  })

  it('uses NuxtImg for artist.photo_th', () => {
    expect(trackPageSrc).toMatch(/<NuxtImg[\s\S]*?artist\.photo_th/)
  })
})
