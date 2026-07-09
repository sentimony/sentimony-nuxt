<script setup lang="ts">
import type { Artist, ArtistCategory, ArtistsResponse } from '~/types'
import { groupArtistsByCategory, sortArtistsByCategory } from '~/utils/artists'
import { locationToIso2 } from '~/utils/countryFlag'

const { data: artistsRaw } = await useAsyncData<ArtistsResponse>('artists-all', () =>
  $fetch<ArtistsResponse>('/api/artists-all')
)
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const sorted = computed(() => sortArtistsByCategory(artists.value))

const sectionLabels: Record<ArtistCategory, string> = {
  musician: 'Producers & Musicians',
  dj: 'DJs',
  mastering: 'Sound Engineers & Mastering',
  designer: 'Visual Artists & Designers',
}

const flagCodes = computed(() =>
  sorted.value.reduce<Record<string, string | null>>((acc, a) => {
    acc[a.slug] = locationToIso2(a.location || '')
    return acc
  }, {})
)

const sectionedArtists = computed(() =>
  groupArtistsByCategory(sorted.value).map(group => ({
    ...group,
    label: sectionLabels[group.category],
  }))
)

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'All Artists'
const PageDescription = 'Complete list of all Sentimony Records artists: producers, DJs, sound engineers and visual designers from around the world.'
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
  twitterCard: 'summary',
})
</script>

<template>
  <div class="container max-w-4xl">
    <div class="flex items-baseline gap-4 my-4 md:my-6">
      <h1 class="text-2xl md:text-4xl">{{ PageTitle }}</h1>
      <NuxtLink
        to="/artists"
        class="text-sm text-white/50 hover:text-white/80 underline underline-offset-2"
      >
        ← Card view
      </NuxtLink>
    </div>

    <template v-for="section in sectionedArtists" :key="section.category">
      <h2 class="text-lg md:text-xl mt-8 mb-3 text-white/60">{{ section.label }}</h2>
      <p class="leading-relaxed">
        <template
          v-for="(artist, index) in section.list"
          :key="artist.slug"
        ><span
            v-if="flagCodes[artist.slug]"
            :class="`fi fi-${flagCodes[artist.slug]} rounded-sm mr-1 align-baseline`"
            :title="artist.location || ''"
          /><NuxtLink
            :to="'/artist/' + artist.slug"
            class="hover:text-white/80 transition-colors"
          >{{ artist.title }}</NuxtLink><span v-if="index < section.list.length - 1">, </span></template>
      </p>
    </template>
  </div>
</template>
