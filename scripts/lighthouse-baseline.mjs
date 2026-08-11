#!/usr/bin/env node
// Lab metrics (LCP, TBT, CLS, SI, TTFB) per page kind via the Lighthouse CLI.
// perf-baseline.mjs measures the network only; this one measures what a browser
// does with the response, which is where HTML caching shows up as a user-visible
// win rather than a header change.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { formatMarkdownTable, summarize } from './lib/perfStats.mjs'

const execFileAsync = promisify(execFile)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE_URL = (process.env.BASE_URL || 'https://sentimony.com').replace(/\/+$/, '')
const LABEL = process.env.LH_LABEL
const RUNS = Number(process.env.LH_RUNS || 3)
const FORM_FACTOR = process.env.LH_FORM_FACTOR || 'mobile'

// One representative target per rendering shape: home, list, filtered list,
// heaviest list, and two detail pages.
const ROUTES = (process.env.LH_ROUTES || [
  '/',
  '/releases',
  '/artists',
  '/tracks',
  '/release/vorg-cyber-soul-chill',
  '/artist/irukanji',
].join(',')).split(',').map(route => route.trim()).filter(Boolean)

if (!LABEL) {
  console.error('lighthouse-baseline: LH_LABEL is required (e.g. netlify-prod)')
  process.exit(1)
}

const CHROME_FLAGS = '--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage'

async function runLighthouse(url) {
  const outPath = join(tmpdir(), `lh-${Math.random().toString(36).slice(2)}.json`)
  const args = [
    '-y', 'lighthouse@12',
    url,
    '--only-categories=performance',
    `--form-factor=${FORM_FACTOR}`,
    FORM_FACTOR === 'desktop' ? '--preset=desktop' : '--screenEmulation.mobile',
    '--output=json',
    `--output-path=${outPath}`,
    `--chrome-flags=${CHROME_FLAGS}`,
    '--quiet',
  ]
  try {
    await execFileAsync('npx', args, { maxBuffer: 64 * 1024 * 1024 })
    const report = JSON.parse(await readFile(outPath, 'utf8'))
    const audits = report.audits ?? {}
    return {
      performance: report.categories?.performance?.score ?? null,
      lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
      fcpMs: audits['first-contentful-paint']?.numericValue ?? null,
      tbtMs: audits['total-blocking-time']?.numericValue ?? null,
      cls: audits['cumulative-layout-shift']?.numericValue ?? null,
      siMs: audits['speed-index']?.numericValue ?? null,
      ttfbMs: audits['server-response-time']?.numericValue ?? null,
      transferBytes: audits['total-byte-weight']?.numericValue ?? null,
    }
  } finally {
    await rm(outPath, { force: true })
  }
}

function medianOf(samples, key) {
  const stats = summarize(samples.map(sample => sample[key]))
  return stats ? stats.median : null
}

async function main() {
  console.log(`lighthouse-baseline → ${BASE_URL} (label ${LABEL}, ${FORM_FACTOR}, ${RUNS} runs, ${ROUTES.length} routes)\n`)
  const targets = []

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`
    const samples = []
    for (let run = 0; run < RUNS; run += 1) {
      try {
        samples.push(await runLighthouse(url))
      } catch (error) {
        console.log(`  ${route.padEnd(34)} run ${run + 1} ERR ${error.message.split('\n')[0]}`)
      }
    }
    if (!samples.length) {
      targets.push({ route, runs: 0 })
      continue
    }
    const target = {
      route,
      runs: samples.length,
      performance: medianOf(samples, 'performance'),
      lcpMs: medianOf(samples, 'lcpMs'),
      fcpMs: medianOf(samples, 'fcpMs'),
      tbtMs: medianOf(samples, 'tbtMs'),
      cls: medianOf(samples, 'cls'),
      siMs: medianOf(samples, 'siMs'),
      ttfbMs: medianOf(samples, 'ttfbMs'),
      transferBytes: medianOf(samples, 'transferBytes'),
      samples,
    }
    targets.push(target)
    console.log(`  ${route.padEnd(34)} perf ${Math.round((target.performance ?? 0) * 100)}  LCP ${Math.round(target.lcpMs ?? 0)}ms  TBT ${Math.round(target.tbtMs ?? 0)}ms  TTFB ${Math.round(target.ttfbMs ?? 0)}ms`)
  }

  const artifact = {
    label: LABEL,
    baseUrl: BASE_URL,
    startedAt: new Date().toISOString(),
    runs: RUNS,
    formFactor: FORM_FACTOR,
    node: process.version,
    targets,
  }

  const outDir = join(ROOT, 'docs/audits/data')
  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, `lh-${LABEL}.json`), `${JSON.stringify(artifact, null, 2)}\n`)

  console.log('')
  console.log(formatMarkdownTable(targets.filter(target => target.runs).map(target => ({
    route: target.route,
    perf: Math.round((target.performance ?? 0) * 100),
    'LCP ms': Math.round(target.lcpMs ?? 0),
    'FCP ms': Math.round(target.fcpMs ?? 0),
    'SI ms': Math.round(target.siMs ?? 0),
    'TBT ms': Math.round(target.tbtMs ?? 0),
    CLS: (target.cls ?? 0).toFixed(3),
    'TTFB ms': Math.round(target.ttfbMs ?? 0),
  }))))
  console.log(`\nwrote docs/audits/data/lh-${LABEL}.json`)
}

main().catch(error => {
  console.error('lighthouse-baseline crashed:', error)
  process.exit(1)
})
