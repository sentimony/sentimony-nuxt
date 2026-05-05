import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const root = new URL('../', import.meta.url)

async function readText(path) {
  return readFile(new URL(path, root), 'utf8')
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const manifest = JSON.parse(await readText('public/site.webmanifest'))
const sw = await readText('public/custom-sw.js')
const config = await readText('nuxt.config.ts')

assert(manifest.id === '/', 'manifest id must be /')
assert(manifest.start_url === '/', 'manifest start_url must be /')
assert(manifest.scope === '/', 'manifest scope must be /')
assert(manifest.display === 'standalone', 'manifest display must be standalone')
assert(manifest.theme_color === '#111111', 'manifest theme_color must be #111111')
assert(manifest.background_color === '#111111', 'manifest background_color must be #111111')
assert(manifest.icons?.some(icon => icon.sizes === '192x192' && icon.purpose.includes('maskable')), 'manifest must include a 192x192 maskable icon')
assert(manifest.icons?.some(icon => icon.sizes === '512x512' && icon.purpose.includes('maskable')), 'manifest must include a 512x512 maskable icon')

assert(existsSync(new URL('public/offline.html', root)), 'offline fallback page must exist')
assert(sw.includes('/offline.html'), 'service worker must precache offline fallback')
assert(sw.includes("request.mode === 'navigate'"), 'service worker must handle navigation requests')

assert(config.includes("name: 'theme-color'"), 'Nuxt head must include theme-color meta')
assert(existsSync(new URL('app/plugins/pwa.client.ts', root)), 'client service worker registration plugin must exist')

console.log('PWA checks passed')
