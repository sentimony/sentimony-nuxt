import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  fileURLToPath(new URL('../../app/composables/useAudioPlayer.ts', import.meta.url)),
  'utf8'
)

describe('useAudioPlayer', () => {
  it('stores global state via useState keys', () => {
    expect(source).toContain("useState<PlayerItem | null>('audio-player-current'")
    expect(source).toContain("useState<boolean>('audio-player-playing'")
    expect(source).toContain("useState<number | null>('audio-player-seek'")
  })

  it('exposes the full controller API', () => {
    for (const name of ['function play', 'function toggle', 'function seek', 'function setVolume', 'function close', 'function next', 'function prev', 'function isCurrent']) {
      expect(source).toContain(name)
    }
  })

  it('uses pure queue helpers for next/prev', () => {
    expect(source).toContain('nextQueueIndex(')
    expect(source).toContain('prevQueueIndex(')
  })

  it('supports mix and track kinds with an optional queue', () => {
    expect(source).toContain("kind: 'mix' | 'track'")
    expect(source).toContain('queue?: QueueItem[]')
  })
})
