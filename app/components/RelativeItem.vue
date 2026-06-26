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
      class="pr-1 flex items-center rounded-md transition-colors duration-300 hover:text-emerald-900 dark:hover:text-emerald-100"
      v-wave
    >
      <NuxtImg v-if="i.cover_xl"
        :src="i.cover_xl"
        class="rounded-md ring-1 ring-black/20 dark:ring-white/50 w-[24px] mr-2"
        :alt="i.title + ' thumbnail'"
        width="24"
        format="webp"
        loading="lazy"
      />
      <NuxtImg
        v-if="i.photo_xl"
        :src="i.photo_xl"
        class="rounded-full ring-1 ring-black/20 dark:ring-white/50 w-[24px] mr-2"
        :alt="i.title + ' thumbnail'"
        width="24"
        format="webp"
        loading="lazy"
      />

      <span v-if="i.title" class="mr-1">{{ i.title }}</span>
      <small v-if="year" class="mr-1">({{ year }})</small>
      <!-- <small>Read More</small> -->
    </NuxtLink>

  </span>
</template>
