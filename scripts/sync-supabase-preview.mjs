// Deploy-preview guard for `sync:supabase`. Previews, stage and prod read one
// shared Supabase catalog, and the sync upserts every table and deletes stale
// `tracks` / `track_artists` rows, so an unmerged branch could rewrite what prod
// serves. Sync only when HEAD contains `origin/main` and the catalog inputs are
// byte-identical to it (then the sync writes exactly what a prod deploy of main
// would); otherwise build with whatever the store holds.
import { execFileSync, spawnSync } from 'node:child_process'

const CATALOG_INPUTS = ['server/data/sentimony-db.yml', 'scripts/convert-yml-json.mjs', 'scripts/sync-supabase.mjs', 'scripts/lib']

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

function skip(reason) {
  console.warn(`sync-supabase-preview: skipping catalog sync (${reason}); the preview shows the last synced catalog`)
}

let upToDate = false
let sameCatalog = false
try {
  // Netlify clones shallowly; ancestry needs the full history of main.
  if (git('rev-parse', '--is-shallow-repository') === 'true') git('fetch', '--quiet', '--unshallow', 'origin', 'main')
  else git('fetch', '--quiet', 'origin', 'main')
  upToDate = spawnSync('git', ['merge-base', '--is-ancestor', 'FETCH_HEAD', 'HEAD']).status === 0
  sameCatalog = spawnSync('git', ['diff', '--quiet', 'FETCH_HEAD', 'HEAD', '--', ...CATALOG_INPUTS]).status === 0
}
catch (error) {
  skip(`could not compare with origin/main: ${error.message.split('\n')[0]}`)
  process.exit(0)
}

if (!upToDate) {
  skip('branch is behind origin/main, rebase or merge main first')
  process.exit(0)
}
if (!sameCatalog) {
  skip('catalog inputs differ from origin/main, merge the catalog change first')
  process.exit(0)
}

const result = spawnSync('npm', ['run', 'sync:supabase'], { stdio: 'inherit' })
process.exit(result.status ?? 1)
