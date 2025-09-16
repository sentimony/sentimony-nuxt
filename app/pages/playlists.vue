<script setup lang="ts">
import { toArray } from '~/composables/toArray'

const { data: playlistsRaw } = await usePlaylists()
const playlists = computed(() => toArray(playlistsRaw.value, 'playlists'))
const playlistsSortedByDate = computed(() =>
  [...playlists.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
    .reverse()
)
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Playlists'
const PageDescription = 'Curated playlists by Sentimony Records: dark progressive psytrance and trippy psychill selections for deep listening and dancefloors.'
useSeoMeta({
  title: PageTitle,
  description: PageDescription,
  ogTitle: PageTitle,
  ogDescription: PageDescription,
  ogImage: appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: PageTitle,
  twitterDescription: PageDescription,
  twitterImage: appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>

<template>
  <div class="container">

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in playlistsSortedByDate"
        :key="i.slug"
        category="playlist"
        :i="i"
      />
    </div>

  </div>
</template>

<style lang="scss"></style>
