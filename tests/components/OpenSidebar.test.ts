import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../../app/components/OpenSidebar.vue'), 'utf8')

describe('OpenSidebar.vue', () => {
  it('contains no raw <img> tags', () => {
    expect(src).not.toMatch(/<img\s/)
  })
  it('uses <NuxtImg> for social icon fallback', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="i\.icon\.url"/)
  })
})
