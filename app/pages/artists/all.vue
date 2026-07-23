<script setup lang="ts">
import type { Artist, ArtistCategory, ArtistsResponse } from '~/types'
import { groupArtistsByCategory, sortArtistsById } from '~/utils/artists'
import { locationToIso2 } from '~/utils/countryFlag'

const { data: artistsRaw } = await useAsyncData<ArtistsResponse>('artists-all', () =>
  $fetch<ArtistsResponse>('/api/artists-all')
)
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const groups = computed(() => groupArtistsByCategory(sortArtistsById(artists.value)))

const { data: trackCountsRaw } = await useAsyncData<Record<string, number>>('artist-track-counts', () =>
  $fetch<Record<string, number>>('/api/artist-track-counts')
)
const trackCounts = computed(() => trackCountsRaw.value ?? {})

const categoryMeta: Record<ArtistCategory, { title: string, icon: string }> = {
  musician: { title: 'Producers & Musicians', icon: 'lucide:keyboard-music' },
  dj: { title: 'DJs', icon: 'lucide:turntable' },
  mastering: { title: 'Sound Engineers & Mastering Services', icon: 'lucide:speaker' },
  designer: { title: 'Visual Artists & Designers', icon: 'lucide:palette' },
}

const flagCodes = computed(() =>
  artists.value.reduce<Record<string, string | null>>((acc, a) => {
    acc[a.slug] = locationToIso2(a.location || '')
    return acc
  }, {})
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
    <div class="my-4 md:my-6">
      <h1 class="text-2xl md:text-4xl text-center">{{ PageTitle }}</h1>
    </div>

    <section
      v-for="group in groups"
      :key="group.category"
      class="pb-7.5 md:pb-15"
    >
      <h2 class="flex items-center justify-center gap-2 text-lg md:text-xl mt-8 mb-3 text-white/60">
        <Icon :name="categoryMeta[group.category].icon" />{{ categoryMeta[group.category].title }}
      </h2>

      <div class="flex flex-wrap justify-center w-full">
        <template
          v-for="(artist, index) in group.list"
          :key="artist.slug"
        ><NuxtLink
            :to="'/artist/' + artist.slug"
            class="inline-flex items-center gap-1 align-middle hover:text-white/80 transition-colors"
          ><Icon
              v-if="flagCodes[artist.slug] === 'ru'"
              name="lucide:flag-off"
              class="shrink-0 w-4 h-4"
              :title="artist.location || ''"
            /><span
              v-else-if="flagCodes[artist.slug]"
              :class="`fi fi-${flagCodes[artist.slug]} rounded-sm shrink-0`"
              style="height:16px;line-height:16px;width:21.33px"
              :title="artist.location || ''"
            /><span>{{ artist.title }}</span><span
              v-if="group.category === 'musician' && trackCounts[artist.slug]"
              class="font-mono opacity-60"
            >({{ trackCounts[artist.slug] }})</span></NuxtLink><template v-if="index < group.list.length - 1">,&nbsp;</template></template>
      </div>
    </section>
  </div>
</template>

<style>
@import 'flag-icons/css/flag-icons.min.css';
</style>
