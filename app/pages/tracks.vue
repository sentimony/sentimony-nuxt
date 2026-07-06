<script setup lang="ts">
import { computed } from 'vue'
import { toArray } from '~/composables/toArray'
import { sortByDate } from '~/composables/sortByDate'

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
const releasesArr = computed(() => toArray<any>(releasesRaw.value, 'releases'))
const releasedReleases = computed(() =>
  releasesArr.value.filter((r: any) => Boolean(r?.visible) && !Boolean(r?.coming_soon))
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
    releasedReleases.value.filter((release: any) => tracksByRelease.value.has(release?.slug))
  )
)
const releases = computed(() => releasedReleases.value.length)
const tracks = computed(() => allTracks.value?.length ?? 0)

const { data: artistsRaw } = await useArtists({ server: true })
const artistsArr = computed(() => toArray<any>(artistsRaw.value, 'artists'))
const artists = computed(() => artistsArr.value.filter((a: any) => Boolean(a?.visible)).length)

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
      <div class="">Tracks<br>{{ tracks }}</div>
      <div class="">Releases<br>{{ releases }}</div>
      <div class="">Artists<br>{{ artists }}</div>
      <div class="">Playlists<br>{{ playlists }}</div>
      <div class="">Videos<br>{{ videos }}</div>
      <div class="">Events<br>{{ events }}</div>
      <!-- <div class="">Friends<br>{{ friends }}</div> -->
    </div>

    <div class=" text-left pb-[30px] md:pb-[60px]">
      <div class="max-w-[640px] mx-auto">

        <hr class="my-4 border-white/30">
        <p><small><b>Releases / Tracks:</b></small></p>

        <ol class="list-decimal ps-9">
          <div
            v-for="(i, index) in releasesWithTracks"
            :key="i.slug || index"
            class="mb-4"
          >
            <RelativeItem
              :i="i"
              category="release"
              class="mb-2"
            />

            <div class="Tracklist">
              <li
                v-for="t in tracksByRelease.get(i.slug)"
                :key="t.slug"
              >
                <small class="font-mono">{{ String(t.track_number).padStart(2, '0') }}.</small>
                <b>{{ t.artist_name }}</b>
                -
                <NuxtLink :to="`/track/${t.slug}`" class="hover:underline">{{ t.title }}</NuxtLink>
                <small v-if="t.bpm" class="font-mono"> ({{ t.bpm }}bpm)</small>
                <a
                  v-if="t.audio_url"
                  :href="t.audio_url"
                  target="_blank"
                  rel="noopener"
                  class="ms-1 text-foreground/40 hover:text-foreground/70"
                >
                  <Icon name="lucide:play" mode="svg" class="inline size-3.5 align-middle" />
                </a>
              </li>
            </div>
          </div>
        </ol>
      </div>
    </div>

  </div>
</template>
