import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const data = JSON.parse(readFileSync('public/data/sentimony-db-export.json', 'utf-8'))

const artistByTitle = new Map()
for (const artist of Object.values(data.artists)) {
  artistByTitle.set(artist.title.toLowerCase(), artist.slug)
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
const allTracks = []
for (const release of Object.values(data.releases)) {
  for (let i = 0; i < (release.tracklistCompact || []).length; i++) {
    const track = parseTrack(release.tracklistCompact[i].p, release.slug, i)
    if (!seen.has(track.slug)) {
      seen.add(track.slug)
      allTracks.push(track)
    }
  }
}

console.log(`Parsed ${allTracks.length} tracks`)

for (let i = 0; i < allTracks.length; i += 200) {
  const batch = allTracks.slice(i, i + 200)
  const { error } = await supabase.from('tracks').upsert(batch, { onConflict: 'slug' })
  if (error) { console.error(`Batch ${Math.floor(i / 200) + 1} error:`, error.message); process.exit(1) }
  console.log(`Batch ${Math.floor(i / 200) + 1}: ${batch.length} tracks`)
}

console.log('Done!')
