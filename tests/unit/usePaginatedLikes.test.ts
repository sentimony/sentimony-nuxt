import { computed, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

async function loadComposable(fetchImpl: () => Promise<unknown>) {
  vi.resetModules()
  Object.assign(globalThis, { ref, computed, $fetch: vi.fn(fetchImpl) })
  return (await import('../../app/composables/usePaginatedLikes')).usePaginatedLikes
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  for (const key of ['ref', 'computed', '$fetch']) {
    delete (globalThis as Record<string, unknown>)[key]
  }
})

describe('usePaginatedLikes', () => {
  it('reports a resolved zero-total collection as loaded without fetching', async () => {
    let fetchCalls = 0
    const usePaginatedLikes = await loadComposable(() => {
      fetchCalls += 1
      return Promise.resolve({ data: [], total: 0 })
    })
    const collection = usePaginatedLikes<{ slug: string }>('/api/likes/releases', 25, 0)

    await collection.ensureLoaded()

    expect(fetchCalls).toBe(0)
    expect(collection.loaded.value).toBe(true)
    expect(collection.items.value).toEqual([])
  })

  it('flags a failed load instead of reporting an empty collection', async () => {
    const usePaginatedLikes = await loadComposable(() => Promise.reject(new Error('boom')))
    const collection = usePaginatedLikes<{ slug: string }>('/api/track-likes/tracks', 25, 12)

    await collection.loadMore()

    expect(collection.error.value).toBe(true)
    expect(collection.items.value).toEqual([])
    expect(collection.total.value).toBe(12)
  })

  it('clears the error flag on a successful retry', async () => {
    let attempt = 0
    const usePaginatedLikes = await loadComposable(() => {
      attempt += 1
      return attempt === 1
        ? Promise.reject(new Error('boom'))
        : Promise.resolve({ data: [{ slug: 'a' }], total: 1 })
    })
    const collection = usePaginatedLikes<{ slug: string }>('/api/likes/releases', 25, 1)

    await collection.loadMore()
    await collection.retry()

    expect(collection.error.value).toBe(false)
    expect(collection.items.value).toHaveLength(1)
  })

  it('keeps the error state visible while a retry is pending', async () => {
    let attempt = 0
    let resolveRetry!: (value: { data: { slug: string }[], total: number }) => void
    const retryResponse = new Promise<{ data: { slug: string }[], total: number }>((resolve) => {
      resolveRetry = resolve
    })
    const usePaginatedLikes = await loadComposable(() => {
      attempt += 1
      return attempt === 1 ? Promise.reject(new Error('boom')) : retryResponse
    })
    const collection = usePaginatedLikes<{ slug: string }>('/api/likes/releases', 25, 1)

    await collection.loadMore()
    const retry = collection.retry()

    expect(collection.loading.value).toBe(true)
    expect(collection.error.value).toBe(true)

    resolveRetry({ data: [{ slug: 'a' }], total: 1 })
    await retry

    expect(collection.loading.value).toBe(false)
    expect(collection.error.value).toBe(false)
  })
})
