import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const args = process.argv.slice(2)
const subset = args.find(a => a.startsWith('--subset='))?.split('=')[1] ?? null

const supabase = createClient(process.env.NUXT_PUBLIC_SUPABASE_URL, process.env.NUXT_SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const data = JSON.parse(readFileSync('public/data/sentimony-db-export.json', 'utf-8'))

async function sync(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'slug' })
  if (error) { console.error(`${table} error:`, error.message); process.exit(1) }
  console.log(`Synced ${rows.length} ${table}`)
}

let releases = Object.values(data.releases).map(({ new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact, ...rest }) => ({
  ...rest, is_new, tracklist_compact, credits_compact,
}))

let artists = [...new Map(Object.values(data.artists).map(a => [a.slug, a])).values()]

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

if (subset === 'stage') {
  console.log('[stage] syncing tracks for the full release set')

  const artistByTitle = new Map()
  for (const a of Object.values(data.artists)) {
    artistByTitle.set(a.title.toLowerCase(), a.slug)
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function parseTrack(p, releaseSlug, index) {
    const numMatch = p.match(/<small>(\d+)\.<\/small>/)
    const trackNumber = numMatch ? parseInt(numMatch[1]) : index + 1

    const artistMatch = p.match(/<b>(.*?)<\/b>/)
    const artistName = artistMatch ? artistMatch[1] : ''
    const artistSlug = artistByTitle.get(artistName.toLowerCase()) || slugify(artistName)

    const withoutBpm = p.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/, '')
    const titleRaw = withoutBpm.replace(/^<small>\d+\.<\/small>\s*<b>.*?<\/b>\s*-\s*/, '')
    const title = titleRaw.replace(/<\/?b>/g, '').trim()

    const bpmMatch = p.match(/\((\d+)(?:-(\d+))?bpm\)/i)
    let bpm = null
    if (bpmMatch) {
      bpm = bpmMatch[2] ? parseInt(bpmMatch[2]) : parseInt(bpmMatch[1])
      if (bpm === 0) bpm = null
    }

    return {
      slug: `${releaseSlug}-${trackNumber}`,
      release_slug: releaseSlug,
      track_number: trackNumber,
      title,
      artist_name: artistName,
      artist_slug: artistSlug,
      bpm,
    }
  }

  const seen = new Set()
  const tracks = []
  for (const r of releases) {
    const tracklist = r.tracklist_compact || []
    for (let i = 0; i < tracklist.length; i++) {
      const t = parseTrack(tracklist[i].p, r.slug, i)
      if (!seen.has(t.slug)) {
        seen.add(t.slug)
        tracks.push(t)
      }
    }
  }

  for (let i = 0; i < tracks.length; i += 200) {
    const batch = tracks.slice(i, i + 200)
    const { error } = await supabase.from('tracks').upsert(batch, { onConflict: 'slug' })
    if (error) { console.error(`tracks batch error:`, error.message); process.exit(1) }
  }
  console.log(`[stage] synced ${tracks.length} tracks`)
}
