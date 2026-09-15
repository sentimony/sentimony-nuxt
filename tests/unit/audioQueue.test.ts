import { describe, expect, it } from 'vitest'
import { nextQueueIndex, prevQueueIndex, shuffleQueueOrder } from '../../app/utils/audioQueue'

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

  it('shuffles into a permutation that starts on the current track', () => {
    const order = shuffleQueueOrder(5, 2)
    expect(order[0]).toBe(2)
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4])
  })

  it('shuffles deterministically for a given random source', () => {
    expect(shuffleQueueOrder(4, 0, () => 0)).toEqual([0, 2, 3, 1])
  })

  it('handles empty and single-track queues', () => {
    expect(shuffleQueueOrder(0, 0)).toEqual([])
    expect(shuffleQueueOrder(1, 0)).toEqual([0])
  })
})
