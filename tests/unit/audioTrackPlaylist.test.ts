import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('AudioTrackPlaylist.vue', () => {
  const component = readProjectFile('app/components/AudioTrackPlaylist.vue')

  it('defines a tracks prop of title/url/slug entries', () => {
    expect(component).toMatch(/tracks:\s*{\s*title:\s*string\s*url:\s*string\s*slug\?:\s*string/)
  })

  it('has no local audio element anymore', () => {
    expect(component).not.toContain('<audio')
  })

  it('drives the global player with a track queue', () => {
    expect(component).toContain('useAudioPlayer()')
    expect(component).toContain("kind: 'track'")
    expect(component).toContain('queue')
  })

  it('still exposes playTrack for the release page', () => {
    expect(component).toContain('defineExpose({ playTrack })')
  })

  it('keeps registering play counts', () => {
    expect(component).toContain("$fetch('/api/track-plays', { method: 'POST'")
  })

  it('toggles lucide play/pause icons off playing state', () => {
    expect(component).toContain('lucide:play')
    expect(component).toContain('lucide:pause')
  })

  it('provides prev/next controls gated on playlist boundaries', () => {
    expect(component).toContain('lucide:skip-back')
    expect(component).toContain('lucide:skip-forward')
    expect(component).toContain(':disabled="!isActive || activeIndex === 0"')
  })

  it('renders a clickable track list highlighting the current track', () => {
    expect(component).toContain('v-for="(track, index) in tracks"')
    expect(component).toContain('@click="playTrack(index)"')
  })

  it('formats elapsed and total time with formatDuration', () => {
    expect(component).toContain('formatDuration(isActive ? currentTime : 0)')
    expect(component).toContain('formatDuration(isActive ? duration : 0)')
  })

  it('applies font-mono to the time display', () => {
    expect(component).toContain('font-mono')
  })
})

describe('release page Sentimony tab', () => {
  const page = readProjectFile('app/pages/release/[id].vue')

  it('gates the Sentimony tab on the release tracklist', () => {
    expect(page).toContain('v-if="item.tracklist?.length"')
  })

  it('renders AudioTrackPlaylist with artist-title player tracks', () => {
    expect(page).toContain('<AudioTrackPlaylist')
    expect(page).toContain(':tracks="playerTracks"')
  })
})
