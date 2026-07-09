import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (p: string) => readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), 'utf8')

describe('AudioBridge.vue', () => {
  const component = read('app/components/AudioBridge.vue')

  it('owns the single hidden audio element', () => {
    expect(component).toContain('<audio')
    expect(component).toContain('ref="audioEl"')
  })

  it('auto-advances the queue on ended', () => {
    expect(component).toContain('@ended="onEnded"')
    expect(component).toContain('next()')
  })

  it('persists volume and updates media session', () => {
    expect(component).toContain("localStorage.getItem('player-volume')")
    expect(component).toContain('navigator.mediaSession')
  })

  it('reports playback errors via toast', () => {
    expect(component).toContain('toast.error')
  })

  it('is mounted once in app.vue', () => {
    expect(read('app/app.vue')).toContain('<AudioBridge />')
  })
})
