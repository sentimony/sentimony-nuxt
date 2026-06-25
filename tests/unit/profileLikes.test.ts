import { describe, expect, it, vi } from 'vitest'
import { aggregateProfileLikes } from '../../server/utils/profileLikes'

describe('aggregateProfileLikes', () => {
  it('loads all profile categories in parallel and preserves their keys', async () => {
    const calls: string[] = []
    const load = (key: string) => vi.fn(async () => {
      calls.push(key)
      return { data: [{ slug: key }], total: 1 }
    })
    const loaders = {
      releases: load('releases'),
      tracks: load('tracks'),
      artists: load('artists'),
      videos: load('videos'),
      playlists: load('playlists'),
      events: load('events'),
    }

    const result = await aggregateProfileLikes(loaders)

    expect(Object.keys(result)).toEqual(Object.keys(loaders))
    expect(calls).toHaveLength(6)
    expect(result.tracks).toEqual({ data: [{ slug: 'tracks' }], total: 1 })
  })
})
