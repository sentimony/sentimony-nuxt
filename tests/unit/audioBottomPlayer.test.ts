import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (p: string) => {
  const path = fileURLToPath(new URL(`../../${p}`, import.meta.url))
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

describe('GlobalPlayer.vue', () => {
  const component = read('app/components/player/GlobalPlayer.vue')

  it('stays mounted even when nothing is loaded', () => {
    expect(component).not.toContain('<div v-if="current">')
    expect(component).toContain('v-if="current"')
  })

  it('has seek and volume controls but no close button', () => {
    expect(component).toContain('@input="onSeek"')
    expect(component).toContain('@input="onVolumeChange"')
    expect(component).not.toContain('aria-label="Close player"')
  })

  it('shows font-mono timings and links the title to its source page', () => {
    expect(component).toContain('font-mono')
    expect(component).toContain('formatDuration(')
    expect(component).toContain('current.link')
  })

  it('is mounted outside the header as a bottom player', () => {
    expect(component).toContain('data-testid="audio-bottom-player"')
    expect(read('app/layouts/default.vue')).toContain('<GlobalPlayer />')
  })
})
