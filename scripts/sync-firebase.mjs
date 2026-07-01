import { readFileSync } from 'fs'

const dbUrl = process.env.FIREBASE_BASE_URL || 'https://sentimony-db.firebaseio.com'
const secret = process.env.FIREBASE_DB_SECRET

if (!secret) {
  console.error('FIREBASE_DB_SECRET is required')
  process.exit(1)
}

const data = JSON.parse(readFileSync('server/data/server/sentimony-db-export.json', 'utf-8'))

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

await sync('releases', data.releases)
await sync('artists', data.artists)
await sync('videos', data.videos)
await sync('playlists', data.playlists)
await sync('events', data.events)
await sync('friends', data.friends)
