import { reactive, ref, watch } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export type TabInfo = { title?: string, icon?: string, img?: string }
export type TabRecord = { id: number, info: TabInfo }

export type TabsContext = {
  tabs: TabRecord[]
  selected: Ref<number | undefined>
  registerTab: (info: TabInfo) => number
  unregisterTab: (id: number) => void
  isActivated: (id: number) => boolean
}

export const tabsKey = Symbol('tabs') as InjectionKey<TabsContext>

export function createTabsContext(): TabsContext {
  const tabs = reactive<TabRecord[]>([])
  const selected = ref<number | undefined>()
  const activatedTabIds = reactive(new Set<number>())
  let idCounter = 0

  function activate(id?: number) {
    if (id != null) activatedTabIds.add(id)
  }

  function registerTab(info: TabInfo): number {
    const id = idCounter++
    tabs.push({ id, info })
    if (selected.value == null) {
      selected.value = id
      activate(id)
    }
    return id
  }

  function unregisterTab(id: number) {
    const index = tabs.findIndex(tab => tab.id === id)
    if (index !== -1) tabs.splice(index, 1)
    activatedTabIds.delete(id)
    if (selected.value === id) {
      selected.value = tabs[0]?.id
      activate(selected.value)
    }
  }

  watch(selected, activate)

  return {
    tabs,
    selected,
    registerTab,
    unregisterTab,
    isActivated: id => activatedTabIds.has(id),
  }
}
