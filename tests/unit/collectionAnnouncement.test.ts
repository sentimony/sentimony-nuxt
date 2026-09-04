import { describe, expect, it } from 'vitest'
import { collectionAnnouncement, type CollectionState } from '../../app/utils/collectionAnnouncement'

const base: CollectionState = {
  loading: false,
  loaded: false,
  error: false,
  empty: false,
  hasMore: false,
  remaining: 0,
  emptyText: 'Nothing saved here yet',
}

const announce = (states: Partial<CollectionState>[]) => {
  let previous: CollectionState | undefined
  return states.map((patch) => {
    const state = { ...base, ...patch }
    const text = collectionAnnouncement(state, previous)
    previous = state
    return text
  })
}

describe('collectionAnnouncement', () => {
  it('announces a second failure after a retry', () => {
    expect(announce([
      { loading: true },
      { error: true },
      { error: true, loading: true },
      { error: true },
    ])).toEqual(['Loading', '', 'Retrying', 'Retry failed'])
  })

  it('stays silent on the first failure because the alert announces it', () => {
    expect(announce([{ loading: true }, { error: true }])).toEqual(['Loading', ''])
  })

  it('reports a recovered retry through the loaded states', () => {
    expect(announce([
      { error: true },
      { error: true, loading: true },
      { loaded: true, hasMore: true, remaining: 12 },
      { loaded: true, loading: true },
      { loaded: true },
    ])).toEqual(['', 'Retrying', 'Loaded, 12 more available', 'Loading', 'All items loaded'])
  })

  it('uses the empty text once loaded with nothing', () => {
    expect(collectionAnnouncement({ ...base, loaded: true, empty: true })).toBe('Nothing saved here yet')
  })
})
