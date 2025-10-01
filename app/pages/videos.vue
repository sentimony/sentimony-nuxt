<script setup lang="ts">
import { toArray } from '~/composables/toArray'

const { data: videosRaw } = await useVideos()
const videos = computed(() => toArray(videosRaw.value, 'videos'))
const videosSortedByDate = computed(() =>
  [...videos.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Videos'
const PageDescription = 'Music videos and live performances from Sentimony Records artists: official clips, visualizers and show recordings in psytrance darkprog and psychill.'
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

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in videosSortedByDate"
        :key="i.slug"
        category="video"
        :i="i"
      />
    </div>

  </div>
</template>
