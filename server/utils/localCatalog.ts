import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'yaml'

type LocalNode = Record<string, unknown>
type LocalCollections = Record<string, Record<string, LocalNode>>

const YAML_PATH = resolve('server/data/sentimony-db.yml')

let cached: { mtimeMs: number, collections: LocalCollections } | null = null

// The YAML keeps artists/tracks/videos/events/friends as arrays; Firebase
// (and so every handler's Firebase branch) expects objects keyed by slug.
function bySlug(rows: unknown): Record<string, LocalNode> {
  if (!Array.isArray(rows)) return (rows && typeof rows === 'object' ? rows : {}) as Record<string, LocalNode>
  return Object.fromEntries(rows.map((row: LocalNode) => [row.slug, row]))
}

function loadLocalCollections(): LocalCollections {
  let mtimeMs: number
  try {
    mtimeMs = statSync(YAML_PATH).mtimeMs
  }
  catch {
    throw new Error(`CATALOG_SOURCE=local needs ${YAML_PATH}; run the server from the repository root`)
  }
  if (cached?.mtimeMs === mtimeMs) return cached.collections

  const data = parse(readFileSync(YAML_PATH, 'utf-8')) as Record<string, unknown>
  const collections = Object.fromEntries(
    Object.entries(data).map(([name, rows]) => [name, bySlug(rows)]),
  )
  cached = { mtimeMs, collections }
  return collections
}

export function fetchLocalCatalogNode<T>(path: string): T | null {
  const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  let node: unknown = loadLocalCollections()
  for (const segment of segments) {
    if (!node || typeof node !== 'object') return null
    node = (node as Record<string, unknown>)[segment]
  }
  return (node ?? null) as T | null
}
