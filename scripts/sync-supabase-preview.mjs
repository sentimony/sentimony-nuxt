// Deploy-preview guard for `sync:supabase`. Previews, stage and prod read one
// shared Supabase catalog, and the sync deletes stale `tracks` / `track_artists`
// rows, so a branch whose YAML lags behind `main` would strip newer catalog rows
// from prod. Sync only when HEAD already contains `origin/main`; otherwise build
// with whatever the store holds (a stale preview, never a damaged prod).
import { execFileSync, spawnSync } from 'node:child_process'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

function skip(reason) {
  console.warn(`sync-supabase-preview: skipping catalog sync (${reason}); the preview shows the last synced catalog`)
}

let upToDate = false
try {
  // Netlify clones shallowly; ancestry needs the full history of main.
  if (git('rev-parse', '--is-shallow-repository') === 'true') git('fetch', '--quiet', '--unshallow', 'origin', 'main')
  else git('fetch', '--quiet', 'origin', 'main')
  upToDate = spawnSync('git', ['merge-base', '--is-ancestor', 'FETCH_HEAD', 'HEAD']).status === 0
}
catch (error) {
  skip(`could not compare with origin/main: ${error.message.split('\n')[0]}`)
  process.exit(0)
}

if (!upToDate) {
  skip('branch is behind origin/main, rebase or merge main first')
  process.exit(0)
}

const result = spawnSync('npm', ['run', 'sync:supabase'], { stdio: 'inherit' })
process.exit(result.status ?? 1)
