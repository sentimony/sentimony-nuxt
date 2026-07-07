import { describe, expect, it } from 'vitest'
import { nextQueueIndex, prevQueueIndex } from '../../app/utils/audioQueue'

describe('audioQueue', () => {
  it('advances within bounds', () => {
    expect(nextQueueIndex(3, 0)).toBe(1)
    expect(nextQueueIndex(3, 1)).toBe(2)
  })

  it('returns null past the last track', () => {
    expect(nextQueueIndex(3, 2)).toBeNull()
    expect(nextQueueIndex(0, 0)).toBeNull()
  })

  it('goes back within bounds and stops at the first track', () => {
    expect(prevQueueIndex(2)).toBe(1)
    expect(prevQueueIndex(0)).toBeNull()
  })
})
