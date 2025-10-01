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
  <span class="flex items-center">

    <NuxtLink
      v-if="i.cover_th || i.photo_th"
      :to="'/' + category + '/' + i.slug"
      class="w-[24px] mr-2"
    >
      <img v-if="i.cover_th" :src="i.cover_th" class="block"
        :alt="i.title + ' thumbnail'"
        loading="lazy"
      >
      <img
        v-if="i.photo_th" :src="i.photo_th" class="block"
        :alt="i.title + ' thumbnail'"
        loading="lazy"
      >
    </NuxtLink>

    <span>
      <span v-if="i.title">{{ i.title }}</span>
      <small v-if="year" class="ml-1">({{ year }})</small>

      <NuxtLink
        :to="'/' + category + '/' + i.slug"
        class="ml-1"
      >
        <small>Read More</small>
      </NuxtLink>

    </span>

  </span>
</template>
