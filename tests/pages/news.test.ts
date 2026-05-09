import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../../app/pages/news.vue'), 'utf8')

describe('pages/news.vue', () => {
  it('contains no raw <img> tags', () => {
    expect(src).not.toMatch(/<img\s/)
  })
  it('contains no commented <img> stubs', () => {
    expect(src).not.toMatch(/<!--\s*<img/)
  })
  it('uses <NuxtImg> for the news thumbnail', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="i\.image"/)
  })
})
