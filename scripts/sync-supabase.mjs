import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { buildTrackArtistRows } from './lib/track-artists.mjs'

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseSecretKey = process.env.NUXT_SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const data = JSON.parse(readFileSync('server/data/sentimony-db-export.json', 'utf-8'))

async function sync(table, rows) {
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase.from(table).upsert(rows.slice(i, i + 200), { onConflict: 'slug' })
    if (error) { console.error(`${table} error:`, error.message); process.exit(1) }
  }
  console.log(`Synced ${rows.length} ${table}`)
}

const releases = Object.values(data.releases).map(({ new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact, ...rest }) => ({
  ...rest, is_new, tracklist_compact, credits_compact,
}))

const artistsMap = new Map(Object.values(data.artists).map(a => [a.slug, a]))
const artists = [...artistsMap.values()]

const tracks = Object.values(data.tracks)

const videos = Object.values(data.videos)
const playlists = Object.values(data.playlists)
const events = Object.values(data.events)
const friends = Object.values(data.friends)

await sync('releases', releases)
await sync('artists', artists)

// PostgREST caps responses at 1000 rows; page through so stale-row cleanup
// never silently misses rows past the cap.
async function selectAll(table, columns, orderCols) {
  const pageSize = 1000
  const rows = []
  for (let from = 0; ; from += pageSize) {
    let query = supabase.from(table).select(columns).range(from, from + pageSize - 1)
    for (const col of orderCols) query = query.order(col, { ascending: true })
    const { data, error } = await query
    if (error) { console.error(`${table} read error:`, error.message); process.exit(1) }
    rows.push(...(data ?? []))
    if ((data ?? []).length < pageSize) break
  }
  return rows
}

const trackSlugs = new Set(tracks.map(t => t.slug))
const existingTracks = await selectAll('tracks', 'slug', ['slug'])
const staleSlugs = existingTracks.map(t => t.slug).filter(slug => !trackSlugs.has(slug))
for (let i = 0; i < staleSlugs.length; i += 200) {
  const { error } = await supabase.from('tracks').delete().in('slug', staleSlugs.slice(i, i + 200))
  if (error) { console.error('tracks cleanup error:', error.message); process.exit(1) }
}
if (staleSlugs.length) console.log(`Removed ${staleSlugs.length} stale tracks`)

await sync('tracks', tracks)

const trackArtistRows = buildTrackArtistRows(tracks)
const desiredPairs = new Set(trackArtistRows.map(r => `${r.track_slug}\0${r.artist_slug}`))
const existingPairs = await selectAll('track_artists', 'track_slug, artist_slug', ['track_slug', 'artist_slug'])
const stalePairs = existingPairs.filter(p => !desiredPairs.has(`${p.track_slug}\0${p.artist_slug}`))
const staleByTrack = new Map()
for (const p of stalePairs) {
  if (!staleByTrack.has(p.track_slug)) staleByTrack.set(p.track_slug, [])
  staleByTrack.get(p.track_slug).push(p.artist_slug)
}
for (const [trackSlug, artistSlugs] of staleByTrack) {
  const { error } = await supabase
    .from('track_artists')
    .delete()
    .eq('track_slug', trackSlug)
    .in('artist_slug', artistSlugs)
  if (error) { console.error('track_artists cleanup error:', error.message); process.exit(1) }
}
if (stalePairs.length) console.log(`Removed ${stalePairs.length} stale track_artists`)
for (let i = 0; i < trackArtistRows.length; i += 200) {
  const { error } = await supabase
    .from('track_artists')
    .upsert(trackArtistRows.slice(i, i + 200), { onConflict: 'track_slug,artist_slug' })
  if (error) { console.error('track_artists error:', error.message); process.exit(1) }
}
console.log(`Synced ${trackArtistRows.length} track_artists`)

await sync('videos', videos)
await sync('playlists', playlists)
await sync('events', events)
await sync('friends', friends)
