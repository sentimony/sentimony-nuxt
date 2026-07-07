import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (p: string) => readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), 'utf8')

describe('HeaderMiniPlayer.vue', () => {
  const component = read('app/components/HeaderMiniPlayer.vue')

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

  it('is mounted inside the header', () => {
    expect(read('app/components/Header.vue')).toContain('<HeaderMiniPlayer />')
  })
})
