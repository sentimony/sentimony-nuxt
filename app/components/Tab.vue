<script setup lang="ts">
import { computed, inject, onBeforeUnmount, reactive, watch } from 'vue'

const props = defineProps<{
  title?: string
  icon?: string
}>()

const tabs = inject<{
  registerTab: (info: { title?: string; icon?: string }) => number
  unregisterTab: (id: number) => void
  isActiveById: (id: number) => boolean
}>('tabs')

const info = reactive({ title: props.title, icon: props.icon })
const id = tabs?.registerTab(info)

watch(() => props.title, (v) => { info.title = v })
watch(() => props.icon, (v) => { info.icon = v })

onBeforeUnmount(() => {
  if (id != null) tabs?.unregisterTab(id)
})

const isActive = computed(() => (id != null ? !!tabs?.isActiveById(id) : false))
</script>

<template>
  <div
    class="p-3 bg-white/30 rounded-tr-lg rounded-br-lg rounded-bl-lg"
    v-show="isActive"
  >
    <slot />
  </div>
</template>

<style lang="scss"></style>
