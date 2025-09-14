<script setup lang="ts">
import { computed } from 'vue'
import { toArray } from '~/composables/toArray'

definePageMeta({
  layout: 'empty',
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
  <div class="max-w-xs flex flex-col justify-center h-[100vh] mx-auto px-2">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div class="mb-6">Releases<br>{{ releases }}</div>
      <div class="mb-6">Tracks<br>{{ tracks }}</div>
      <div class="mb-6">Artists<br>{{ artists }}</div>
      <div class="mb-6">Videos<br>{{ videos }}</div>
      <div class="mb-6">Playlists<br>{{ playlists }}</div>
      <div class="mb-6">Events<br>{{ events }}</div>
      <div class="mb-6">Friends<br>{{ friends }}</div>
    </div>
    <p class="mb-6">Tracks page is coming soon</p>
    <div>
      <BtnPrimary
        url="/"
        title="Go Home"
        icon="fa7-solid:home"
      />
    </div>

  </div>
</template>

<style lang="scss"></style>
