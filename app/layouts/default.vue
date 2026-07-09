<script setup lang="ts">
import type { Release, Artist, ArtistCategory, Video, Playlist, Event } from '~/types'
import { groupArtistsByCategory, sortArtistsForCatalog } from '~/utils/artists'

const host = useRequestURL().hostname

const route = useRoute()
const isIndex = computed(() => route.path === '/')
const showReleases = computed(() => route.path.startsWith('/release/') || isIndex.value)
const showArtists = computed(() => route.path.startsWith('/artist/') || isIndex.value)
const showVideos = computed(() => route.path.startsWith('/video/'))
const showPlaylists = computed(() => route.path.startsWith('/playlist/'))
const showEvents = computed(() => route.path.startsWith('/event/'))

const { data: releasesRaw } = await useReleases({
  server: showReleases.value,
  lazy: !showReleases.value,
  immediate: showReleases.value,
  watch: [showReleases],
})
const { data: artistsRaw } = await useArtists({
  server: showArtists.value,
  lazy: !showArtists.value,
  immediate: showArtists.value,
  watch: [showArtists],
})
const { data: videosRaw } = await useVideos({
  server: showVideos.value,
  lazy: !showVideos.value,
  immediate: showVideos.value,
  watch: [showVideos],
})
const { data: playlistsRaw } = await usePlaylists({
  server: showPlaylists.value,
  lazy: !showPlaylists.value,
  immediate: showPlaylists.value,
  watch: [showPlaylists],
})
const { data: eventsRaw } = await useEvents({
  server: showEvents.value,
  lazy: !showEvents.value,
  immediate: showEvents.value,
  watch: [showEvents],
})

const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const videos = computed(() => toArray<Video>(videosRaw.value, 'videos'))
const playlists = computed(() => toArray<Playlist>(playlistsRaw.value, 'playlists'))
const events = computed(() => toArray<Event>(eventsRaw.value, 'events'))

const releasesSortedByDate = computed(() =>
  [...releases.value]
    .filter(r => Boolean(r.visible))
    .sort((a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
)
const artistsSortedByCategoryId = computed(() =>
  sortArtistsForCatalog(artists.value)
)
const artistSectionLabels: Record<ArtistCategory, string> = {
  musician: 'Producers',
  dj: 'DJs',
  mastering: 'Mastering',
  designer: 'Designers',
}
const artistSections = computed(() =>
  groupArtistsByCategory(artistsSortedByCategoryId.value).map(group => ({
    label: artistSectionLabels[group.category],
    list: group.list,
  }))
)
const videosSortedByDate = computed(() =>
  [...videos.value]
    .filter(v => Boolean(v.visible))
    .sort((a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
)
const playlistsSortedByDate = computed(() =>
  [...playlists.value]
    .filter(p => Boolean(p.visible))
    .sort((a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
    .reverse()
)
const eventsSortedByDate = computed(() =>
  [...events.value]
    .filter(e => Boolean(e.visible))
    .sort((a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
)
const activeReleaseSlug = computed(() => showReleases.value ? String(route.params.id || '') : '')
const activeArtistSlug = computed(() => showArtists.value ? String(route.params.id || '') : '')
const activeVideoSlug = computed(() => showVideos.value ? String(route.params.id || '') : '')
const activePlaylistSlug = computed(() => showPlaylists.value ? String(route.params.id || '') : '')
const activeEventSlug = computed(() => showEvents.value ? String(route.params.id || '') : '')
</script>

<template>
  <HomepageAtmosphere v-if="isIndex" />
  
  <!-- <Fractal v-if="host == '!localhost'" /> -->
  <Fractal class="z-[1]"/>

  <OpenSidebar />

  <div class="min-h-screen flex flex-col relative z-[2]">
    <div class="flex-1">

      <Header />

      <div class="flex flex-col justify-center">

        <Hero class="order-[0]" v-if="isIndex" />

        <LazySwiper
          v-if="showReleases"
          :activeSlug="activeReleaseSlug"
          class="order-1"
          title="Releases"
          :list="releasesSortedByDate"
          category="release"
          :centeredSlidesBounds="false"
          :centerInsufficientSlides="false"
          :pagination="true"
        />

        <LazySwiper
          v-if="showArtists"
          :activeSlug="activeArtistSlug"
          :class="isIndex ? 'order-3' : 'order-1'"
          title="Artists"
          :sections="artistSections"
          category="artist"
          :centeredSlidesBounds="false"
          :centerInsufficientSlides="false"
          :pagination="false"
        />

        <LazySwiper
          v-if="showVideos"
          :activeSlug="activeVideoSlug"
          class="order-[1]"
          title="Videos"
          :list="videosSortedByDate"
          category="video"
          :centeredSlidesBounds="true"
          :centerInsufficientSlides="true"
          :pagination="false"
        />

        <LazySwiper
          v-if="showPlaylists"
          :activeSlug="activePlaylistSlug"
          class="order-[1]"
          title="Playlists"
          :list="playlistsSortedByDate"
          category="playlist"
          :centeredSlidesBounds="true"
          :centerInsufficientSlides="true"
          :pagination="false"
        />

        <LazySwiper
          v-if="showEvents"
          :activeSlug="activeEventSlug"
          class="order-[1]"
          title="Events"
          :list="eventsSortedByDate"
          category="event"
          :centeredSlidesBounds="true"
          :centerInsufficientSlides="true"
          :pagination="false"
        />

        <div class="order-[2]">
          <slot/>
        </div>

      </div>
    </div>

    <div class="">
      <Testimonials />
      <Footer />
      <AudioBottomPlayer />
    </div>
    
  </div>
</template>
