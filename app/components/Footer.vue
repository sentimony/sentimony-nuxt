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
  { title: "AppleMusic", icon: "apple-music-2", url: "https://itunes.apple.com/profile/sentimony" },
  { title: "Bandcamp", icon: "bandcamp", url: "https://sentimony.bandcamp.com/follow_me" },
  { title: "Beatport", icon: "beatport", url: "https://www.beatport.com/label/sentimony-records/66490" },
  { title: "Deezer", icon: "deezer", url: "https://www.deezer.com/us/profile/2697545682"  },
  { title: "Discogs", icon: "discogs", url: "https://www.discogs.com/label/82598-Sentimony-Records?sort=year&sort_order=desc&layout=big&&limit=100" },
  { title: "Facebook", icon: "facebook", url: "https://www.facebook.com/sentimony.records" },
  { title: "Instagram", icon: "instagram", url: "https://www.instagram.com/sentimony.records" },
  { title: "JunoDownload", icon: "junodownload", url: "https://www.junodownload.com/labels/Sentimony/" },
  { title: "Mixcloud", icon: "mixcloud", url: "https://www.mixcloud.com/sentimony" },
  { title: "Patreon", icon: "patreon", url: "https://www.patreon.com/sentimony" },
  { title: "SoundCloud", icon: "soundcloud", url: "https://soundcloud.com/sentimony" },
  { title: "Spotify", icon: "spotify", url: "https://open.spotify.com/user/4arwh3vuu5g9w1gqm89o09td7" },
  // { title: "Tumblr", icon: false, url: "https://sentimony.tumblr.com" },
  // { title: "Giphy", icon: false, url: "https://giphy.com/channel/sentimony" },
  // { title: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/company/3256285" },
  // { title: "VKontakte", icon: "vkontakte", url: "https://vk.com/club1342946" },
  { title: "TikTok", icon: "tiktok", url: "https://www.tiktok.com/@sentimony" },
  { title: "Twitter", icon: "twitter", url: "https://twitter.com/sentimony" },
  { title: "YouTube", icon: "youtube", url: "https://www.youtube.com/@SentimonyRecords?sub_confirmation=1" },
]

const activeMatchers: Record<string, string[]> = {
  '/releases/': ['/releases/', '/release/'],
  '/artists/': ['/artists/', '/artist/'],
  '/videos/': ['/videos/', '/video/'],
  '/playlists/': ['/playlists/', '/playlist/']
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
      
      <div class="FooterNav">
        <div class="FooterNav__wrapper">
          <div class="FooterNav__list">
            <NuxtLink
              v-for="i in nav"
              :to="i.route"
              class="FooterNav__link"
              :class="isNavActive(i.route) ? 'isSelected' : ''"
s            >
              {{ i.title }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="FooterSoc">
        <div class="FooterSoc__caption mb-[1.2em]">Follow Us:</div>
        <div class="FooterSoc__wrapper mb-[24px]">
          <div class="FooterSoc__list">
            <a
              v-for="i in soc"
              :href="i.url"
              class="FooterSoc__link inline-block py-[.1em] px-[.9em]"
              target="_blank" rel="noopener"
            >
              <img
                v-if="i.icon"
                :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg?01'" 
                class="HeaderSoc__icon w-[20px]"
                :alt="i.title + ' Icon'"
              />
              <!-- <div>{{ i.title }}</div> -->
            </a>
          </div>
        </div>
      </div>

      <div class="mb-[24px]">
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

      <div class="text-[10px] mb-[20px]">
        <div>Design By <NuxtLink class="text-white" to="/artist/apivniuk">Anton Pivniuk</NuxtLink></div>
        <div>Development By <a class="text-white" href="https://github.com/sentimony/sentimony-nuxt" target="_blank" rel="noopener">Ihor Orlovskyi</a></div>
      </div>

    </div>
  </div>
</template>

<style lang="scss">
.FooterNav {
  margin: 0 auto 2em;

  &__wrapper {
    display: inline-block;
  }

  &__list {
    border: 1px solid rgba(#fff, 0.1);
    border-width: 1px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__link {
    padding: 0.6em;
    background-color: rgba(#fff, 0);
    transition: background-color 0.2s ease;
    color: #fff;

    &.isSelected {
      background-color: rgba(#fff, 0.1);
    }
    
    &:hover {
      background-color: rgba(#fff, 0.2);
    }
  }
}
</style>
