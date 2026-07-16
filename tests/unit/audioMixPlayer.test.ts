import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('AudioMixPlayer.vue', () => {
  const component = readProjectFile('app/components/AudioMixPlayer.vue')
  const bottomPlayer = readProjectFile('app/components/AudioBottomPlayer.vue')

  it('defines src, title, and tracklist props', () => {
    expect(component).toContain('src: string')
    expect(component).toContain('title?: string')
    expect(component).toContain('tracklist?: CompactParagraph[]')
  })

  it('has no local audio element anymore', () => {
    expect(component).not.toContain('<audio')
  })

  it('drives the global player instead', () => {
    expect(component).toContain('useAudioPlayer()')
    expect(component).toContain("kind: 'mix'")
    expect(component).toContain('isCurrent(')
  })

  it('links playback back to the current page', () => {
    expect(component).toContain('route.path')
  })

  it('toggles lucide play/pause icons off playing state', () => {
    expect(component).toContain('lucide:play')
    expect(component).toContain('lucide:pause')
  })

  it('shows elapsed time and seek without inline volume or total duration', () => {
    expect(component).toContain('formatDuration(active ? currentTime : 0)')
    expect(component).toContain('@input="onSeek"')
    expect(component).not.toContain('formatDuration(active ? duration : 0)')
    expect(component).not.toContain('lucide:volume-2')
    expect(component).not.toContain('setVolume')
  })

  it('leaves volume and total duration in the global bottom player', () => {
    expect(bottomPlayer).toContain('lucide:volume-2')
    expect(bottomPlayer).toContain('formatDuration(duration)')
    expect(bottomPlayer).toContain('setVolume')
  })

  it('applies font-mono to the time display', () => {
    expect(component).toContain('font-mono')
  })
})

describe('artist page mix tab', () => {
  const page = readProjectFile('app/pages/artist/[id].vue')

  it('gates the Mix tab on mix_audio_url', () => {
    expect(page).toContain('v-if="item.mix_audio_url"')
  })

  it('renders AudioMixPlayer with the mix title and release tracklist', () => {
    expect(page).toContain('<AudioMixPlayer')
    expect(page).toContain("item.mix_audio_url || ''")
    expect(page).toContain(':title="item.mix_title"')
    expect(page).toContain('mixRelease?.tracklistCompact')
  })

  it('looks up mixRelease by mix_release_slug without touching the iframe tabs', () => {
    expect(page).toContain('mix_release_slug')
    expect(page).toContain('v-if="item.youtube_playlist_id"')
    expect(page).toContain('v-if="item.soundcloud_track_id"')
  })
})
