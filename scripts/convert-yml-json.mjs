#!/usr/bin/env node
/**
 * Converts server/data/sentimony-db.yml to server/data/sentimony-db.json.
 *
 * This is a standalone sandbox pair, unrelated to the canonical
 * server/data/sentimony-db-export.json used by the app/sync scripts.
 *
 * Usage:
 *   node scripts/convert-yml-json.mjs
 */

import { parse } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const YML_PATH = resolve('server/data/sentimony-db.yml')
const JSON_PATH = resolve('server/data/sentimony-db-export.json')

const source = readFileSync(YML_PATH, 'utf-8')
const data = parse(source)

writeFileSync(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`)

console.log(`Synced ${YML_PATH} -> ${JSON_PATH}`)
