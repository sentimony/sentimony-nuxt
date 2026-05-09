import { ref, watch } from 'vue'

export function useTabState(page: string, defaultTab: string) {
  const key = `sentimony-tab-${page}`
  const isClient = typeof window !== 'undefined'
  const initial = isClient
    ? (window.localStorage.getItem(key) ?? defaultTab)
    : defaultTab
  const activeTab = ref<string>(initial)
  watch(activeTab, (v) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, v)
    }
  })
  function setActiveTab(t: string) {
    activeTab.value = t
  }
  return { activeTab, setActiveTab }
}
