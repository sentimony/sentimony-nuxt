import { readFileSync } from 'fs'

const dbUrl = process.env.FIREBASE_BASE_URL || 'https://sentimony-db.firebaseio.com'
const secret = process.env.FIREBASE_DB_SECRET

if (!secret) {
  console.error('FIREBASE_DB_SECRET is required')
  process.exit(1)
}

const data = JSON.parse(readFileSync('server/data/sentimony-db-export.json', 'utf-8'))

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

const tracks = Object.fromEntries(
  Object.entries(data.tracks).map(([slug, t]) => [slug, {
    slug: t.slug,
    title: t.title,
    artist_name: t.artist_name,
    artist_slug: t.artist_slug,
    ...(t.bpm != null ? { bpm: t.bpm } : {}),
    ...(t.audio_url ? { audio_url: t.audio_url } : {}),
  }]),
)

await sync('releases', data.releases)
await sync('artists', data.artists)
await sync('tracks', tracks)
await sync('videos', data.videos)
await sync('playlists', data.playlists)
await sync('events', data.events)
await sync('friends', data.friends)
