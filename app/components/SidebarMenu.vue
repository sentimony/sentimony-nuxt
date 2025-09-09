<script setup lang="ts">
const mobmenu = useMobmenuStore()
const route = useRoute()

const nav = [
  { title: 'Home', route: '/' },
  // { title: 'News', route: '/news/' },
  { title: 'Releases', route: '/releases/' },
  { title: 'Artists', route: '/artists/' },
  { title: 'Videos', route: '/videos/' },
  { title: 'Playlists', route: '/playlists/' },
  // { title: 'Events', route: '/events/' },
  // { title: 'Friends', route: '/friends/' },
  { title: 'Contacts', route: '/contacts/' },
  // { title: 'Tracks', route: '/tracks/' },
  // { title: 'Sitemap', route: '/sitemap/' },
  // { title: '404', route: '/404/' },
  // { title: 'ddos', route: '/ddos/' },
]

const activeMatchers: Record<string, string[]> = {
  '/releases/': ['/releases/', '/release/'],
  '/artists/': ['/artists/', '/artist/'],
  '/videos/': ['/videos/', '/video/'],
  '/playlists/': ['/playlists/', '/playlist/'],
  '/events/': ['/events/', '/event/'],
}

function isNavActive(link: string) {
  if (link === '/') return route.path === '/'
  const matchers = activeMatchers[link] || [link]
  return matchers.some((p) => route.path.startsWith(p))
}
</script>

<template>
  <!-- <div class=""> -->

    <!-- <div
      class="fixed left-full top-0 w-screen h-screen z-30 bg-black/30 backdrop-blur-sm"
      :class="mobmenu.sidebarOpen ? '-translate-x-full' : ''"
      @click="mobmenu.toggleSidebar"
      v-wave
    /> -->

    <div
      class="flex flex-col fixed left-full w-[280px] h-screen top-0 z-40 bg-black/60 transition-transform duration-300 ease-in-out"
      :class="mobmenu.sidebarOpen ? '-translate-x-full' : ''"
      @click="mobmenu.toggleSidebar"
    >
      <NuxtLink
        v-for="(i, index) in nav"
        :key="index"
        :to="i.route"
        class="flex items-center justify-center h-[42px] hover:bg-white/15 transition-background duration-300 ease-in-out"
        :class="isNavActive(i.route) ? 'bg-white/10' : ''"
        v-wave
      >
        {{ i.title }}
      </NuxtLink>

      <!-- <hr class="border-white/30" /> -->

      <!-- <HeaderSocialMenu style="display: flex; justify-content: center;" /> -->
    </div>

  <!-- </div> -->
</template>

<style lang="scss"></style>
