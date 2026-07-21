import { computed, reactive, ref, watch } from 'vue'
import type { ComputedRef, InjectionKey, WritableComputedRef } from 'vue'

export type TabInfo = { title?: string, icon?: string, img?: string, order?: number }
export type TabRecord = { id: number, info: TabInfo }

export type TabsContext = {
  tabs: TabRecord[]
  orderedTabs: ComputedRef<TabRecord[]>
  selected: WritableComputedRef<number | undefined>
  registerTab: (info: TabInfo) => number
  unregisterTab: (id: number) => void
  isActivated: (id: number) => boolean
}

export const tabsKey = Symbol('tabs') as InjectionKey<TabsContext>

export function createTabsContext(): TabsContext {
  const tabs = reactive<TabRecord[]>([])
  const manual = ref<number | undefined>()
  const activatedTabIds = reactive(new Set<number>())
  let idCounter = 0

  const orderKey = (tab: TabRecord) => tab.info.order ?? tab.id
  const orderedTabs = computed(() => [...tabs].sort((a, b) => orderKey(a) - orderKey(b)))
  const defaultId = computed(() => orderedTabs.value[0]?.id)

  const selected = computed<number | undefined>({
    get: () => (manual.value != null && tabs.some(tab => tab.id === manual.value))
      ? manual.value
      : defaultId.value,
    set: (value) => { manual.value = value },
  })

  function activate(id?: number) {
    if (id != null) activatedTabIds.add(id)
  }

  function registerTab(info: TabInfo): number {
    const id = idCounter++
    tabs.push({ id, info })
    activate(selected.value)
    return id
  }

  function unregisterTab(id: number) {
    const index = tabs.findIndex(tab => tab.id === id)
    if (index !== -1) tabs.splice(index, 1)
    activatedTabIds.delete(id)
    if (manual.value === id) manual.value = undefined
    activate(selected.value)
  }

  watch(selected, activate)

  return {
    tabs,
    orderedTabs,
    selected,
    registerTab,
    unregisterTab,
    isActivated: id => activatedTabIds.has(id),
  }
}
