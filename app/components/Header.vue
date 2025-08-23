<script setup lang="ts">
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
  { title: "Bandcamp", icon: "bandcamp", url: "https://sentimony.bandcamp.com/follow_me" },
  { title: "Facebook", icon: "facebook", url: "https://www.facebook.com/sentimony.records" },
  { title: "SoundCloud", icon: "soundcloud", url: "https://soundcloud.com/sentimony" },
  { title: "YouTube", icon: "youtube", url: "https://www.youtube.com/@SentimonyRecords?sub_confirmation=1" },
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
</script>

<template>
  <div class="container mb-10 border-b border-white/30">
    <div class="flex justify-between items-center h-[75px]">

      <div class="w-[232px]">
        <NuxtLink
          to="/"
          class="HeaderMenu__main-menu-link transition-[background-color] ease-in-out duration-300 flex hover:bg-white/40 h-[56px] items-center justify-center rounded-[2px]"
          active-class="bg-white/40"
        >
          <img 
            src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.1.svg?01" 
            alt="Sentimony Records Logo SVG"
            class="w-[40px] mr-[12px]"
          />
          <div class="text-left">
            <div class=" text-[16px]">Sentimony Records</div>
            <div class="opacity-[0.4] text-[12px] tracking-[0.4px]">Psychedelic Music Label</div>
          </div>
        </NuxtLink>
      </div>

      <div class="flex">
        <NuxtLink
          v-for="i in nav"
          :to="i.route"
          class=" transition-opacity hover:bg-white/40 w-[110px] h-[56px] flex items-center justify-center rounded-[2px]"
          active-class="bg-white/40"
        >
          <span>{{ i.title }}</span>
        </NuxtLink>
      </div>

      <div class="HeaderSoc w-[232px]">
        <div class="HeaderSoc__wrapper">
          <div class="HeaderSoc__list flex justify-between">
            <a
              v-for="i in soc"
              :href="i.url"
              class="HeaderSoc__link w-[56px] h-[56px] hover:bg-white/40 flex items-center justify-center rounded-[2px]"
              target="_blank" rel="noopener"
            >
              <img
                :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg?01'" 
                class="HeaderSoc__icon w-[24px]"
                :alt="i.title + ' Icon'"
              />
              <!-- <div>{{ i.title }}</div> -->
            </a>
          </div>
        </div>
      </div>

      <!-- <div>
        <NuxtLink to="/">[
          <Icon name="mdi:home" width="24" height="24" />
          Home
        ]</NuxtLink> | 
        <NuxtLink to="/releases">[ 
          <Icon name="mdi:music" width="24" height="24" />
        Releases]</NuxtLink> | 
        <NuxtLink to="/artists">[
          <Icon name="mdi:artist" width="24" height="24" />
          Artists
        ]</NuxtLink> | 
        <NuxtLink to="/videos">[
          <Icon name="mdi:video-vintage" width="24" height="24" />
          Videos
        ]</NuxtLink> | 
        <NuxtLink to="/playlists">[
          <Icon name="mdi:playlist-music" width="24" height="24" />
          Playlists
        ]</NuxtLink>
        <NuxtLink to="/contacts">[
          <Icon name="mdi:gmail" width="24" height="24" />
          Contacts
        ]</NuxtLink>
      </div> -->

      <!-- <div>
        <NuxtLink to="/events">[
          <Icon name="mdi:event" width="24" height="24" />
          Events
        ]</NuxtLink> | 
        <NuxtLink to="/friends">[
          <Icon name="mdi:event" width="24" height="24" />
          Friends
        ]</NuxtLink> | 
        <NuxtLink to="/news">[
          <Icon name="mdi:event" width="24" height="24" />
          News
        ]</NuxtLink> | 
        <NuxtLink to="/tracks">[
          <Icon name="mdi:bug" width="24" height="24" />
          Tracks
        ]</NuxtLink>
        <NuxtLink to="/sitemap">[
          <Icon name="mdi:bug" width="24" height="24" />
          Sitemap
        ]</NuxtLink>
        <NuxtLink to="/ddos">[
          <Icon name="mdi:bug" width="24" height="24" />
          Ddos
        ]</NuxtLink>
      </div> -->

    </div>
  </div>
</template>

<style lang="scss"></style>
