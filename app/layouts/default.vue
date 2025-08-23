<script setup lang="ts">
const { data: releasesRaw } = await useFetch('https://sentimony-db.firebaseio.com/releases.json', { server: true })
const { data: artistsRaw } = await useFetch('https://sentimony-db.firebaseio.com/artists.json', { server: true })
const { data: videosRaw } = await useFetch('https://sentimony-db.firebaseio.com/videos.json', { server: true })
const { data: playlistsRaw } = await useFetch('https://sentimony-db.firebaseio.com/playlists.json', { server: true })

function toArray<T = any>(raw: any, key?: string): T[] {
  if (!raw) return []
  const data = key && raw[key] != null ? raw[key] : raw
  if (Array.isArray(data)) return data.filter(Boolean)
  if (data && typeof data === 'object') return Object.values(data)
  return []
}

const releases = computed(() => toArray(releasesRaw.value, 'releases'))
const artists = computed(() => toArray(artistsRaw.value, 'artists'))
const videos = computed(() => toArray(videosRaw.value, 'videos'))
const playlists = computed(() => toArray(playlistsRaw.value, 'playlists'))

const releasesSortedByDate = computed(() =>
  [...releases.value].sort((a: any, b: any) =>
    new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
  )
)

const artistsSortedByCategoryId = computed(() =>
  [...artists.value].sort((a: any, b: any) =>
    (a?.category_id ?? 0) - (b?.category_id ?? 0)
  )
)

const videosSortedByDate = computed(() =>
  [...videos.value].sort((a: any, b: any) =>
    new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
  )
)

const playlistsSortedByDate = computed(() =>
  [...playlists.value].sort((a: any, b: any) =>
    new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
  )
)

const isIndex = computed(() => useRoute().path === '/')
const showReleases = computed(() => useRoute().path.startsWith('/release/'))
const showArtists = computed(() => useRoute().path.startsWith('/artist/'))
const showVideos = computed(() => useRoute().path.startsWith('/video/'))
const showPlaylists = computed(() => useRoute().path.startsWith('/playlist/'))

// const visibleReleases = computed(() => showReleases || isIndex)

</script>

<template>
  <div class="StickyFooter font-Montserrat text-center">
    <div class="StickyFooter__content">
      <Fractal />
      <Header />

      <div class="flex flex-col justify-center">
        <Hero class="order-[0]" v-if="isIndex" />
        <!-- v-if="showReleases || isIndex" -->
        <Swiper
          class="transition-opacity ease-in-out duration-250 order-1"
          :class="(showReleases || isIndex) ? 'opacity-100 h-auto' : 'opacity-0 h-0 hidden'"
          title="Releases (Swiper)"
          :list="releasesSortedByDate"
          route="release"
        />
        <!-- v-if="showArtists || isIndex" -->
        <Swiper
          class="transition-opacity ease-in-out duration-250"
          :class="[(showArtists || isIndex) ? 'opacity-100 h-auto' : 'opacity-0 h-0 hidden', isIndex ? 'order-3' : 'order-1']"
          title="Artists (Swiper)"
          :list="artistsSortedByCategoryId"
          route="artist"
        />
        <!-- v-if="showVideos" -->
        <Swiper
          class="transition-opacity ease-in-out duration-250 order-[1]"
          :class="showVideos ? 'opacity-100 h-auto' : 'opacity-0 h-0 hidden'"
          title="Videos (Swiper)"
          :list="videosSortedByDate"
          route="video"
        />
        <!-- v-if="showPlaylists" -->
        <Swiper
          class="transition-opacity ease-in-out duration-250 order-[1]"
          :class="showPlaylists ? 'opacity-100 h-auto' : 'opacity-0 h-0 hidden'"
          title="Playlists (Swiper)"
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
body {
  @apply antialiased text-[12px]/[1.4] md:text-[15px]/[1.5] text-white text-center bg-green-950 bg-[url(https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?01)] bg-center bg-no-repeat bg-cover bg-fixed
}

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
