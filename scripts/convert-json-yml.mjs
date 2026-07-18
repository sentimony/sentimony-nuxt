#!/usr/bin/env node
/**
 * Converts server/data/sentimony-db.json to server/data/sentimony-db.yml.
 *
 * This is a standalone sandbox pair, unrelated to the canonical
 * server/data/sentimony-db-export.json used by the app/sync scripts.
 *
 * Usage:
 *   node scripts/convert-json-yml.mjs
 */

import { stringify } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const JSON_PATH = resolve('server/data/sentimony-db-export.json')
const YML_PATH = resolve('server/data/sentimony-db.yml')

const data = JSON.parse(readFileSync(JSON_PATH, 'utf-8'))

writeFileSync(YML_PATH, stringify(data, { lineWidth: 0 }))

console.log(`Synced ${JSON_PATH} -> ${YML_PATH}`)
