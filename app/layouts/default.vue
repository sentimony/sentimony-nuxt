<script setup lang="ts">
const { data: releasesRaw } = await useFetch('https://sentimony-db.firebaseio.com/releases.json', { server: true })
const { data: artistsRaw } = await useFetch('https://sentimony-db.firebaseio.com/artists.json', { server: true })
const { data: videosRaw } = await useFetch('https://sentimony-db.firebaseio.com/videos.json', { server: true })
const { data: playlistsRaw } = await useFetch('https://sentimony-db.firebaseio.com/playlists.json', { server: true })
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
)
const isIndex = computed(() => useRoute().path === '/')
const showReleases = computed(() => useRoute().path.startsWith('/release/'))
const showArtists = computed(() => useRoute().path.startsWith('/artist/'))
const showVideos = computed(() => useRoute().path.startsWith('/video/'))
const showPlaylists = computed(() => useRoute().path.startsWith('/playlist/'))
</script>

<template>
  <div class="StickyFooter">
    <div class="StickyFooter__content">
      <Fractal />
      <Header />
      <div class="flex flex-col justify-center">
        <Hero class="order-[0]" v-if="isIndex" />
        <Swiper
          class="transition-opacity ease-in-out duration-250 order-1"
          :class="(showReleases || isIndex) ? 'opacity-100]' : 'opacity-0 hidden'"
          title="Releases"
          :list="releasesSortedByDate"
          route="release"
        />
        <Swiper
          class="transition-opacity ease-in-out duration-250"
          :class="[(showArtists || isIndex) ? 'opacity-100]' : 'opacity-0 hidden', isIndex ? 'order-3' : 'order-1']"
          title="Artists"
          :list="artistsSortedByCategoryId"
          route="artist"
        />
        <Swiper
          class="transition-opacity ease-in-out duration-250 order-[1]"
          :class="showVideos ? 'opacity-100]' : 'opacity-0 hidden'"
          title="Videos"
          :list="videosSortedByDate"
          route="video"
        />
        <Swiper
          class="transition-opacity ease-in-out duration-250 order-[1]"
          :class="showPlaylists ? 'opacity-100]' : 'opacity-0 hidden'"
          title="Playlists"
          :list="playlistsSortedByDate"
          route="playlist"
        />
        <div class="order-[2]">
          <slot />
        </div>
      </div>
    </div>
    <div class="StickyFooter__footer">
      <CallToAction />
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
