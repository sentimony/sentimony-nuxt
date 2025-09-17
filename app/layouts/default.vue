<script setup lang="ts">
const host = useRequestURL().hostname
// import SidebarMenu from '~/components/SidebarMenu.vue'

const route = useRoute()
const isIndex = computed(() => route.path === '/')
const showReleases = computed(() => route.path.startsWith('/release/') || isIndex.value)
const showArtists = computed(() => route.path.startsWith('/artist/') || isIndex.value)
const showVideos = computed(() => route.path.startsWith('/video/'))
const showPlaylists = computed(() => route.path.startsWith('/playlist/'))

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
const releases = computed(() => toArray(releasesRaw.value, 'releases'))
const artists = computed(() => toArray(artistsRaw.value, 'artists'))
const videos = computed(() => toArray(videosRaw.value, 'videos'))
const playlists = computed(() => toArray(playlistsRaw.value, 'playlists'))
const releasesSortedByDate = computed(() =>
  [...releases.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)
const artistsSortedByCategoryId = computed(() =>
  [...artists.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      (a?.category_id ?? 0) - (b?.category_id ?? 0)
    )
)
const videosSortedByDate = computed(() =>
  [...videos.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)
const playlistsSortedByDate = computed(() =>
  [...playlists.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
    .reverse()
)
const activeReleaseSlug = computed(() => showReleases.value ? String(route.params.id || '') : '')
const activeArtistSlug = computed(() => showArtists.value ? String(route.params.id || '') : '')
const activeVideoSlug = computed(() => showVideos.value ? String(route.params.id || '') : '')
const activePlaylistSlug = computed(() => showPlaylists.value ? String(route.params.id || '') : '')
</script>

<template>
  <!-- <Fractal v-if="host == '!localhost'" /> -->
  <Fractal />
  <div class="StickyFooter">
    <div class="StickyFooter__content">

      <Header />

      <OpenSidebar class="md:hidden" />

      <div class="flex flex-col justify-center">

        <!-- <Transition name="widget" mode="in-out"> -->
          <Hero class="order-[0]" v-if="isIndex" />
        <!-- </Transition> -->

        <Swiper
          class="order-1"
          :class="[showReleases ? '' : 'hidden']"
          title="Releases"
          :list="releasesSortedByDate"
          category="release"
          :centeredSlidesBounds="false"
          :centerInsufficientSlides="false"
          :activeSlug="activeReleaseSlug"
        />

        <Swiper
          class=""
          :class="[showArtists ? '' : 'hidden', isIndex ? 'order-3' : 'order-1']"
          title="Artists"
          :list="artistsSortedByCategoryId"
          category="artist"
          :centeredSlidesBounds="false"
          :centerInsufficientSlides="false"
          :activeSlug="activeArtistSlug"
        />

        <Swiper
          class="order-[1]"
          :class="showVideos ? '' : 'hidden'"
          title="Videos"
          :list="videosSortedByDate"
          category="video"
          :centeredSlidesBounds=true
          :centerInsufficientSlides=true
          :activeSlug="activeVideoSlug"
        />

        <!-- <Transition name="widget" mode="in-out"> -->
          <Swiper
            class="order-[1]"
            :class="showPlaylists ? '' : 'hidden'"
            title="Playlists"
            :list="playlistsSortedByDate"
            category="playlist"
            :centeredSlidesBounds=true
            :centerInsufficientSlides=true
            :activeSlug="activePlaylistSlug"
          />
        <!-- </Transition> -->

        <div class="order-[2]">
          <!-- <Transition name="page" mode="in-out"> -->
            <slot />
          <!-- </Transition> -->
        </div>
      </div>

    </div>
    <div class="StickyFooter__footer">
      <Testimonials />
      <Footer />
    </div>
  </div>
</template>

<style lang="scss">
html,
body,
#__nuxt,
#__layout {
  height: 100%;
}

.StickyFooter {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  &__content {
    flex: 1;
  }

  &__footer {
    display: block;
  }
}

// .fade-enter-active { transition: opacity 0.4s ease 0.4s; }
// .fade-enter-from { opacity: 0; }
// .fade-enter-to { opacity: 1; }
// .fade-leave-active { transition: opacity 0.4s ease; }
// .fade-leave-to { opacity: 0; }

// .page-enter-active {
//   transition: all 0.4s ease 0.4s;
// }
// .page-enter-from {
//   opacity: 0;
//   filter: blur(1rem);
// }
// .page-leave-active {
//   transition: all 0.4s ease 0.0s;
// }
// .page-leave-to {
//   opacity: 0;
//   filter: blur(1rem);
// }

// .widget-enter-active {
//   transition: all 0.4s ease 0.4s;
// }
// .widget-enter-from {
//   opacity: 0;
//   filter: blur(1rem);
// }
// .widget-leave-active {
//   transition: all 0.4s ease 0.0s;
// }
// .widget-leave-to {
//   opacity: 0;
//   filter: blur(1rem);
// }
</style>
