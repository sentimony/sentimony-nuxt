import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve(__dirname, '../../app/components/Testimonials.vue'), 'utf8')

describe('Testimonials.vue', () => {
  it('contains no raw <img> tags', () => {
    expect(src).not.toMatch(/<img\s/)
  })
  it('contains no commented-out <img> tags', () => {
    expect(src).not.toMatch(/<!-- <img/)
  })
})
