import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('AudioTrackPlaylist.vue', () => {
  const component = readProjectFile('app/components/AudioTrackPlaylist.vue')

  it('defines a tracks prop of title/url/slug entries', () => {
    expect(component).toContain('tracks: { title: string; url: string; slug?: string }[]')
  })

  it('renders a native audio element bound to the current track', () => {
    expect(component).toContain('<audio')
    expect(component).toContain(':src="currentTrack?.url"')
  })

  it('toggles lucide play/pause icons off playing state', () => {
    expect(component).toContain('lucide:play')
    expect(component).toContain('lucide:pause')
  })

  it('auto-advances to the next track when the current one ends', () => {
    expect(component).toContain('@ended="onEnded"')
    expect(component).toContain('function onEnded')
  })

  it('provides prev/next controls gated on playlist boundaries', () => {
    expect(component).toContain('lucide:skip-back')
    expect(component).toContain('lucide:skip-forward')
    expect(component).toContain(':disabled="currentIndex === 0"')
  })

  it('renders a clickable track list highlighting the current track', () => {
    expect(component).toContain('v-for="(track, index) in tracks"')
    expect(component).toContain('@click="playTrack(index)"')
  })

  it('formats elapsed and total time with formatDuration', () => {
    expect(component).toContain('formatDuration(currentTime)')
    expect(component).toContain('formatDuration(duration)')
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
