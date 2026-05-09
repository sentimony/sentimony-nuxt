import { describe, it, expect } from 'vitest'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const providerPath = resolve(process.cwd(), 'node_modules/@nuxt/image/dist/runtime/providers/netlifyImageCdn.js')
const mod = await import(pathToFileURL(providerPath).href) as { default: () => { getImage: (src: string, opts: any) => { url: string } } }
const provider = mod.default()

describe('netlifyImageCdn provider', () => {
  it('generates /.netlify/images?url=... URL', () => {
    const { url } = provider.getImage(
      'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg',
      { modifiers: { width: 40, height: 40 }, baseURL: '/.netlify/images' }
    )
    expect(url).toMatch(/^\/\.netlify\/images\?/)
    expect(url).toMatch(/url=https%3A%2F%2Fcontent\.sentimony\.com/)
    expect(url).toMatch(/w=40/)
    expect(url).toMatch(/h=40/)
  })
})
