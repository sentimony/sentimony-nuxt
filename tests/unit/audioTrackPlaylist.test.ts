import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('PagePlayer.vue', () => {
  const component = readProjectFile('app/components/player/PagePlayer.vue')

  it('defines a tracks prop of title/url/slug entries', () => {
    expect(component).toMatch(/tracks:\s*{\s*title:\s*string\s*(?:titleSegments\?:[^\n]*\s*)?url:\s*string\s*slug\?:\s*string/)
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

  it('skips its own play-count fetch when counts are provided by prop', () => {
    expect(component).toContain('playCounts?: Record<string, number>')
    expect(component).toContain('if (props.playCounts) return')
  })

  it('syncs prop counts through mergePlayCounts without dropping local increments', () => {
    expect(component).toContain('mergePlayCounts(playCounts.value, incoming)')
    expect(component).toContain('{ deep: true }')
  })

  const controls = readProjectFile('app/components/player/PlayerControls.vue')

  it('delegates play/pause to the shared PlayerControls', () => {
    expect(component).toContain('<PlayerControls')
    expect(component).toContain(':is-playing="playingThis"')
    expect(controls).toContain('lucide:play')
    expect(controls).toContain('lucide:pause')
  })

  it('provides prev/next controls gated on playlist boundaries', () => {
    expect(controls).toContain('lucide:skip-back')
    expect(controls).toContain('lucide:skip-forward')
    expect(component).toContain('const canPrev = computed(() => isActive.value && activeIndex.value > 0)')
    expect(component).toContain(':can-prev="canPrev"')
  })

  it('renders a clickable track list highlighting the current track', () => {
    expect(component).toContain('v-for="(track, index) in tracks"')
    expect(component).toContain('@click="playTrack(index)"')
  })

  it('delegates seek/time/volume to the global bottom player', () => {
    expect(component).not.toContain('@input="onSeek"')
    expect(component).not.toContain('lucide:volume-2')
    expect(component).not.toContain('setVolume')
  })

  it('forwards per-artist title segments to the queue', () => {
    expect(component).toContain('artistSegments: t.artistSegments')
  })
})

describe('release page Sentimony tab', () => {
  const page = readProjectFile('app/pages/release/[id].vue')

  it('gates the Sentimony tab on the release tracklist', () => {
    expect(page).toContain('v-if="item.tracklist?.length"')
  })

  it('renders PagePlayer with artist-title player tracks', () => {
    expect(page).toContain('<PagePlayer')
    expect(page).toContain(':tracks="playerTracks"')
  })
})
