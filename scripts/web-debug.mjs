#!/usr/bin/env node
// Smoke-check that every page kind renders without a server error.
// Static routes are hit directly; one real slug per dynamic route is resolved
// from the catalog API so a broken SSR path (e.g. a crashing transitive dep)
// surfaces as a non-2xx/3xx exit code instead of silently shipping.

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '')
const TIMEOUT_MS = Number(process.env.WEB_DEBUG_TIMEOUT || 25000)

const staticRoutes = [
  '/',
  '/releases',
  '/releases/psytrance',
  '/releases/psychill',
  '/artists',
  '/artists/all',
  '/videos',
  '/events',
  '/playlists',
  '/friends',
  '/tracks',
  '/news',
  '/contacts',
  '/signin',
]

const dynamicRoutes = [
  { api: '/api/releases', path: slug => `/release/${slug}` },
  { api: '/api/artists', path: slug => `/artist/${slug}` },
  { api: '/api/videos', path: slug => `/video/${slug}` },
  { api: '/api/events', path: slug => `/event/${slug}` },
  { api: '/api/playlists', path: slug => `/playlist/${slug}` },
  { api: '/api/friends', path: slug => `/friend/${slug}` },
]

function firstSlug(payload) {
  const list = Array.isArray(payload) ? payload : Object.values(payload ?? {})
  const entry = list.find(item => item && typeof item.slug === 'string')
  return entry?.slug ?? null
}

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const started = Date.now()
    const res = await fetch(url, { signal: controller.signal, redirect: 'manual' })
    return { status: res.status, ms: Date.now() - started, body: res }
  } finally {
    clearTimeout(timer)
  }
}

async function resolveDynamicRoutes() {
  const routes = []
  for (const { api, path } of dynamicRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${api}`)
      if (!res.ok) continue
      const slug = firstSlug(await res.json())
      if (slug) routes.push(path(slug))
    } catch {
      // A failing catalog API is caught by its own static probe below.
    }
  }
  return routes
}

function isHealthy(status) {
  return status >= 200 && status < 400
}

async function main() {
  const dynamic = await resolveDynamicRoutes()
  const routes = [...staticRoutes, ...dynamic]
  const failures = []

  console.log(`web-debug → ${BASE_URL} (${routes.length} routes)\n`)

  for (const route of routes) {
    let status = 0
    let ms = 0
    try {
      const result = await fetchWithTimeout(`${BASE_URL}${route}`)
      status = result.status
      ms = result.ms
    } catch (error) {
      failures.push({ route, status: 'ERR', detail: error.message })
      console.log(`  ✗ ${route.padEnd(38)} ERR   ${error.message}`)
      continue
    }

    const mark = isHealthy(status) ? '✓' : '✗'
    console.log(`  ${mark} ${route.padEnd(38)} ${status}   ${ms}ms`)
    if (!isHealthy(status)) failures.push({ route, status })
  }

  console.log('')
  if (failures.length) {
    console.error(`web-debug FAILED: ${failures.length}/${routes.length} route(s) unhealthy`)
    for (const f of failures) console.error(`  - ${f.route} → ${f.status}${f.detail ? ` (${f.detail})` : ''}`)
    process.exit(1)
  }

  console.log(`web-debug OK: all ${routes.length} routes healthy`)
}

main().catch(error => {
  console.error('web-debug crashed:', error)
  process.exit(1)
})
