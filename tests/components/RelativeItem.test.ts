import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const file = resolve(process.cwd(), 'app/components/RelativeItem.vue')
const src = readFileSync(file, 'utf8')

describe('RelativeItem.vue', () => {
  it('uses <NuxtImg> not raw <img>', () => {
    expect(src).not.toMatch(/<img\s/)
    expect(src).toMatch(/<NuxtImg/)
  })

  it('binds :src to cover_th and photo_th', () => {
    expect(src).toMatch(/:src="i\.cover_th"/)
    expect(src).toMatch(/:src="i\.photo_th"/)
  })
})
