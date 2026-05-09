import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const APP_DIR = resolve(__dirname, '../app')

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

describe('background-images', () => {
  it('no bg-[url(...)] utilities remain in app/', () => {
    const offenders: string[] = []
    for (const file of walk(APP_DIR)) {
      const src = readFileSync(file, 'utf8')
      if (/bg-\[url\(/.test(src)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })

  it('app.vue includes the body-level background NuxtImg', () => {
    const src = readFileSync(resolve(__dirname, '../app/app.vue'), 'utf8')
    expect(src).toMatch(/<NuxtImg[^>]*trees-green_v5\.jpg/)
    expect(src).toMatch(/fixed inset-0 -z-10/)
  })

  it('Testimonials.vue uses positioned NuxtImg for mandala', () => {
    const src = readFileSync(resolve(__dirname, '../app/components/Testimonials.vue'), 'utf8')
    expect(src).toMatch(/<NuxtImg[^>]*mandala-01\.svg/)
    expect(src).not.toMatch(/bg-\[url\(/)
  })

  it('error.vue no longer has body.isError style block', () => {
    const src = readFileSync(resolve(__dirname, '../app/error.vue'), 'utf8')
    expect(src).not.toMatch(/body\.isError/)
    expect(src).not.toMatch(/bg-\[url\(/)
  })
})
