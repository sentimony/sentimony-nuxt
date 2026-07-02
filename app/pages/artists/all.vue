<script setup lang="ts">
import type { Artist, ArtistCategory } from '~/types'
import { sortArtistsForCatalog } from '~/utils/artists'
import { locationToIso2 } from '~/utils/countryFlag'

const { data: artistsRaw } = await useArtists()
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const sorted = computed(() => sortArtistsForCatalog(artists.value))

const sections: Array<{ label: string; category: ArtistCategory }> = [
  { label: 'Producers & Musicians', category: 'musician' },
  { label: 'DJs', category: 'dj' },
  { label: 'Sound Engineers & Mastering', category: 'mastering' },
  { label: 'Visual Artists & Designers', category: 'designer' },
]

const flagCodes = computed(() =>
  sorted.value.reduce<Record<string, string | null>>((acc, a) => {
    acc[a.slug] = locationToIso2(a.location || '')
    return acc
  }, {})
)

const sectionedArtists = computed(() =>
  sections.map(s => ({
    ...s,
    artists: sorted.value.filter(a => a.category === s.category),
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
      <template v-if="section.artists.length > 0">
        <h2 class="text-lg md:text-xl mt-8 mb-3 text-white/60">{{ section.label }}</h2>
        <ul class="space-y-1">
          <li
            v-for="artist in section.artists"
            :key="artist.slug"
            class="flex items-center gap-3"
          >
            <span
              v-if="flagCodes[artist.slug]"
              :class="`fi fi-${flagCodes[artist.slug]} rounded-sm shrink-0`"
              :title="artist.location || ''"
            />
            <span v-else class="w-[1.33em] shrink-0" />
            <NuxtLink
              :to="'/artist/' + artist.slug"
              class="hover:text-white/80 transition-colors"
            >
              {{ artist.title }}
            </NuxtLink>
            <span
              v-if="artist.location"
              class="text-white/30 text-sm truncate hidden sm:block"
            >
              {{ artist.location }}
            </span>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>
