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
    expect(component).toContain('<PlayerSeek')
    expect(component).toContain('@seek="seek"')
    expect(component).toContain('@input="onVolumeChange"')
    expect(component).not.toContain('aria-label="Close player"')
  })

  it('shows font-mono timings and links the title to its source page', () => {
    const seek = read('app/components/player/PlayerSeek.vue')
    expect(seek).toContain('font-mono')
    expect(seek).toContain('formatDuration(')
    expect(component).toContain('current.link')
  })

  it('is mounted outside the header as a bottom player', () => {
    expect(component).toContain('data-testid="audio-bottom-player"')
    expect(read('app/layouts/default.vue')).toContain('<GlobalPlayer />')
  })

  it('announces track changes outside the aria-hidden wrapper', () => {
    const liveIndex = component.indexOf('aria-live="polite"')
    const hiddenIndex = component.indexOf(':aria-hidden="!revealed"')

    expect(liveIndex).toBeGreaterThan(-1)
    expect(liveIndex, 'a live region inside the hidden wrapper stays silent').toBeLessThan(hiddenIndex)
    expect(component).toContain('aria-atomic="true"')
    expect(component).toContain('{{ nowPlayingLabel }}')
  })

  it('keeps the announcement empty while nothing plays', () => {
    expect(component).toContain("if (!c) return ''")
  })
})
