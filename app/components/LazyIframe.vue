<script setup lang="ts">
defineProps<{
  active: boolean
  src: string
  title: string
}>()
defineEmits<{
  'request-activate': []
}>()
</script>

<template>
  <iframe
    v-if="active"
    :src="src"
    :title="title"
    loading="lazy"
    allow="autoplay; encrypted-media"
    class="w-full h-full"
  />
  <button
    v-else
    type="button"
    class="w-full aspect-video flex items-center justify-center gap-2 bg-black/50 hover:bg-black/70 text-white rounded-md transition-colors duration-200"
    :aria-label="`Load ${title} player`"
    @click="$emit('request-activate')"
  >
    <Icon name="heroicons:play" size="22" />
    <span>{{ title }}</span>
  </button>
</template>
