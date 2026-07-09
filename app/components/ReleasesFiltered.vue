<script setup lang="ts">
import type { Release } from '~/types'

const props = defineProps<{
  keyword: string
  title: string
}>()

const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const filtered = computed(() =>
  [...releases.value]
    .filter(r => r.visible && r.style?.toLowerCase().includes(props.keyword.toLowerCase()))
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
)
</script>

<template>
  <div class="container max-w-[112rem]">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ title }}</h1>

    <GenreTabs />

    <p class="text-white/40 text-sm mb-4">{{ filtered.length }} releases</p>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in filtered"
        :key="i.slug"
        category="release"
        :i="i"
      />
    </div>
  </div>
</template>
