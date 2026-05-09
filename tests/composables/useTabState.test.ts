import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useTabState } from '../../app/composables/useTabState'

class MemoryStorage {
  private store = new Map<string, string>()
  getItem(k: string) { return this.store.get(k) ?? null }
  setItem(k: string, v: string) { this.store.set(k, String(v)) }
  removeItem(k: string) { this.store.delete(k) }
  clear() { this.store.clear() }
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

describe('useTabState', () => {
  it('returns the default tab when localStorage is empty', () => {
    const { activeTab } = useTabState('release', 'youtube')
    expect(activeTab.value).toBe('youtube')
  })

  it('reads previously-saved tab from localStorage', () => {
    storage.setItem('sentimony-tab-release', 'spotify')
    const { activeTab } = useTabState('release', 'youtube')
    expect(activeTab.value).toBe('spotify')
  })

  it('persists tab change to localStorage', async () => {
    const { activeTab, setActiveTab } = useTabState('release', 'youtube')
    setActiveTab('soundcloud')
    await nextTick()
    expect(storage.getItem('sentimony-tab-release')).toBe('soundcloud')
    expect(activeTab.value).toBe('soundcloud')
  })

  it('uses page-scoped key to avoid cross-page collision', async () => {
    const a = useTabState('release', 'youtube')
    const b = useTabState('artist', 'youtube')
    a.setActiveTab('bandcamp')
    b.setActiveTab('soundcloud')
    await nextTick()
    expect(storage.getItem('sentimony-tab-release')).toBe('bandcamp')
    expect(storage.getItem('sentimony-tab-artist')).toBe('soundcloud')
  })

  it('falls back to default when running without window (SSR)', () => {
    delete (globalThis as any).window
    delete (globalThis as any).localStorage
    const { activeTab } = useTabState('release', 'youtube')
    expect(activeTab.value).toBe('youtube')
  })
})
