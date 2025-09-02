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
  selectedIndex.value = i
}
</script>

<template>
  <div>
    <div>
      <span
        v-for="(tab, index) in tabs"
        :key="tab.id"
        @click="selectTab(index)"
        class="inline-flex items-center h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-t-lg transition-[opacity] ease-in-out duration-300 text-white bg-white/30 px-2 md:px-3 mr-1 md:mr-2 last:mr-0"
        :class="index === selectedIndex ? 'cursor-default opacity-100' : 'cursor-pointer opacity-50 hover:opacity-100'"
      >
        <Icon v-if="tab.info.icon" :name="tab.info.icon" size="16" />
        <span v-if="tab.info.title" v-html="tab.info.title" class="hidden sm:inline ml-2" />
      </span>
    </div>
    <slot />
  </div>
</template>

<style lang="scss"></style>
