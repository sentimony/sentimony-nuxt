import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(process.cwd(), 'app/components/Footer.vue'), 'utf8')

describe('Footer.vue', () => {
  it('uses <NuxtImg> not raw <img>', () => {
    expect(src).not.toMatch(/<img\s/)
    expect(src).toMatch(/<NuxtImg/)
  })
})
