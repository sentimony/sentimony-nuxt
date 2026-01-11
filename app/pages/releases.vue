<script setup lang="ts">
import type { Release } from '~/types'

const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const releasesSortedByDate = computed(() =>
  [...releases.value]
    .filter(r => Boolean(r.visible))
    .sort((a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
)
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Releases'
const PageDescription = 'Sentimony Records releases: latest dark progressive psytrance and psychill albums, EPs and compilations with streaming and download links.'
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
        v-for="i in releasesSortedByDate"
        :key="i.slug"
        category="release"
        :i="i"
      />
    </div>

  </div>
</template>
