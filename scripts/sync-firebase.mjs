import { readFileSync } from 'fs'

const dbUrl = process.env.FIREBASE_BASE_URL || 'https://sentimony-db.firebaseio.com'
const secret = process.env.FIREBASE_DB_SECRET
const isDryRun = process.argv.includes('--dry-run')

const data = JSON.parse(readFileSync('server/data/sentimony-db-export.json', 'utf-8'))

// Firebase stores every collection as an object keyed by slug; the local
// export keeps artists/tracks/videos/events/friends as arrays.
function bySlug(rows) {
  return Object.fromEntries(rows.map(row => [row.slug, row]))
}

const tracks = bySlug(data.tracks.map(t => ({
  slug: t.slug,
  title: t.title,
  artist_name: t.artist_name,
  artist_slug: t.artist_slug,
  ...(t.bpm != null ? { bpm: t.bpm } : {}),
  ...(t.audio_url ? { audio_url: t.audio_url } : {}),
})))

const collections = {
  releases: data.releases,
  artists: bySlug(data.artists),
  tracks,
  videos: bySlug(data.videos),
  playlists: data.playlists,
  events: bySlug(data.events),
  friends: bySlug(data.friends),
}

if (isDryRun) {
  for (const [name, rows] of Object.entries(collections)) {
    const keys = Object.keys(rows)
    console.log(`${name}: ${keys.length} keys, sample: ${keys.slice(0, 3).join(', ')}`)
  }
  process.exit(0)
}

if (!secret) {
  console.error('FIREBASE_DB_SECRET is required')
  process.exit(1)
}

async function sync(collection, rows) {
  const res = await fetch(`${dbUrl}/${collection}.json?auth=${secret}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    console.error(`${collection} error:`, await res.text())
    process.exit(1)
  }
  console.log(`Synced ${Object.keys(rows).length} ${collection}`)
}

for (const [name, rows] of Object.entries(collections)) {
  await sync(name, rows)
}
