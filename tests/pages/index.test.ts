import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../../app/pages/index.vue'), 'utf8')

describe('pages/index.vue', () => {
  it('contains no raw <img> tags', () => {
    expect(src).not.toMatch(/<img\s/)
  })
  it('contains no commented <img> stubs', () => {
    expect(src).not.toMatch(/<!--\s*<img/)
  })
  it('uses <NuxtImg> for both logos', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="logoNewUrlv1"/)
    expect(src).toMatch(/<NuxtImg[^>]*:src="logoOldUrl"/)
  })
})
