import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const repoRoot = resolve(__dirname, '..')

describe('nuxt.config.ts image configuration', () => {
  const nuxtConfig = readFileSync(resolve(repoRoot, 'nuxt.config.ts'), 'utf8')

  it('registers @nuxt/image module', () => {
    expect(nuxtConfig).toContain("'@nuxt/image'")
  })

  it('configures netlifyImageCdn provider', () => {
    expect(nuxtConfig).toContain("provider: 'netlifyImageCdn'")
  })

  it('whitelists content.sentimony.com domain', () => {
    expect(nuxtConfig).toContain("'content.sentimony.com'")
  })

  it('points netlifyImageCdn baseURL to /.netlify/images', () => {
    expect(nuxtConfig).toContain("baseURL: '/.netlify/images'")
  })
})

describe('netlify.toml remote images', () => {
  const netlifyToml = readFileSync(resolve(repoRoot, 'netlify.toml'), 'utf8')

  it('declares an [images] block', () => {
    expect(netlifyToml).toContain('[images]')
  })

  it('whitelists content.sentimony.com via remote_images regex', () => {
    expect(netlifyToml).toContain('remote_images')
    expect(netlifyToml).toContain(String.raw`https://content\\.sentimony\\.com/.*`)
  })
})
