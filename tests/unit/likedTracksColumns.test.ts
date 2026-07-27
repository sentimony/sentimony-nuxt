import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('liked tracks endpoint', () => {
  it('selects only columns that exist on the tracks table', () => {
    const handler = readProjectFile('server/api/track-likes/tracks.get.ts')
    const select = handler.match(/entitySelect:\s*'([^']*)'/)?.[1] ?? ''
    const columns = select.split(',').map(column => column.trim()).filter(Boolean)

    expect(columns, 'dropped by 20260707_tracks_first_class.sql')
      .not.toContain('release_slug')
    expect(columns).not.toContain('track_number')
    expect(columns).toEqual(['slug', 'title', 'artist_name', 'artist_slug', 'bpm', 'audio_url'])
  })

  it('links liked tracks to their own page, not to a release', () => {
    const page = readProjectFile('app/pages/profile/tracks.vue')

    expect(page).not.toContain('release_slug')
    expect(page).toContain('/track/')
  })

  it('keeps release tracklist entries separate from hydrated track responses', () => {
    const types = readProjectFile('app/types/index.ts')

    expect(types.match(/export interface ReleaseTrack\b/g)).toHaveLength(1)
    expect(types).toContain('tracklist?: ReleaseTracklistEntry[]')
    expect(types).toContain('export interface ReleaseTracklistEntry')
    expect(types).toContain('export interface ReleaseTrack extends Track')
  })
})
