import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const PATH = 'server/data/sentimony-db-export.json'
const data = JSON.parse(readFileSync(PATH, 'utf-8'))

const artistByTitle = new Map(
  Object.values(data.artists).map(a => [a.title.toLowerCase(), a.slug]),
)

function slugifyTrack(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseParagraph(p, index) {
  const numMatch = p.match(/<small>(\d+)\.<\/small>/)
  const trackNumber = numMatch ? parseInt(numMatch[1]) : index + 1
  const artistMatch = p.match(/<b>(.*?)<\/b>/)
  const artistName = artistMatch ? artistMatch[1].trim() : ''
  const withoutBpm = p.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/, '')
  const titleRaw = withoutBpm.replace(/^<small>\d+\.<\/small>[^<]*<b>.*?<\/b>\s*-\s*/, '')
  const title = titleRaw.replace(/<[^>]+>/g, '').trim()
  const bpmMatch = p.match(/\((\d+)(?:-(\d+))?bpm\)/i)
  let bpm = bpmMatch ? parseInt(bpmMatch[2] ?? bpmMatch[1]) : null
  if (bpm === 0) bpm = null
  return { trackNumber, artistName, title, bpm }
}

const tracks = {}
const mapping = {}
const conflicts = []

function upsertTrack({ artistName, title, bpm, url }) {
  const slug = slugifyTrack(`${artistName} ${title}`)
  if (!slug) return null
  const existing = tracks[slug]
  if (existing) {
    if (existing.artist_name !== artistName || existing.title !== title)
      conflicts.push({ slug, a: { artist: existing.artist_name, title: existing.title }, b: { artist: artistName, title } })
    if (bpm != null && existing.bpm == null) existing.bpm = bpm
    if (url && !existing.audio_url) existing.audio_url = url
    return slug
  }
  tracks[slug] = {
    slug,
    title,
    artist_name: artistName,
    artist_slug: artistByTitle.get(artistName.toLowerCase()) || slugifyTrack(artistName),
    bpm: bpm ?? null,
    audio_url: url || null,
  }
  return slug
}

for (const release of Object.values(data.releases)) {
  if (Array.isArray(release.tracklist) && release.tracklist.every(t => typeof t === 'object' && t !== null)) {
    release.tracklist = release.tracklist.map((t, i) => {
      const slug = upsertTrack({ artistName: t.artist, title: t.title, bpm: t.bpm, url: t.url })
      mapping[`${release.slug}-${t.track_number ?? i + 1}`] = slug
      return slug
    }).filter(Boolean)
    continue
  }
  const compact = Array.isArray(release.tracklistCompact) ? release.tracklistCompact : []
  const list = []
  for (const [index, item] of compact.entries()) {
    const parsed = parseParagraph(item.p ?? '', index)
    if (!parsed.title) continue
    const slug = upsertTrack({ artistName: parsed.artistName, title: parsed.title, bpm: parsed.bpm })
    if (!slug) continue
    mapping[`${release.slug}-${parsed.trackNumber}`] = slug
    list.push(slug)
  }
  release.tracklist = list
}

data.tracks = Object.fromEntries(Object.entries(tracks).sort(([a], [b]) => a.localeCompare(b)))

mkdirSync('scripts/out', { recursive: true })
writeFileSync('scripts/out/track-slug-mapping.json', JSON.stringify(mapping, null, 2))
writeFileSync(PATH, JSON.stringify(data, null, 2) + '\n')

console.log(`tracks: ${Object.keys(tracks).length}, mapping entries: ${Object.keys(mapping).length}`)
if (conflicts.length) {
  console.log('CONFLICTS (same slug, different metadata):')
  for (const c of conflicts) console.log(' -', c.slug, JSON.stringify(c.a), 'vs', JSON.stringify(c.b))
}
