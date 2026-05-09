import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(process.cwd(), 'app/components/Testimonials.vue'), 'utf8')

describe('Testimonials.vue', () => {
  it('contains no raw <img> tags (including commented)', () => {
    expect(src).not.toMatch(/<img\s/)
  })
})
