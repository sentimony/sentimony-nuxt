<script setup lang="ts">
import { computed, toRef } from 'vue'

const props = defineProps<{
  i?: any
  category?: string
}>()

const i = toRef(props, 'i')
const category = toRef(props, 'category')

const { formatYear } = useDate()
const year = computed(() => formatYear(i.value?.date))
</script>

<template>
  <span class="inline-flex items-center">

    <NuxtLink
      :to="'/' + category + '/' + i.slug"
      class="pr-1 hover:bg-white/20 flex items-center rounded-md"
      v-wave
    >
      <img v-if="i.cover_th"
        :src="i.cover_th"
        class="rounded-md ring-1 ring-white/50 w-[24px] mr-2"
        :alt="i.title + ' thumbnail'"
        loading="lazy"
      >
      <img
        v-if="i.photo_th"
        :src="i.photo_th"
        class="rounded-full ring-1 ring-white/50 w-[24px] mr-2"
        :alt="i.title + ' thumbnail'"
        loading="lazy"
      >

      <span v-if="i.title" class="mr-1">{{ i.title }}</span>
      <small v-if="year" class="mr-1">({{ year }})</small>
      <!-- <small>Read More</small> -->
    </NuxtLink>

  </span>
</template>
