<script setup lang="ts">
const route = useRoute()

const nav = [
  // { title: 'Home', route: '/' },
  // { title: 'News', route: '/news/' },
  { title: 'Releases', route: '/releases/' },
  { title: 'Artists', route: '/artists/' },
  { title: 'Videos', route: '/videos/' },
  { title: 'Playlists', route: '/playlists/' },
  // { title: 'Events', route: '/events/' },
  // { title: 'Friends', route: '/friends/' },
  // { title: 'Contacts', route: '/contacts/' },
  // { title: 'Tracks', route: '/tracks/' },
  // { title: 'Sitemap', route: '/sitemap/' },
  // { title: '404', route: '/404/' },
  // { title: 'ddos', route: '/ddos/' },
]

const soc = [
  { title: "Bandcamp", icon: "bandcamp", name: "cib:bandcamp", url: "https://sentimony.bandcamp.com/follow_me" },
  { title: "Facebook", icon: "facebook", name: "fa7-brands:facebook", url: "https://www.facebook.com/sentimony.records" },
  { title: "SoundCloud", icon: "soundcloud", name: "fa7-brands:soundcloud", url: "https://soundcloud.com/sentimony" },
  { title: "YouTube", icon: "youtube", name: "fa:youtube", url: "https://www.youtube.com/@SentimonyRecords?sub_confirmation=1" },
  // { title: "Instagram", icon: "instagram", url: "https://www.instagram.com/sentimony.records" },
  // { title: "Patreon", icon: "patreon", url: "https://www.patreon.com/sentimony" },
  // { title: "TikTok", icon: "tiktok", url: "https://www.tiktok.com/@sentimony" },
  // { title: "Beatport", icon: "beatport", url: "https://www.beatport.com/label/sentimony-records/66490" },
  // { title: "JunoDownload", icon: "junodownload", url: "https://www.junodownload.com/labels/Sentimony/" },
  // { title: "Twitter", icon: "twitter", url: "https://twitter.com/sentimony" },
  // { title: "Mixcloud", icon: "mixcloud", url: "https://www.mixcloud.com/sentimony" },
  // { title: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/company/3256285" },
  // { title: "VKontakte", icon: "vkontakte", url: "https://vk.com/club1342946" },
  // { title: "Discogs", icon: "discogs", url: "https://www.discogs.com/label/82598-Sentimony-Records?sort=year&sort_order=desc&layout=big&&limit=100" },
  // { title: "AppleMusic", icon: "apple-music-2", url: "https://itunes.apple.com/profile/sentimony" },
  // { title: "Spotify", icon: "spotify", url: "https://open.spotify.com/user/4arwh3vuu5g9w1gqm89o09td7" },
  // { title: "Deezer", icon: "deezer", url: "https://www.deezer.com/us/profile/2697545682"  }
]

const activeMatchers: Record<string, string[]> = {
  '/releases/': ['/releases/', '/release/'],
  '/artists/': ['/artists/', '/artist/'],
  '/videos/': ['/videos/', '/video/'],
  '/playlists/': ['/playlists/', '/playlist/']
}

function isNavActive(link: string) {
  const matchers = activeMatchers[link] || [link]
  return matchers.some((p) => route.path.startsWith(p))
}
</script>

<template>
  <div class="sticky top-0 left-0 w-full z-50">
  <div class="px-2">
    <div class="container">
      <div class="flex justify-between items-center h-[75px] border-b border-white/30 backdrop-blur-sm">

        <NuxtLink
          to="/"
          class="w-[230px] transition-[background-color] ease-in-out duration-300 hover:bg-white/30 h-[56px] flex items-center justify-center rounded-[2px]"
          active-class="bg-white/20"
          v-wave
        >
          <img 
            src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.1.svg?01" 
            alt="Sentimony Records Logo SVG"
            class="w-[40px] mr-3"
          />
          <div class="text-left leading-[1.5] pr-1">
            <div class="text-[16px]">Sentimony Records</div>
            <div class="opacity-[0.4] text-[12px] tracking-[0.4px]">Psychedelic Music Label</div>
          </div>
        </NuxtLink>

        <div class="hidden md:flex">
          <NuxtLink
            v-for="i in nav"
            :to="i.route"
            class="transition-[background-color] ease-in-out duration-300 text-[16px] hover:bg-white/30 md:px-3 lg:w-[110px] h-[56px] flex items-center justify-center rounded-[2px]"
            :class="isNavActive(i.route) ? 'bg-white/20' : ''"
            v-wave
          >
            <span>{{ i.title }}</span>
          </NuxtLink>
        </div>

        <div class="hidden md:flex justify-between">
          <a
            v-for="i in soc"
            :href="i.url"
            class="transition-colors ease-in-out duration-300 text-white/[.5] hover:text-white/[1] hover:bg-white/30 md:w-[40px] lg:w-[56px] h-[56px] flex items-center justify-center rounded-[2px] group"
            target="_blank" rel="noopener"
            v-wave
          >
            <!-- <img
              :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg?01'" 
              class="icon transition-[opacity] ease-in-out duration-300 w-[24px] opacity-[.5] group-hover:opacity-[1]"
              :alt="i.title + ' Icon'"
            /> -->
            <Icon :name="i.name" size="22" />
            <!-- <div>{{ i.title }}</div> -->
          </a>
        </div>
        
        <!-- <SidebarBtn /> -->

      </div>
    </div>
  </div>
  </div>
</template>

<style lang="scss"></style>
