<script setup lang="ts">
import type { Tag } from '~/types'

defineProps<{
  tag: Tag
}>()

// Convert country code to flag emoji
function countryCodeToFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
</script>

<template>
  <NuxtLink
    :to="`/tag/${tag.slug}`"
    class="inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-md text-sm transition-colors"
    v-wave
  >
    <!-- Country flag -->
    <span v-if="tag.country_code">
      {{ countryCodeToFlag(tag.country_code) }}
    </span>
    <!-- Type icon -->
    <Icon
      v-else-if="tag.type?.slug === 'musicians'"
      name="mdi:account-music"
      class="text-white/70"
    />
    <Icon
      v-else-if="tag.type?.slug === 'styles'"
      name="mdi:music-note"
      class="text-white/70"
    />
    <span>{{ tag.title }}</span>
  </NuxtLink>
</template>
