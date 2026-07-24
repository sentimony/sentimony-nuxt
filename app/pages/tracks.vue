<script setup lang="ts">
import { computed } from 'vue'
import { toArray } from '~/composables/toArray'
import { sortByDate } from '~/composables/sortByDate'
import type { Artist, Event, Friend, Playlist, Release, Video } from '~/types'

definePageMeta({
  layout: 'default',
})
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
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

type TrackListItem = {
  slug: string
  title: string
  release_slug: string
  artist_slug: string
  artist_name: string
  track_number: number
  bpm: number | null
  audio_url: string | null
}

const { data: releasesRaw } = await useReleases({ server: true })
const { data: allTracks } = await useFetch<TrackListItem[]>('/api/tracks')
const releasesArr = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const releasedReleases = computed(() =>
  releasesArr.value.filter(r => Boolean(r?.visible) && !r?.coming_soon)
)
const tracksByRelease = computed(() => {
  const map = new Map<string, TrackListItem[]>()
  for (const track of allTracks.value ?? []) {
    const list = map.get(track.release_slug)
    if (list) list.push(track)
    else map.set(track.release_slug, [track])
  }
  return map
})
const releasesWithTracks = computed(() =>
  sortByDate(
    releasedReleases.value.filter(release => tracksByRelease.value.has(release?.slug))
  )
)
const releases = computed(() => releasedReleases.value.length)
const tracks = computed(() => allTracks.value?.length ?? 0)

const { data: artistsRaw } = await useArtists({ server: true })
const artistsArr = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const artists = computed(() => artistsArr.value.filter(a => Boolean(a?.visible)).length)

const { data: videosRaw } = await useVideos({ server: true })
const videosArr = computed(() => toArray<Video>(videosRaw.value, 'videos'))
const videos = computed(() => videosArr.value.filter(v => Boolean(v?.visible)).length)

const { data: playlistsRaw } = await usePlaylists({ server: true })
const playlistsArr = computed(() => toArray<Playlist>(playlistsRaw.value, 'playlists'))
const playlists = computed(() => playlistsArr.value.filter(p => Boolean(p?.visible)).length)

const { data: eventsRaw } = await useEvents({ server: true })
const eventsArr = computed(() => toArray<Event>(eventsRaw.value, 'events'))
const events = computed(() => eventsArr.value.filter(e => Boolean(e?.visible)).length)

const { data: friendsRaw } = await useFriends({ server: true })
const friendsArr = computed(() => toArray<Friend>(friendsRaw.value, 'friends'))
const friends = computed(() => friendsArr.value.filter(f => Boolean(f?.visible)).length)

const stats = computed(() => [
  { label: 'Tracks', value: tracks.value },
  { label: 'Releases', value: releases.value },
  { label: 'Artists', value: artists.value },
  { label: 'Playlists', value: playlists.value },
  { label: 'Videos', value: videos.value },
  { label: 'Events', value: events.value },
])
</script>

<template>
  <div class="container max-w-4xl">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 my-8 md:my-10">
      <div
        v-for="s in stats"
        :key="s.label"
        class="text-center rounded-md border border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.03] py-3"
      >
        <div class="font-mono text-xl md:text-2xl">{{ s.value }}</div>
        <div class="text-[11px] uppercase tracking-wide text-foreground/50">{{ s.label }}</div>
      </div>
    </div>

    <div class="text-left pb-7.5 md:pb-15">
      <div class="max-w-[640px] mx-auto">

        <hr class="my-4 border-black/30 dark:border-white/30">
        <p><small><b>Releases / Tracks:</b></small></p>

        <div
          v-for="(i, index) in releasesWithTracks"
          :key="i.slug || index"
          class="mb-5"
        >
          <RelativeItem
            :i="i"
            category="release"
          />

          <div class="Tracklist mt-1">
            <p
              v-for="t in tracksByRelease.get(i.slug)"
              :key="t.slug"
            >
              <small class="font-mono inline-flex w-6 justify-end">{{ Number(t.track_number) }}</small><small class="font-mono">.</small>
              <TrackArtists :name="t.artist_name" :slug="t.artist_slug" />
              -
              <NuxtLink :to="`/track/${t.slug}`" class="hover:underline">{{ t.title }}</NuxtLink>
              <small v-if="t.bpm" class="font-mono"> ({{ t.bpm }}bpm)</small>
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
