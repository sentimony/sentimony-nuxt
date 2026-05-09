import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useTabState } from '../../app/composables/useTabState'

class MemoryStorage {
  private store = new Map<string, string>()
  getItem(k: string) { return this.store.get(k) ?? null }
  setItem(k: string, v: string) { this.store.set(k, String(v)) }
  removeItem(k: string) { this.store.delete(k) }
  clear() { this.store.clear() }
  get length() { return this.store.size }
}

let storage: MemoryStorage

beforeEach(() => {
  storage = new MemoryStorage()
  ;(globalThis as any).window = { localStorage: storage }
  ;(globalThis as any).localStorage = storage
})

afterEach(() => {
  delete (globalThis as any).window
  delete (globalThis as any).localStorage
})

describe('tab state isolation across pages', () => {
  it('reads independent values from per-page keys', () => {
    storage.setItem('sentimony-tab-release', 'soundcloud')
    storage.setItem('sentimony-tab-artist', 'youtube')

    const release = useTabState('release', 'youtube')
    const artist = useTabState('artist', 'youtube')

    expect(release.activeTab.value).toBe('soundcloud')
    expect(artist.activeTab.value).toBe('youtube')
  })

  it('writes to distinct keys without collision', async () => {
    const release = useTabState('release', 'youtube')
    const artist = useTabState('artist', 'youtube')
    const playlist = useTabState('playlist', 'bandcamp')
    const video = useTabState('video', 'soundcloud')

    release.setActiveTab('bandcamp')
    artist.setActiveTab('soundcloud')
    playlist.setActiveTab('youtubemusic')
    video.setActiveTab('youtube')
    await nextTick()

    expect(storage.getItem('sentimony-tab-release')).toBe('bandcamp')
    expect(storage.getItem('sentimony-tab-artist')).toBe('soundcloud')
    expect(storage.getItem('sentimony-tab-playlist')).toBe('youtubemusic')
    expect(storage.getItem('sentimony-tab-video')).toBe('youtube')
    expect(storage.length).toBe(4)
  })

  it('changes to one page do not affect another', async () => {
    storage.setItem('sentimony-tab-release', 'soundcloud')
    const release = useTabState('release', 'youtube')
    const artist = useTabState('artist', 'youtube')
    expect(release.activeTab.value).toBe('soundcloud')
    expect(artist.activeTab.value).toBe('youtube')

    artist.setActiveTab('soundcloud')
    await nextTick()

    expect(storage.getItem('sentimony-tab-release')).toBe('soundcloud')
    expect(storage.getItem('sentimony-tab-artist')).toBe('soundcloud')
    expect(release.activeTab.value).toBe('soundcloud')
    expect(artist.activeTab.value).toBe('soundcloud')

    release.setActiveTab('bandcamp')
    await nextTick()
    expect(storage.getItem('sentimony-tab-release')).toBe('bandcamp')
    expect(storage.getItem('sentimony-tab-artist')).toBe('soundcloud')
  })

  it('uses default fallback when a page-key is missing', () => {
    storage.setItem('sentimony-tab-release', 'bandcamp')
    const release = useTabState('release', 'youtube')
    const artist = useTabState('artist', 'youtube')
    expect(release.activeTab.value).toBe('bandcamp')
    expect(artist.activeTab.value).toBe('youtube')
  })
})
