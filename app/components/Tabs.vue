<script setup lang="ts">
import { provide, reactive, ref } from 'vue'

type TabInfo = { title?: string; icon?: string }
type TabRecord = { id: number; info: TabInfo }

const tabs = reactive<TabRecord[]>([])
const selected = ref<number | undefined>(undefined)
let idCounter = 0

function registerTab(info: TabInfo): number {
  const id = idCounter++
  tabs.push({ id, info })
  if (selected.value == null) selected.value = id
  return id
}

function unregisterTab(id: number) {
  const idx = tabs.findIndex(t => t.id === id)
  if (idx !== -1) tabs.splice(idx, 1)
  if (selected.value === id) selected.value = tabs[0]?.id
}

provide('tabs', { registerTab, unregisterTab })
</script>

<template>
  <ClientOnly>
    <TabsRoot v-model="selected" :unmount-on-hide="false">

      <TabsList>
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.id"
          :value="tab.id"
          class="inline-flex items-center cursor-pointer h-[36px] md:h-[42px] text-[8px] md:text-[12px] tracking-tighter rounded-t-lg transition-opacity ease-in-out duration-300 text-white bg-white/30 px-3 md:px-4 mr-1 md:mr-1 last:mr-0 backdrop-blur-sm opacity-50 hover:opacity-100 data-[state=active]:opacity-100"
          v-wave
        >
          <Icon v-if="tab.info.icon" :name="tab.info.icon" size="18" />
          <span v-if="tab.info.title" v-html="tab.info.title" class="ml-2" />
        </TabsTrigger>
      </TabsList>

      <slot />

    </TabsRoot>
  </ClientOnly>
</template>
