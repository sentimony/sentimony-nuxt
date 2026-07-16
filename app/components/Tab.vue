<script setup lang="ts">
import { computed, inject, onBeforeUnmount, reactive, watch } from 'vue'
import { tabsKey } from '~/utils/tabs'

const props = defineProps<{
  title?: string
  icon?: string
  img?: string
}>()

const tabs = inject(tabsKey)
const info = reactive({ title: props.title, icon: props.icon, img: props.img })
const id = tabs?.registerTab(info)
const isActivated = computed(() => id != null && Boolean(tabs?.isActivated(id)))

watch(() => props.title, (value) => { info.title = value })
watch(() => props.icon, (value) => { info.icon = value })
watch(() => props.img, (value) => { info.img = value })

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
    <slot v-if="isActivated" />
  </TabsContent>
</template>
