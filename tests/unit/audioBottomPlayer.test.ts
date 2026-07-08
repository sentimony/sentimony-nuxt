import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (p: string) => {
  const path = fileURLToPath(new URL(`../../${p}`, import.meta.url))
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

describe('AudioBottomPlayer.vue', () => {
  const component = read('app/components/AudioBottomPlayer.vue')

  it('renders only while something is loaded', () => {
    expect(component).toContain('v-if="current"')
  })

  it('has play/pause, seek, volume and close controls', () => {
    expect(component).toContain('lucide:pause')
    expect(component).toContain('lucide:play')
    expect(component).toContain('@input="onSeek"')
    expect(component).toContain('@input="onVolumeChange"')
    expect(component).toContain('lucide:x')
  })

  it('shows font-mono timings and links the title to its source page', () => {
    expect(component).toContain('font-mono')
    expect(component).toContain('formatDuration(')
    expect(component).toContain('current.link')
  })

  it('is mounted outside the header as a bottom player', () => {
    expect(component).toContain('data-testid="audio-bottom-player"')
    expect(read('app/components/Header.vue')).not.toContain('<HeaderMiniPlayer />')
    expect(read('app/layouts/default.vue')).toContain('<AudioBottomPlayer />')
  })
})
