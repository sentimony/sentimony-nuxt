import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { withSetup } from '../utils/withSetup'
import { userMock, navigateToMock } from '../setup'

describe('useLikes', () => {
  let currentWrapper: VueWrapper | null = null

  beforeEach(() => {
    useState<string[]>('likes', () => []).value = []
    useState<boolean>('likes-loaded', () => false).value = false
    useState<Record<string, number>>('like-counts', () => ({})).value = {}
  })

  afterEach(() => {
    currentWrapper?.unmount()
    currentWrapper = null
  })

  it('завантажує лайки на mount, якщо user залогінений', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn().mockResolvedValue(['slug-a', 'slug-b'])
    vi.stubGlobal('$fetch', fetchMock)

    const { result, wrapper } = withSetup(() => useLikes())
    currentWrapper = wrapper
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/api/likes')
    expect(result.isLiked('slug-a')).toBe(true)
    expect(result.isLiked('slug-b')).toBe(true)
    expect(result.isLiked('slug-c')).toBe(false)
  })

  it('isLiked повертає false і likeCount = 0 для невідомого slug', async () => {
    userMock.value = { id: 'user-1' }
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]))

    const { result, wrapper } = withSetup(() => useLikes())
    currentWrapper = wrapper
    await flushPromises()

    expect(result.isLiked('unknown')).toBe(false)
    expect(result.likeCount('unknown')).toBe(0)
  })

  it('toggleLike оптимістично додає slug і шле POST /api/likes', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('$fetch', fetchMock)

    const { result, wrapper } = withSetup(() => useLikes())
    currentWrapper = wrapper
    await flushPromises()

    await result.toggleLike('slug-x')

    expect(result.isLiked('slug-x')).toBe(true)
    expect(result.likeCount('slug-x')).toBe(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/likes', {
      method: 'POST',
      body: { slug: 'slug-x' },
    })
  })

  it('toggleLike відкочує оптимістичний стан при помилці server-у', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('500 Server Error'))
    vi.stubGlobal('$fetch', fetchMock)

    const { result, wrapper } = withSetup(() => useLikes())
    currentWrapper = wrapper
    await flushPromises()

    await result.toggleLike('slug-y')

    expect(result.isLiked('slug-y')).toBe(false)
    expect(result.likeCount('slug-y')).toBe(0)
  })

  it('toggleLike без залогіненого user-а робить navigateTo("/login") і не шле fetch', async () => {
    userMock.value = null
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)

    const { result, wrapper } = withSetup(() => useLikes())
    currentWrapper = wrapper
    await flushPromises()

    await result.toggleLike('slug-z')

    expect(navigateToMock).toHaveBeenCalledWith('/login')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.isLiked('slug-z')).toBe(false)
  })
})
