<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { ItemEntity } from '~/types'

const props = defineProps<{
  i: ItemEntity & { date?: string }
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
      class="pr-1 flex items-center rounded-md transition-colors duration-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-emerald-900 dark:hover:text-emerald-100"
      v-wave
    >
      <img v-if="i.cover_xl || i.flyer_a_xl"
        :src="thumb(i.cover_xl || i.flyer_a_xl)"
        class="rounded-md ring-1 ring-black/20 dark:ring-white/50 w-[24px] mr-2"
        :alt="i.title + ' thumbnail'"
        width="24"
        loading="lazy"
      />
      <img
        v-if="i.photo_xl"
        :src="thumb(i.photo_xl)"
        class="rounded-full ring-1 ring-black/20 dark:ring-white/50 w-[24px] mr-2"
        :alt="i.title + ' thumbnail'"
        width="24"
        loading="lazy"
      />

      <span v-if="i.title" class="mr-1">{{ i.title }}</span>
      <small v-if="year" class="mr-1">({{ year }})</small>
      <!-- <small>Read More</small> -->
    </NuxtLink>

  </span>
</template>
