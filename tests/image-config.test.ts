import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd())

describe('image provider configuration', () => {
  it('nuxt.config.ts declares netlifyImageCdn provider with content.sentimony.com domain', () => {
    const src = readFileSync(`${root}/nuxt.config.ts`, 'utf8')
    expect(src).toMatch(/image\s*:\s*\{[\s\S]*provider\s*:\s*['"]netlifyImageCdn['"]/m)
    expect(src).toMatch(/domains\s*:\s*\[\s*['"]content\.sentimony\.com['"]\s*\]/m)
  })

  it('netlify.toml registers remote_images regex for content.sentimony.com', () => {
    const src = readFileSync(`${root}/netlify.toml`, 'utf8')
    expect(src).toMatch(/\[images\]/)
    expect(src).toMatch(/remote_images\s*=\s*\[\s*"https:\/\/content\\\\\.sentimony\\\\\.com\/\.\*"\s*\]/)
  })
})
