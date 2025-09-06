<script setup lang="ts">
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

const soc = [
  { title: "AppleMusic", name: "fa-brands:apple", url: "https://itunes.apple.com/profile/sentimony" },
  { title: "Bandcamp", name: "cib:bandcamp", url: "https://sentimony.bandcamp.com/follow_me" },
  { title: "Beatport", name: "simple-icons:beatport", url: "https://www.beatport.com/label/sentimony-records/66490" },
  { title: "Deezer", name: "fa-brands:deezer", url: "https://www.deezer.com/us/profile/2697545682"  },
  { title: "Discogs", name: "simple-icons:discogs", url: "https://www.discogs.com/label/82598-Sentimony-Records?sort=year&sort_order=desc&layout=big&&limit=100" },
  { title: "Facebook", name: "fa-brands:facebook", url: "https://www.facebook.com/sentimony.records" },
  { title: "Instagram", name: "fa-brands:instagram", url: "https://www.instagram.com/sentimony.records" },
  { title: "JunoDownload", icon: "junodownload", url: "https://www.junodownload.com/labels/Sentimony/" },
  { title: "Mixcloud", name: "fa-brands:mixcloud", url: "https://www.mixcloud.com/sentimony" },
  { title: "Patreon", name: "fa-brands:patreon", url: "https://www.patreon.com/sentimony" },
  { title: "SoundCloud", name: "fa-brands:soundcloud", url: "https://soundcloud.com/sentimony" },
  { title: "Spotify", name: "fa-brands:spotify", url: "https://open.spotify.com/user/4arwh3vuu5g9w1gqm89o09td7" },
  // { title: "Tumblr", name: "fa7-brands:tumblr", url: "https://sentimony.tumblr.com" },
  // { title: "Giphy", name: "pixel:giphy", url: "https://giphy.com/channel/sentimony" },
  // { title: "LinkedIn", name: "fa-brands:linkedin-in", url: "https://www.linkedin.com/company/3256285" },
  // { title: "VKontakte", name: "fa-brands:vk", url: "https://vk.com/club1342946" },
  { title: "TikTok", name: "fa-brands:tiktok", url: "https://www.tiktok.com/@sentimony" },
  { title: "Twitter", name: "fa-brands:twitter", url: "https://twitter.com/sentimony" },
  { title: "YouTube", name: "fa:youtube", url: "https://www.youtube.com/@SentimonyRecords?sub_confirmation=1" },
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
  <div class="relative z-100 bg-black text-white/50 text-xs leading-[1.4] md:leading-[1.5] px-1 py-[100px]">
    <div class="container flex flex-col items-center">
      
      <div class="text-[14px] mb-[2em]">
        <div class="FooterNav__list flex justify-center flex-wrap">
          <NuxtLink
            v-for="i in nav"
            :to="i.route"
            class="transition-colors ease-in-out duration-300 text-white/80 hover:text-white/100 hover:bg-white/20 p-[0.6em]"
            :class="isNavActive(i.route) ? 'bg-white/10' : ''"
            v-wave
          >
            {{ i.title }}
          </NuxtLink>
        </div>
      </div>

      <div class="text-[14px] mb-[24px]">
        <div class="">Follow Us:</div>
        <div class="pt-2 flex flex-wrap justify-center">
          <a
            v-for="i in soc"
            :href="i.url"
            class="transition-all ease-in-out duration-300 p-2 relative size-[40px] flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:bg-white/10 rounded-sm"
            target="_blank" rel="noopener"
            v-wave
          >
            <Icon v-if="i.name" :name="i.name" size="22" />
            <img
              v-else
              :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg?01'" 
              class="w-[22px]"
              :alt="i.title + ' Icon'"
            />
            <div class="FooterSoc__tooltip">{{ i.title }}</div>
          </a>
        </div>
      </div>

      <div class="text-[14px] mb-[24px]">
        <div>2006 - {{ new Date().getFullYear() }} © Sentimony Records</div>
        <div>All Rights Reserved</div>
        <div>
          <img 
            class="w-[30px] block mx-auto mt-[4px]" 
            src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01" 
            alt="Sentimony Records Logo SVG"
          />
        </div>
      </div>

      <div class="text-[12px] mb-[20px]">
        <div>
          <span>Design By </span>
          <NuxtLink 
            class="text-white" 
            to="/artist/apivniuk"
            v-wave
          >Anton Pivniuk</NuxtLink>
        </div>
        <div>
          <span>Development By </span>
          <a 
            class="text-white"
            href="https://github.com/sentimony/sentimony-nuxt"
            target="_blank" rel="noopener"
            v-wave
          >Ihor Orlovskyi</a>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss">
.FooterNav {
  &__list {
    border: 1px solid rgba(#fff, 0.1);
    border-width: 1px;
    border-radius: 4px;
    overflow: hidden;
  }
}

.FooterSoc {
  &__tooltip {
    font-size: 10px;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translate3d(-50%,0,0);
    transition: all .3s ease-in-out;
    opacity: 0;
    visibility: hidden;
    background-color: rgba(#8a0202, 1);
    padding: 1px 4px;
    border-radius: 4px;
    color: #fff;

    a:hover & {
      opacity: 1;
      visibility: visible;
      transform: translate3d(-50%,50%,0);
    }
  }
}
</style>
