<script setup lang="ts">
import type { Artist, ArtistCategory } from '~/types'
import { sortArtistsForCatalog } from '~/utils/artists'

const { data: artistsRaw } = await useArtists()
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const artistsSortedForCatalog = computed(() => sortArtistsForCatalog(artists.value))

const filterByCategory = (category: ArtistCategory) =>
  computed(() =>
    artistsSortedForCatalog.value.filter(a => a.category === category)
  )

const artistsSortedByCategoryIdMusician = filterByCategory('musician')
const artistsSortedByCategoryIdDj = filterByCategory('dj')
const artistsSortedByCategoryIdDesigner = filterByCategory('designer')
const artistsSortedByCategoryIdMastering = filterByCategory('mastering')
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
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

    <h2 class="text-lg md:text-xl mt-8 mb-3 text-white/60">Producers & Musicians</h2>
    <div class="flex flex-wrap justify-center w-full pb-7.5 md:pb-15">
      <Item
        v-for="i in artistsSortedByCategoryIdMusician"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="text-lg md:text-xl mt-8 mb-3 text-white/60">DJs</h2>
    <div class="flex flex-wrap justify-center w-full pb-7.5 md:pb-15">
      <Item
        v-for="i in artistsSortedByCategoryIdDj"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="text-lg md:text-xl mt-8 mb-3 text-white/60">Sound Engineers & Mastering Services</h2>
    <div class="flex flex-wrap justify-center w-full pb-7.5 md:pb-15">
      <Item
        v-for="i in artistsSortedByCategoryIdMastering"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <h2 class="text-lg md:text-xl mt-8 mb-3 text-white/60">Visual Artists & Designers</h2>
    <div class="flex flex-wrap justify-center w-full pb-7.5 md:pb-15">
      <Item
        v-for="i in artistsSortedByCategoryIdDesigner"
        :key="i.slug"
        category="artist"
        :i="i"
      />
    </div>

    <div class="flex justify-center pb-7.5 md:pb-15">
      <Button as-child variant="link" class="text-white/50 hover:text-white/80">
        <NuxtLink to="/artists/all">
          All Artists
        </NuxtLink>
      </Button>
    </div>

  </div>
</template>
