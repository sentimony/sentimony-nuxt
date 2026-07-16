<script setup lang="ts">
import type { Playlist } from '~/types'

const { data: playlistsRaw } = await usePlaylists()
const playlists = computed(() => toArray<Playlist>(playlistsRaw.value, 'playlists'))
const playlistsSortedByDate = computed(() => visibleByDate(playlists.value, 'asc'))
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
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
  <div class="container max-w-[112rem]">

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class="flex flex-wrap justify-center w-full pb-7.5 md:pb-15">
      <Item
        v-for="i in playlistsSortedByDate"
        :key="i.slug"
        category="playlist"
        :i="i"
      />
    </div>

  </div>
</template>
