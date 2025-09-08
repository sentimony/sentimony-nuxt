<script setup lang="ts">
import SidebarMenu from '~/components/SidebarMenu.vue'

const { data: releasesRaw } = await useReleases()
const { data: artistsRaw } = await useArtists()
const { data: videosRaw } = await useVideos()
const { data: playlistsRaw } = await usePlaylists()
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
const route = useRoute()
const isIndex = computed(() => route.path === '/')
const showReleases = computed(() => route.path.startsWith('/release/'))
const showArtists = computed(() => route.path.startsWith('/artist/'))
const showVideos = computed(() => route.path.startsWith('/video'))
const showPlaylists = computed(() => route.path.startsWith('/playlist'))
const activeReleaseSlug = computed(() => showReleases.value ? String(route.params.id || '') : '')
const activeArtistSlug = computed(() => showArtists.value ? String(route.params.id || '') : '')
const activeVideoSlug = computed(() => showVideos.value ? String(route.params.id || '') : '')
const activePlaylistSlug = computed(() => showPlaylists.value ? String(route.params.id || '') : '')
</script>

<template>
  <div class="StickyFooter">
    <div class="StickyFooter__content">
      
      <Fractal />
      <Header />

      <Backdrop />
      <SidebarBtn class="md:hidden" />
      <SidebarMenu />

      <div class="flex flex-col justify-center">
        <Hero class="order-[0]" v-if="isIndex" />
        <Swiper
          class="order-1"
          :class="(showReleases || isIndex) ? '' : 'hidden'"
          title="Releases"
          :list="releasesSortedByDate"
          category="release"
          :centeredSlidesBounds=false
          :centerInsufficientSlides=false
          :activeSlug="activeReleaseSlug"
        />
        <Swiper
          class=""
          :class="[(showArtists || isIndex) ? '' : 'hidden', isIndex ? 'order-3' : 'order-1']"
          title="Artists"
          :list="artistsSortedByCategoryId"
          category="artist"
          :centeredSlidesBounds=false
          :centerInsufficientSlides=false
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
        <div class="order-[2]">
          <slot />
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
</style>
