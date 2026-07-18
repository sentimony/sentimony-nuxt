#!/usr/bin/env node
/**
 * Point-syncs individual fields of individual rows to Supabase, without the
 * wholesale writes of sync-supabase.mjs.
 *
 * Use it for narrow, automated edits — e.g. flipping a release's `visible`,
 * setting a track's `audio_url`, fixing one artist field — where a full catalog
 * sync would be overkill. For broad edits, keep editing the JSON and run
 * `npm run sync:supabase` (it upserts every row by slug).
 *
 * It updates the named column(s) of the given slug in the given table, and
 * mirrors the same value into server/data/sentimony-db-export.json (unless
 * --no-local). Column names are Supabase columns; the local mirror maps a few
 * renamed release columns back to their JSON keys (see COLUMN_TO_JSON_KEY).
 *
 * Usage:
 *   node scripts/sync-field.mjs <table> <slug> <field>=<value> [<field>=<value> …]
 *   node scripts/sync-field.mjs tracks frog-prog-bush audio_url=https://…/frog-prog-bush.mp3
 *   node scripts/sync-field.mjs releases some-release visible=false coming_soon=true
 *   node scripts/sync-field.mjs --updates /tmp/edits.json      # batch, see below
 *   node scripts/sync-field.mjs --dry-run tracks foo audio_url=https://…
 *   node scripts/sync-field.mjs --no-local artists bar location="Kyiv, UA"
 *
 * Batch --updates file shape:
 *   { "<table>": { "<slug>": { "<field>": <value>, … }, … }, … }
 *
 * Values are parsed as JSON when possible (true/false/123/null/"…"), else kept
 * as raw strings. Env: NUXT_PUBLIC_SUPABASE_URL|SUPABASE_URL,
 * NUXT_SUPABASE_SECRET_KEY|SUPABASE_SECRET_KEY (auto-loaded by the npm script).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const LOCAL_DB = 'server/data/sentimony-db-export.json'

const TABLES = ['releases', 'artists', 'tracks', 'videos', 'playlists', 'events', 'friends']

// Supabase column -> local JSON key, for columns renamed during full sync.
const COLUMN_TO_JSON_KEY = {
  is_new: 'new',
  tracklist_compact: 'tracklistCompact',
  credits_compact: 'creditsCompact',
}

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const skipLocal = args.includes('--no-local')
const updatesIdx = args.indexOf('--updates')
const updatesFile = updatesIdx !== -1 ? args[updatesIdx + 1] : null

function parseValue(raw) {
  try { return JSON.parse(raw) } catch { return raw }
}

// edits: { table: { slug: { field: value } } }
const edits = {}

function addEdit(table, slug, field, value) {
  edits[table] ??= {}
  edits[table][slug] ??= {}
  edits[table][slug][field] = value
}

if (updatesFile) {
  let parsed
  try {
    parsed = JSON.parse(readFileSync(resolve(updatesFile), 'utf-8'))
  } catch (err) {
    console.error(`Failed to read updates file: ${err.message}`)
    process.exit(1)
  }
  for (const [table, rows] of Object.entries(parsed)) {
    for (const [slug, fields] of Object.entries(rows)) {
      for (const [field, value] of Object.entries(fields)) addEdit(table, slug, field, value)
    }
  }
} else {
  const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--updates')
  const [table, slug, ...pairs] = positional
  if (!table || !slug || pairs.length === 0) {
    console.error('Usage: sync-field.mjs <table> <slug> <field>=<value> [<field>=<value> …]')
    console.error('   or: sync-field.mjs --updates <file.json>')
    process.exit(1)
  }
  for (const pair of pairs) {
    const eq = pair.indexOf('=')
    if (eq === -1) {
      console.error(`Malformed pair (expected field=value): ${pair}`)
      process.exit(1)
    }
    addEdit(table, slug, pair.slice(0, eq), parseValue(pair.slice(eq + 1)))
  }
}

for (const table of Object.keys(edits)) {
  if (!TABLES.includes(table)) {
    console.error(`Unknown table "${table}". Expected one of: ${TABLES.join(', ')}`)
    process.exit(1)
  }
}

const editCount = Object.values(edits).reduce((n, rows) => n + Object.keys(rows).length, 0)
console.log(`${isDryRun ? 'DRY RUN — ' : ''}field updates for ${editCount} row(s):`)
for (const [table, rows] of Object.entries(edits)) {
  for (const [slug, fields] of Object.entries(rows)) {
    console.log(`  ${table}/${slug}: ${Object.entries(fields).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')}`)
  }
}

if (!skipLocal) {
  const dbPath = resolve(LOCAL_DB)
  const db = JSON.parse(readFileSync(dbPath, 'utf-8'))
  const missingLocal = []
  for (const [table, rows] of Object.entries(edits)) {
    for (const [slug, fields] of Object.entries(rows)) {
      const collection = db[table]
      const record = Array.isArray(collection)
        ? collection.find(row => row?.slug === slug)
        : collection?.[slug]
      if (!record) { missingLocal.push(`${table}/${slug}`); continue }
      for (const [field, value] of Object.entries(fields)) {
        record[COLUMN_TO_JSON_KEY[field] ?? field] = value
      }
    }
  }
  if (missingLocal.length) console.warn(`  ! not in local export: ${missingLocal.join(', ')}`)
  if (!isDryRun) {
    writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf-8')
    console.log(`Local export updated: ${LOCAL_DB}`)
  }
}

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseSecretKey = process.env.NUXT_SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
  console.error('Missing Supabase env (NUXT_PUBLIC_SUPABASE_URL / NUXT_SUPABASE_SECRET_KEY).')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Verify every slug exists before writing.
for (const [table, rows] of Object.entries(edits)) {
  const slugs = Object.keys(rows)
  const { data, error } = await supabase.from(table).select('slug').in('slug', slugs)
  if (error) {
    console.error(`${table} read error: ${error.message}`)
    process.exit(1)
  }
  const found = new Set((data ?? []).map(r => r.slug))
  const missing = slugs.filter(s => !found.has(s))
  if (missing.length) {
    console.error(`Not in Supabase ${table}: ${missing.join(', ')}`)
    console.error('Run the full sync first (npm run sync:supabase) to insert new rows.')
    process.exit(1)
  }
}

if (isDryRun) {
  console.log('\nDry run — no Supabase writes performed.')
  process.exit(0)
}

let updated = 0
for (const [table, rows] of Object.entries(edits)) {
  for (const [slug, fields] of Object.entries(rows)) {
    const { error } = await supabase.from(table).update(fields).eq('slug', slug)
    if (error) {
      console.error(`update error for ${table}/${slug}: ${error.message}`)
      process.exit(1)
    }
    updated += 1
  }
}

console.log(`\nSynced ${updated} row(s) to Supabase.`)
