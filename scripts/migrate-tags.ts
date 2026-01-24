/**
 * Migration script: Create tags from existing Firebase data
 *
 * Run with: npx tsx scripts/migrate-tags.ts
 *
 * Prerequisites:
 * - Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 * - Run the SQL migration first (supabase/migrations/001_create_tags_schema.sql)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Country mapping: location keyword -> { code, title }
const COUNTRY_MAP: Record<string, { code: string; title: string }> = {
  'ukraine': { code: 'UA', title: 'Ukraine' },
  'germany': { code: 'DE', title: 'Germany' },
  'israel': { code: 'IL', title: 'Israel' },
  'russia': { code: 'RU', title: 'Russia' },
  'usa': { code: 'US', title: 'USA' },
  'uk': { code: 'GB', title: 'United Kingdom' },
  'france': { code: 'FR', title: 'France' },
  'spain': { code: 'ES', title: 'Spain' },
  'italy': { code: 'IT', title: 'Italy' },
  'netherlands': { code: 'NL', title: 'Netherlands' },
  'belgium': { code: 'BE', title: 'Belgium' },
  'poland': { code: 'PL', title: 'Poland' },
  'czech': { code: 'CZ', title: 'Czech Republic' },
  'austria': { code: 'AT', title: 'Austria' },
  'switzerland': { code: 'CH', title: 'Switzerland' },
  'sweden': { code: 'SE', title: 'Sweden' },
  'norway': { code: 'NO', title: 'Norway' },
  'finland': { code: 'FI', title: 'Finland' },
  'denmark': { code: 'DK', title: 'Denmark' },
  'portugal': { code: 'PT', title: 'Portugal' },
  'greece': { code: 'GR', title: 'Greece' },
  'turkey': { code: 'TR', title: 'Turkey' },
  'brazil': { code: 'BR', title: 'Brazil' },
  'argentina': { code: 'AR', title: 'Argentina' },
  'mexico': { code: 'MX', title: 'Mexico' },
  'canada': { code: 'CA', title: 'Canada' },
  'australia': { code: 'AU', title: 'Australia' },
  'new zealand': { code: 'NZ', title: 'New Zealand' },
  'japan': { code: 'JP', title: 'Japan' },
  'india': { code: 'IN', title: 'India' },
  'south africa': { code: 'ZA', title: 'South Africa' },
}

interface Artist {
  slug: string
  title: string
  visible?: boolean
  category?: string
  location?: string
}

interface Release {
  slug: string
  title: string
  visible?: boolean
  artists?: string
  style?: string
}

interface TagTypeRow {
  id: number
  slug: string
}

async function loadData(): Promise<{ artists: Record<string, Artist>; releases: Record<string, Release> }> {
  const dataPath = path.join(__dirname, '../public/data/sentimony-db-export.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  return JSON.parse(rawData)
}

function parseCountryFromLocation(location: string | undefined): { code: string; title: string } | null {
  if (!location) return null

  const locationLower = location.toLowerCase()

  for (const [keyword, country] of Object.entries(COUNTRY_MAP)) {
    if (locationLower.includes(keyword)) {
      return country
    }
  }

  return null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function getTagTypes(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('tag_types')
    .select('id, slug')

  if (error) throw error

  const map = new Map<string, number>()
  for (const row of data as TagTypeRow[]) {
    map.set(row.slug, row.id)
  }
  return map
}

async function migrateStyles(releases: Record<string, Release>, typeId: number) {
  console.log('\n📀 Migrating styles...')

  // Collect all unique styles
  const stylesSet = new Set<string>()

  for (const release of Object.values(releases)) {
    if (!release.visible || !release.style) continue

    const styles = release.style.split(',').map((s) => s.trim()).filter(Boolean)
    styles.forEach((s) => stylesSet.add(s))
  }

  console.log(`Found ${stylesSet.size} unique styles`)

  // Insert styles as tags
  const styleTags = Array.from(stylesSet).map((title, index) => ({
    slug: slugify(title),
    title,
    type_id: typeId,
    sort_order: index,
    visible: true,
  }))

  const { data, error } = await supabase
    .from('tags')
    .upsert(styleTags, { onConflict: 'slug' })
    .select('id, slug')

  if (error) {
    console.error('Error inserting styles:', error)
    return new Map<string, number>()
  }

  console.log(`Inserted/updated ${styleTags.length} style tags`)

  // Get all style tags with IDs
  const { data: allStyles } = await supabase
    .from('tags')
    .select('id, slug')
    .eq('type_id', typeId)

  const map = new Map<string, number>()
  for (const row of allStyles || []) {
    map.set(row.slug, row.id)
  }
  return map
}

async function migrateMusicians(artists: Record<string, Artist>, typeId: number) {
  console.log('\n🎵 Migrating musicians...')

  // Filter visible musicians
  const musicians = Object.values(artists).filter(
    (a) => a.visible && a.category === 'musician'
  )

  console.log(`Found ${musicians.length} visible musicians`)

  // Insert musicians as tags
  const musicianTags = musicians.map((artist, index) => ({
    slug: artist.slug,
    title: artist.title,
    type_id: typeId,
    sort_order: index,
    visible: true,
  }))

  const { error } = await supabase
    .from('tags')
    .upsert(musicianTags, { onConflict: 'slug' })

  if (error) {
    console.error('Error inserting musicians:', error)
    return new Map<string, number>()
  }

  console.log(`Inserted/updated ${musicianTags.length} musician tags`)

  // Get all musician tags with IDs
  const { data: allMusicians } = await supabase
    .from('tags')
    .select('id, slug')
    .eq('type_id', typeId)

  const map = new Map<string, number>()
  for (const row of allMusicians || []) {
    map.set(row.slug, row.id)
  }
  return map
}

async function migrateCountries(artists: Record<string, Artist>, typeId: number) {
  console.log('\n🌍 Migrating countries...')

  // Collect all unique countries from artist locations
  const countriesMap = new Map<string, { code: string; title: string }>()

  for (const artist of Object.values(artists)) {
    if (!artist.visible) continue

    const country = parseCountryFromLocation(artist.location)
    if (country && !countriesMap.has(country.code)) {
      countriesMap.set(country.code, country)
    }
  }

  console.log(`Found ${countriesMap.size} unique countries`)

  // Insert countries as tags
  const countryTags = Array.from(countriesMap.values()).map((country, index) => ({
    slug: country.code.toLowerCase(),
    title: country.title,
    type_id: typeId,
    country_code: country.code,
    sort_order: index,
    visible: true,
  }))

  const { error } = await supabase
    .from('tags')
    .upsert(countryTags, { onConflict: 'slug' })

  if (error) {
    console.error('Error inserting countries:', error)
    return new Map<string, number>()
  }

  console.log(`Inserted/updated ${countryTags.length} country tags`)

  // Get all country tags with IDs
  const { data: allCountries } = await supabase
    .from('tags')
    .select('id, slug, country_code')
    .eq('type_id', typeId)

  const map = new Map<string, number>()
  for (const row of allCountries || []) {
    if (row.country_code) {
      map.set(row.country_code, row.id)
    }
  }
  return map
}

async function linkReleasesToTags(
  releases: Record<string, Release>,
  artists: Record<string, Artist>,
  styleTagsMap: Map<string, number>,
  musicianTagsMap: Map<string, number>,
  countryTagsMap: Map<string, number>
) {
  console.log('\n🔗 Linking releases to tags...')

  const releaseTagsToInsert: Array<{ release_slug: string; tag_id: number }> = []

  for (const release of Object.values(releases)) {
    if (!release.visible) continue

    // Link to style tags
    if (release.style) {
      const styles = release.style.split(',').map((s) => s.trim()).filter(Boolean)
      for (const style of styles) {
        const tagId = styleTagsMap.get(slugify(style))
        if (tagId) {
          releaseTagsToInsert.push({ release_slug: release.slug, tag_id: tagId })
        }
      }
    }

    // Link to musician tags
    if (release.artists) {
      const artistSlugs = release.artists.split(',').map((s) => s.trim()).filter(Boolean)
      for (const artistSlug of artistSlugs) {
        const tagId = musicianTagsMap.get(artistSlug)
        if (tagId) {
          releaseTagsToInsert.push({ release_slug: release.slug, tag_id: tagId })
        }
      }

      // Link to country tags (from artists)
      for (const artistSlug of artistSlugs) {
        const artist = artists[artistSlug]
        if (artist) {
          const country = parseCountryFromLocation(artist.location)
          if (country) {
            const tagId = countryTagsMap.get(country.code)
            if (tagId) {
              // Avoid duplicates
              const exists = releaseTagsToInsert.some(
                (rt) => rt.release_slug === release.slug && rt.tag_id === tagId
              )
              if (!exists) {
                releaseTagsToInsert.push({ release_slug: release.slug, tag_id: tagId })
              }
            }
          }
        }
      }
    }
  }

  console.log(`Inserting ${releaseTagsToInsert.length} release-tag links...`)

  // Insert in batches of 500
  const batchSize = 500
  for (let i = 0; i < releaseTagsToInsert.length; i += batchSize) {
    const batch = releaseTagsToInsert.slice(i, i + batchSize)
    const { error } = await supabase
      .from('release_tags')
      .upsert(batch, { onConflict: 'release_slug,tag_id' })

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(releaseTagsToInsert.length / batchSize)}`)
    }
  }

  console.log('Done linking releases to tags!')
}

async function main() {
  console.log('🚀 Starting tags migration...\n')

  // Load data
  const { artists, releases } = await loadData()
  console.log(`Loaded ${Object.keys(artists).length} artists and ${Object.keys(releases).length} releases`)

  // Get tag types
  const tagTypes = await getTagTypes()
  console.log('Tag types:', Object.fromEntries(tagTypes))

  const musiciansTypeId = tagTypes.get('musicians')
  const stylesTypeId = tagTypes.get('styles')
  const countriesTypeId = tagTypes.get('countries')

  if (!musiciansTypeId || !stylesTypeId || !countriesTypeId) {
    console.error('Error: Missing tag types. Run SQL migration first.')
    process.exit(1)
  }

  // Migrate tags
  const styleTagsMap = await migrateStyles(releases, stylesTypeId)
  const musicianTagsMap = await migrateMusicians(artists, musiciansTypeId)
  const countryTagsMap = await migrateCountries(artists, countriesTypeId)

  // Link releases to tags
  await linkReleasesToTags(releases, artists, styleTagsMap, musicianTagsMap, countryTagsMap)

  console.log('\n✅ Migration completed!')
}

main().catch(console.error)
