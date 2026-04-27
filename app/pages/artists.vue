<script setup lang="ts">
import type { Artist, ArtistCategory } from '~/types'

const { data: artistsRaw } = await useArtists()
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))

const filterByCategory = (category: ArtistCategory) =>
  computed(() =>
    [...artists.value]
      .filter(a => Boolean(a.visible) && a.category === category)
      .sort((a, b) => (a.category_id ?? 0) - (b.category_id ?? 0))
  )

const artistsSortedByCategoryIdMusician = filterByCategory('musician')
const artistsSortedByCategoryIdDj = filterByCategory('dj')
const artistsSortedByCategoryIdMastering = filterByCategory('mastering')
const artistsSortedByCategoryIdDesigner = filterByCategory('designer')
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Artists'
const PageDescription = 'Discover Sentimony Records artists: psytrance darkprog and psychill producers, DJs, sound engineers and visual designers. Profiles, releases, links.'
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

    <!-- <h2 class="">Producers & Musicians</h2> -->
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdMusician"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="">Djs</h2>
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdDj"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="">Sound Engineers & Mastering Services</h2>
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdMastering"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="">Visual Artists & Designers</h2>
    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in artistsSortedByCategoryIdDesigner"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

  </div>
</template>
