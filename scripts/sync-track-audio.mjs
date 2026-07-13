#!/usr/bin/env node
/**
 * Point-syncs the audio_url of individual tracks to Supabase.
 *
 * Thin convenience wrapper over sync-field.mjs, tailored to the audio pipeline
 * (sentimony-audio-manager skill): it maps `<slug>=<url>` pairs to
 * `tracks <slug> audio_url=<url>` field edits and delegates. Updates only the
 * audio_url column and mirrors it into the local export, so a release's
 * Sentimony Player lights up without a full catalog sync.
 *
 * Usage:
 *   node scripts/sync-track-audio.mjs <slug>=<url> [<slug>=<url> …]
 *   node scripts/sync-track-audio.mjs --updates /tmp/track-audio.json   # { "<slug>": "<url>", … }
 *   node scripts/sync-track-audio.mjs --dry-run <slug>=<url>
 *   node scripts/sync-track-audio.mjs --no-local <slug>=<url>
 */

import { spawnSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const here = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const passThrough = []
const isDryRun = args.includes('--dry-run')
const skipLocal = args.includes('--no-local')
if (isDryRun) passThrough.push('--dry-run')
if (skipLocal) passThrough.push('--no-local')

const updatesIdx = args.indexOf('--updates')
const updatesFile = updatesIdx !== -1 ? args[updatesIdx + 1] : null

const pairs = new Map()

if (updatesFile) {
  let parsed
  try {
    parsed = JSON.parse(readFileSync(resolve(updatesFile), 'utf-8'))
  } catch (err) {
    console.error(`Failed to read updates file: ${err.message}`)
    process.exit(1)
  }
  for (const [slug, url] of Object.entries(parsed)) pairs.set(slug, url)
}

for (const arg of args) {
  if (arg.startsWith('--')) continue
  if (arg === updatesFile) continue
  const eq = arg.indexOf('=')
  if (eq === -1) {
    console.error(`Ignoring malformed pair (expected slug=url): ${arg}`)
    continue
  }
  pairs.set(arg.slice(0, eq), arg.slice(eq + 1))
}

for (const [slug, url] of pairs) {
  if (typeof url !== 'string' || !url.trim()) {
    console.error(`Refusing empty audio_url for "${slug}"`)
    process.exit(1)
  }
}

if (pairs.size === 0) {
  console.error('No track updates provided. Pass slug=url pairs or --updates <file>.')
  process.exit(1)
}

// Build the batch shape sync-field.mjs expects: { tracks: { slug: { audio_url } } }
const edits = { tracks: {} }
for (const [slug, url] of pairs) edits.tracks[slug] = { audio_url: url }

const tmpFile = resolve(tmpdir(), `sentimony-track-audio-${process.pid}.json`)
writeFileSync(tmpFile, JSON.stringify(edits), 'utf-8')

const result = spawnSync(
  process.execPath,
  [resolve(here, 'sync-field.mjs'), ...passThrough, '--updates', tmpFile],
  { stdio: 'inherit' },
)

process.exit(result.status ?? 1)
