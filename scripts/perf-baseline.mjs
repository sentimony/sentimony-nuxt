#!/usr/bin/env node
// Measure first-load characteristics of every page kind and delivery host, so a
// platform migration can be judged on numbers taken with the same instrument
// before and after the move.

import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assetTargets, dynamicRoutes, staticRoutes } from './lib/routes.mjs'
import { bustUrl, cacheStateOf, formatMarkdownTable, summarize } from './lib/perfStats.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE_URL = (process.env.BASE_URL || 'https://sentimony.com').replace(/\/+$/, '')
const LABEL = process.env.PERF_LABEL
const RUNS = Number(process.env.PERF_RUNS || 5)
const TIMEOUT_MS = Number(process.env.PERF_TIMEOUT || 30000)
const GAP_MS = 250
const PSI_ROUTE_PREFIXES = ['/', '/releases', '/release/', '/artists', '/artist/', '/tracks']

if (!LABEL) {
  console.error('perf-baseline: PERF_LABEL is required (e.g. netlify-prod)')
  process.exit(1)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function measure(url, { cold }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const started = performance.now()
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      cache: cold ? 'no-store' : 'default',
      headers: cold ? { 'cache-control': 'no-cache' } : undefined,
    })
    const ttfbMs = performance.now() - started
    const buffer = await res.arrayBuffer()
    return {
      ttfbMs,
      totalMs: performance.now() - started,
      bytes: buffer.byteLength,
      status: res.status,
      cacheState: cacheStateOf(res.headers),
      age: res.headers.get('age'),
    }
  } finally {
    clearTimeout(timer)
  }
}

async function sampleTarget(url) {
  const cold = []
  const warm = []
  let status = 0
  let bytes = 0
  let coldCache = 'unknown'
  let warmCache = 'unknown'
  let age = null

  for (let run = 0; run < RUNS; run += 1) {
    const coldResult = await measure(bustUrl(url, randomUUID()), { cold: true })
    cold.push(coldResult)
    status = coldResult.status
    bytes = coldResult.bytes
    coldCache = coldResult.cacheState
    await sleep(GAP_MS)

    await measure(url, { cold: false })
    await sleep(GAP_MS)
    const warmResult = await measure(url, { cold: false })
    warm.push(warmResult)
    warmCache = warmResult.cacheState
    age = warmResult.age
    await sleep(GAP_MS)
  }

  return {
    status,
    bytes,
    cold: { ...summarize(cold.map(item => item.ttfbMs)), totalMs: summarize(cold.map(item => item.totalMs)), cacheState: coldCache },
    warm: { ...summarize(warm.map(item => item.ttfbMs)), totalMs: summarize(warm.map(item => item.totalMs)), cacheState: warmCache, age },
  }
}

async function resolveDynamicRoutes() {
  const routes = []
  for (const { api, path } of dynamicRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${api}`)
      if (!res.ok) continue
      const payload = await res.json()
      const list = Array.isArray(payload) ? payload : Object.values(payload ?? {})
      const entry = list.find(item => item && typeof item.slug === 'string')
      if (entry) routes.push(path(entry.slug))
    } catch {
      // The static probe of the same API reports the failure on its own.
    }
  }
  return routes
}

async function collectPsi(paths) {
  const key = process.env.PSI_API_KEY
  if (!key) {
    console.log('psi: skipped (no PSI_API_KEY)')
    return {}
  }
  if (/localhost|127\.0\.0\.1/.test(BASE_URL)) {
    console.log('psi: skipped (BASE_URL is not publicly reachable)')
    return {}
  }

  const results = {}
  for (const path of paths) {
    const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
    endpoint.searchParams.set('url', `${BASE_URL}${path}`)
    endpoint.searchParams.set('strategy', 'mobile')
    endpoint.searchParams.set('category', 'performance')
    endpoint.searchParams.set('key', key)
    try {
      const res = await fetch(endpoint)
      if (!res.ok) {
        console.log(`psi: ${path} → ${res.status}, recorded as null`)
        results[path] = null
        continue
      }
      const payload = await res.json()
      const audits = payload?.lighthouseResult?.audits ?? {}
      results[path] = {
        performance: payload?.lighthouseResult?.categories?.performance?.score ?? null,
        lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
        tbtMs: audits['total-blocking-time']?.numericValue ?? null,
        cls: audits['cumulative-layout-shift']?.numericValue ?? null,
        fcpMs: audits['first-contentful-paint']?.numericValue ?? null,
      }
      console.log(`psi: ${path} → performance ${results[path].performance}`)
    } catch (error) {
      console.log(`psi: ${path} → ${error.message}, recorded as null`)
      results[path] = null
    }
  }
  return results
}

async function main() {
  const dynamic = await resolveDynamicRoutes()
  const paths = [...staticRoutes, ...dynamic]
  const targets = []
  const failures = []

  console.log(`perf-baseline → ${BASE_URL} (label ${LABEL}, ${RUNS} runs, ${paths.length + assetTargets.length} targets)\n`)

  for (const path of paths) {
    const url = `${BASE_URL}${path}`
    try {
      const sample = await sampleTarget(url)
      targets.push({ target: path, kind: 'page', url, ...sample })
      if (sample.status < 200 || sample.status >= 400) failures.push({ target: path, status: sample.status })
      console.log(`  ${path.padEnd(38)} ${sample.status}  cold ${Math.round(sample.cold.median)}ms  warm ${Math.round(sample.warm.median)}ms  ${sample.warm.cacheState}`)
    } catch (error) {
      failures.push({ target: path, status: 'ERR', detail: error.message })
      console.log(`  ${path.padEnd(38)} ERR  ${error.message}`)
    }
  }

  for (const { label, url } of assetTargets) {
    try {
      const sample = await sampleTarget(url)
      targets.push({ target: label, kind: 'asset', url, ...sample })
      if (sample.status < 200 || sample.status >= 400) failures.push({ target: label, status: sample.status })
      console.log(`  ${label.padEnd(38)} ${sample.status}  cold ${Math.round(sample.cold.median)}ms  warm ${Math.round(sample.warm.median)}ms  ${sample.bytes} B`)
    } catch (error) {
      failures.push({ target: label, status: 'ERR', detail: error.message })
      console.log(`  ${label.padEnd(38)} ERR  ${error.message}`)
    }
  }

  const psi = await collectPsi(paths.filter(path => PSI_ROUTE_PREFIXES.some(prefix => (
    prefix.endsWith('/') && prefix !== '/' ? path.startsWith(prefix) : path === prefix
  ))))

  const artifact = {
    label: LABEL,
    baseUrl: BASE_URL,
    startedAt: new Date().toISOString(),
    runs: RUNS,
    node: process.version,
    targets,
    psi,
  }

  const outDir = join(ROOT, 'docs/audits/data')
  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, `${LABEL}.json`), `${JSON.stringify(artifact, null, 2)}\n`)

  console.log('')
  console.log(formatMarkdownTable(targets.map(target => ({
    target: target.target,
    kind: target.kind,
    status: target.status,
    'cold median ms': Math.round(target.cold.median),
    'cold p95 ms': Math.round(target.cold.p95),
    'warm median ms': Math.round(target.warm.median),
    'warm p95 ms': Math.round(target.warm.p95),
    bytes: target.bytes,
    cache: target.warm.cacheState,
  }))))
  console.log(`\nwrote docs/audits/data/${LABEL}.json`)

  if (failures.length) {
    console.error(`\nperf-baseline FAILED: ${failures.length} target(s) unhealthy`)
    for (const failure of failures) console.error(`  - ${failure.target} → ${failure.status}${failure.detail ? ` (${failure.detail})` : ''}`)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('perf-baseline crashed:', error)
  process.exit(1)
})
