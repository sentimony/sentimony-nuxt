import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../../app/components/Item.vue'), 'utf8')

describe('Item.vue', () => {
  it('contains no raw <img> tags', () => {
    expect(src).not.toMatch(/<img\s/)
  })
  it('contains no commented <img> stubs', () => {
    expect(src).not.toMatch(/<!--\s*<img/)
  })
  it('uses <NuxtImg> for cover_th', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="i\.cover_th"/)
  })
  it('uses <NuxtImg> for photo_th', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="i\.photo_th"/)
  })
  it('uses <NuxtImg> for flyer_a_xl', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="i\.flyer_a_xl"/)
  })
})
