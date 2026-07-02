import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('AudioMixPlayer.vue', () => {
  const component = readProjectFile('app/components/AudioMixPlayer.vue')

  it('defines src, title, and tracklist props', () => {
    expect(component).toContain('src: string')
    expect(component).toContain('title?: string')
    expect(component).toContain('tracklist?: CompactParagraph[]')
  })

  it('renders a native audio element bound to src', () => {
    expect(component).toContain('<audio')
    expect(component).toContain(':src="src"')
  })

  it('toggles lucide play/pause icons off playing state', () => {
    expect(component).toContain('lucide:play')
    expect(component).toContain('lucide:pause')
  })

  it('formats elapsed and total time with formatDuration', () => {
    expect(component).toContain('formatDuration(currentTime)')
    expect(component).toContain('formatDuration(duration)')
  })

  it('applies font-mono to the time display', () => {
    expect(component).toContain('font-mono')
  })
})
