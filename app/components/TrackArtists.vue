<script setup lang="ts">
const props = defineProps<{
  name: string
  slug?: string | null
}>()

const parts = computed(() => splitTrackArtists(props.name, props.slug))
</script>

<template>
  <template v-for="(artist, index) in parts" :key="`${artist.slug ?? artist.name}-${index}`">
    <NuxtLink
      v-if="artist.slug"
      :to="`/artist/${artist.slug}`"
      class="hover:underline"
    ><b>{{ artist.name }}</b></NuxtLink>
    <b v-else>{{ artist.name }}</b>
    <span v-if="index < parts.length - 1"> &amp; </span>
  </template>
</template>
