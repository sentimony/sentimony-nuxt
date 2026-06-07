<script setup lang="ts">
import { inject, onBeforeUnmount, reactive, watch } from 'vue'

const props = defineProps<{
  title?: string
  icon?: string
}>()

const tabs = inject<{
  registerTab: (info: { title?: string; icon?: string }) => number
  unregisterTab: (id: number) => void
}>('tabs')

const info = reactive({ title: props.title, icon: props.icon })
const id = tabs?.registerTab(info)

watch(() => props.title, (v) => { info.title = v })
watch(() => props.icon, (v) => { info.icon = v })

onBeforeUnmount(() => {
  if (id != null) tabs?.unregisterTab(id)
})
</script>

<template>
  <TabsContent
    v-if="id != null"
    :value="id"
    class="p-3 bg-white/50 dark:bg-white/30 rounded-tr-lg rounded-br-lg rounded-bl-lg backdrop-blur-sm"
  >
    <slot />
  </TabsContent>
</template>
