<script setup lang="ts">
import type { Release, ReleasesResponse } from '~/types'

const { data: releasesRaw } = await useAsyncData<ReleasesResponse>('releases-all', () =>
  $fetch<ReleasesResponse>('/api/releases-all')
)
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const releasesSortedByDate = computed(() => sortByDate(releases.value))
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'All Releases'
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

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">All Releases</h1>

    <GenreTabs />

    <div class="flex flex-wrap justify-center w-full pb-7.5 md:pb-15">
      <Item
        v-for="i in releasesSortedByDate"
        :key="i.slug"
        category="release"
        :i="i"
      />
    </div>

  </div>
</template>
