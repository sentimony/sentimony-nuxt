<script setup lang="ts">
const props = defineProps<{
  title: string
  artists?: { slug: string, title?: string }[]
}>()

const segments = computed(() => splitTitleByArtists(props.title, props.artists ?? []))
</script>

<template>
  <template v-for="(segment, index) in segments" :key="`${segment.text}-${index}`">
    <NuxtLink
      v-if="segment.slug"
      :to="`/artist/${segment.slug}`"
      class="hover:underline"
    >{{ segment.text }}</NuxtLink>
    <template v-else>{{ segment.text }}</template>
  </template>
</template>
