import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseSecretKey = process.env.NUXT_SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const data = JSON.parse(readFileSync('server/data/server/sentimony-db-export.json', 'utf-8'))

async function sync(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'slug' })
  if (error) { console.error(`${table} error:`, error.message); process.exit(1) }
  console.log(`Synced ${rows.length} ${table}`)
}

const releases = Object.values(data.releases).map(({ new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact, ...rest }) => ({
  ...rest, is_new, tracklist_compact, credits_compact,
}))

const artistsMap = new Map(Object.values(data.artists).map(a => [a.slug, a]))
const artists = [...artistsMap.values()]

const videos = Object.values(data.videos)
const playlists = Object.values(data.playlists)
const events = Object.values(data.events)
const friends = Object.values(data.friends)

await sync('releases', releases)
await sync('artists', artists)
await sync('videos', videos)
await sync('playlists', playlists)
await sync('events', events)
await sync('friends', friends)
