import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../../app/components/BtnPrimary.vue'), 'utf8')

describe('BtnPrimary.vue', () => {
  it('contains no raw <img> tags', () => {
    expect(src).not.toMatch(/<img\s/)
  })
  it('uses <NuxtImg> for the optional img prop', () => {
    expect(src).toMatch(/<NuxtImg[^>]*:src="img"/)
  })
})
