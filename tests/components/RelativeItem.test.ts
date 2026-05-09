import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../../app/components/RelativeItem.vue'), 'utf8')

describe('RelativeItem.vue', () => {
  it('contains no raw <img> tags', () => {
    expect(src).not.toMatch(/<img\s/)
  })
  it('uses <NuxtImg> for cover_th', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="i\.cover_th"/)
  })
  it('uses <NuxtImg> for photo_th', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="i\.photo_th"/)
  })
})
