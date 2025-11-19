<script setup lang="ts">
import { computed } from 'vue'
import { toArray } from '~/composables/toArray'

definePageMeta({
  layout: 'default',
})
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Tracks'
const PageDescription = 'Explore Sentimony Records tracks across dark progressive psytrance and psychill. Discover catalog highlights, follow new music and dive into our sound.'
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

// Fetch releases and compute counts
const { data: releasesRaw } = await useReleases({ server: true })
const releasesArr = computed(() => toArray<any>(releasesRaw.value, 'releases'))
const releasedReleases = computed(() =>
  releasesArr.value.filter((r: any) => Boolean(r?.visible) && !Boolean(r?.coming_soon))
)
const sortByDate = computed(() =>
  [...releasedReleases.value]
    .filter((release: any) => Array.isArray(release?.tracklistCompact) && release.tracklistCompact.length > 0)
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)
const releases = computed(() => releasedReleases.value.length)
const tracks = computed(() =>
  releasedReleases.value.reduce((sum: number, r: any) => sum + (Number(r?.tracks_number) || 0), 0)
)

// Fetch artists and compute count of visible ones
const { data: artistsRaw } = await useArtists({ server: true })
const artistsArr = computed(() => toArray<any>(artistsRaw.value, 'artists'))
const artists = computed(() => artistsArr.value.filter((a: any) => Boolean(a?.visible)).length)

// Fetch videos, playlists, events, friends and compute visible counts
const { data: videosRaw } = await useVideos({ server: true })
const videosArr = computed(() => toArray<any>(videosRaw.value, 'videos'))
const videos = computed(() => videosArr.value.filter((v: any) => Boolean(v?.visible)).length)

const { data: playlistsRaw } = await usePlaylists({ server: true })
const playlistsArr = computed(() => toArray<any>(playlistsRaw.value, 'playlists'))
const playlists = computed(() => playlistsArr.value.filter((p: any) => Boolean(p?.visible)).length)

const { data: eventsRaw } = await useEvents({ server: true })
const eventsArr = computed(() => toArray<any>(eventsRaw.value, 'events'))
const events = computed(() => eventsArr.value.filter((e: any) => Boolean(e?.visible)).length)

const { data: friendsRaw } = await useFriends({ server: true })
const friendsArr = computed(() => toArray<any>(friendsRaw.value, 'friends'))
const friends = computed(() => friendsArr.value.filter((f: any) => Boolean(f?.visible)).length)
</script>

<template>
  <div class="container max-w-4xl ">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class="flex justify-between my-12">
      <div class="">Releases<br>{{ releases }}</div>
      <div class="">Tracks<br>{{ tracks }}</div>
      <div class="">Artists<br>{{ artists }}</div>
      <div class="">Videos<br>{{ videos }}</div>
      <div class="">Playlists<br>{{ playlists }}</div>
      <div class="">Events<br>{{ events }}</div>
      <div class="">Friends<br>{{ friends }}</div>
    </div>

    <div class=" text-left pb-[30px] md:pb-[60px]">
      <div class="max-w-[640px] mx-auto">

        <hr class="my-4 border-white/30">
        <p><small><b>Releases / Tracks:</b></small></p>

        <ol class="list-decimal ps-9">
          <div
            v-for="(i, index) in sortByDate"
            :key="i.slug || index"
            class="mb-4"
          >
            <RelativeItem
              :i="i"
              category="release"
              class="mb-2"
            />

            <div v-if="i.tracklistCompact"
              class="Tracklist"
            >
              <li
                v-for="(iii, index) in i.tracklistCompact"
                :key="'b' + index"
                v-if="i.tracklistCompact"
                v-html="iii.p"
              />
            </div>
          </div>
        </ol>
      </div>
    </div>

  </div>
</template>
