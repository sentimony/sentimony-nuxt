<script setup lang="ts">
import { provide, reactive, ref } from 'vue'

type TabInfo = { title?: string; icon?: string }
type TabRecord = { id: number; info: TabInfo }

const tabs = reactive<TabRecord[]>([])
const selectedIndex = ref(0)
let idCounter = 0

function registerTab(info: TabInfo): number {
  const id = idCounter++
  tabs.push({ id, info })
  return id
}

function unregisterTab(id: number) {
  const idx = tabs.findIndex(t => t.id === id)
  if (idx !== -1) tabs.splice(idx, 1)
  if (selectedIndex.value >= tabs.length) {
    selectedIndex.value = Math.max(0, tabs.length - 1)
  }
}

function isActiveById(id: number): boolean {
  const idx = tabs.findIndex(t => t.id === id)
  return idx === selectedIndex.value
}

provide('tabs', { registerTab, unregisterTab, isActiveById })

function selectTab(i: number) {
  if (i < 0 || i >= tabs.length) return
  selectedIndex.value = i
}

function onKeydown(e: KeyboardEvent, index: number) {
  const last = tabs.length - 1
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    selectTab(index === last ? 0 : index + 1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    selectTab(index === 0 ? last : index - 1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    selectTab(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    selectTab(last)
  }
}
</script>

<template>
  <ClientOnly>
    <div role="tablist">

      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="index === selectedIndex"
        :tabindex="index === selectedIndex ? 0 : -1"
        @click="selectTab(index)"
        @keydown="onKeydown($event, index)"
        class="inline-flex items-center cursor-pointer h-[36px] md:h-[42px] text-[8px] md:text-[12px] tracking-tighter rounded-t-lg transition-opacity ease-in-out duration-300 text-white bg-white/30 px-3 md:px-4 mr-1 md:mr-1 last:mr-0 backdrop-blur-sm"
        :class="index === selectedIndex ? 'opacity-100' : 'opacity-50 hover:opacity-100 focus-visible:opacity-100'"
        v-wave
      >
        <Icon v-if="tab.info.icon" :name="tab.info.icon" size="18" />
        <span v-if="tab.info.title" v-html="tab.info.title" class="ml-2" />
      </button>

    </div>

    <slot />

  </ClientOnly>
</template>
