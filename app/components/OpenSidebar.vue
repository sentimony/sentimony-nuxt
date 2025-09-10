<script setup lang="ts">
import { ref, watch } from 'vue'
const route = useRoute()

const isOpen = ref(false)
const toggleSidebar = () => { isOpen.value = !isOpen.value }
const closeSidebar = () => { isOpen.value = false }

// Close sidebar on route change
watch(() => route.path, () => { isOpen.value = false })

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
  <div>

    <div
      class="fixed left-full top-0 w-screen h-screen z-30 bg-black/30 backdrop-blur-sm"
      :class="isOpen ? '-translate-x-full' : ''"
      @click="toggleSidebar"
    />

    <div
      class="fixed top-0 right-0 mr-2 mt-[9px] z-50 flex items-center justify-center transition ease-in-out duration-300 cursor-pointer rounded-[2px] hover:bg-white/30 size-[56px]"
      :class="isOpen ? 'bg-white/20 rotate-[360deg]' : ''"
      @click="toggleSidebar"
      v-wave
    >
      <Icon
        name="fa7-solid:navicon"
        size="22"
        :class="isOpen ? 'hidden' : ''"

      />
      <Icon
        name="fa7-solid:close"
        size="22"
        :class="isOpen ? '' : 'hidden'"
      />
    </div>

    <div
      class="fixed left-full w-[280px] h-screen top-0 z-40 transition-transform duration-300 ease-in-out flex flex-col bg-black/60"
      :class="isOpen ? '-translate-x-full' : ''"
      @click="toggleSidebar"
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

  </div>
</template>

<style lang="scss"></style>
