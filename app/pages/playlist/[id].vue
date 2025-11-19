<script setup lang="ts">
import { computed } from 'vue'
import { createError } from '#app'

const { id } = useRoute().params

interface PlaylistLinks {
  spotify?: string
  apple_music?: string
  youtube_music?: string
  deezer?: string
  youtube?: string
  soundcloud_url?: string
  soundcloud_playlist_id?: string
}

interface PlaylistItem {
  slug: string
  title: string
  style?: string
  cover_og?: string
  cover_th?: string
  cover_xl?: string
  info?: string
  links?: PlaylistLinks
}

const playlistAsync = await usePlaylist<PlaylistItem>(id as string, {
  server: true,
})
const item = playlistAsync.data
const playlistError = playlistAsync.error

if (playlistError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Playlist not found' })
}

// YouTube embeds for playlist sources
const { embed: embedYouTube } = useYouTubePlaylist(computed(() => item.value?.links?.youtube))
const { embed: embedYTMusic } = useYouTubeMusicPlaylist(computed(() => item.value?.links?.youtube_music))

const comingMusic = '<div class="p-4 text-[12px] text-white/50">Music is<br>coming ⛄</div>'

const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray(releasesRaw.value, 'releases'))
const releasesSortedByDate = computed(() =>
  [...releases.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)

// SEO meta
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageDescription = computed(() => [
  item.value?.title,
  item.value?.style,
].filter(Boolean).join(' — '))
useSeoMeta({
  title: () => item.value?.title,
  description: () => PageDescription.value,
  ogTitle: () => item.value?.title,
  ogDescription: () => PageDescription.value,
  ogImage: () => item.value?.cover_og || item.value?.cover_xl || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.cover_og || item.value?.cover_xl || appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>

<template>
  <div class="text-left border-t border-white/30">
    <div class="relative px-2 pb-[30px] md:pb-[60px]">
      <SvgTriangle />

      <div class="container max-w-7xl" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-12 xl:mb-24 2xl:mb-36">

            <OpenImage
              :image_th="item.cover_th"
              :image_xl="item.cover_xl"
              :alt="(item.title || 'Playlist') + ' cover'"
              class="float-left"
            />

            <!-- <h1 class="text-center mt-0 mb-[1.2em]">{{ item.title }}</h1> -->
            <p><span class="text-white/50">Styles:</span> {{ item.style }}</p>

            <div class="clear-left" />

            <p><span class="text-[10px] md:text-[12px] text-white/50">Links</span></p>
            <BtnPrimary
              v-if="item.links?.spotify"
              :to="item.links?.spotify"
              title="Spotify"
              iconify="fa-brands:spotify"
            />
            <BtnPrimary
              v-if="item.links?.apple_music"
              :to="item.links?.apple_music"
              title="Apple Music"
              iconify="fa-brands:apple"
            />
            <BtnPrimary
              v-if="item.links?.youtube_music"
              :to="item.links?.youtube_music"
              title="YT Music"
              iconify="simple-icons:youtubemusic"
            />
            <BtnPrimary
              v-if="item.links?.deezer"
              :to="item.links?.deezer"
              title="Deezer"
              iconify="fa-brands:deezer"
            />
            <BtnPrimary
              v-if="item.links?.youtube"
              :to="item.links?.youtube"
              title="YouTube"
              iconify="fa:youtube"
            />
            <BtnPrimary
              v-if="item.links?.soundcloud_url"
              :to="item.links?.soundcloud_url"
              title="SoundCloud"
              iconify="fa7-brands:soundcloud"
            />

          </div>
          <div class="relative max-w-[540px] mx-auto w-full mb-4">

            <Tabs>
              <Tab
                icon="fa:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    v-if="item.links?.youtube"
                    class="border-[0px] aspect-video w-full"
                    :src="embedYouTube"
                    :title="item.title + 'YouTube video player'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  />
                  <div
                    v-else
                    v-html="comingMusic"
                  />
                </div>
              </Tab>
              <Tab
                v-if="item.links?.soundcloud_playlist_id"
                icon="fa7-brands:soundcloud"
                title="SoundCloud"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] w-[100%] h-[100vh]"
                    scrolling="no"
                    height="450"
                    allow="autoplay"
                    :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + (item.links?.soundcloud_playlist_id || '') + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'"
                    :title="item.title + ' SoundCloud Iframe'"
                  />
                </div>
              </Tab>
              <Tab
                v-if="item.links?.youtube_music"
                icon="simple-icons:youtubemusic"
                title="YT Music"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video w-full"
                    :src="embedYTMusic"
                    :title="item.title + 'YouTube video player'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  />
                </div>
              </Tab>
            </Tabs>

          </div>
        </div>

      </div>
    </div>

    <div class="Content px-2 pt-2 pb-[30px] md:pb-[60px]" v-if="item">
      <div class="max-w-[640px] mx-auto">

        <div v-if="item.info" v-html="item.info" />

        <div>
          <hr class="my-4 border-black/30">
          <p><small><b>Releases / Tracks:</b></small></p>
          <ol class="list-decimal ps-9">
            <div
              v-for="(i, index) in releasesSortedByDate"
              :key="index"
              class="mb-4"
            >
              <RelativeItem
                v-if="i.at_playlists.includes(item.slug)"
                :i="i"
                category="release"
                class="mb-2"
              />

              <div
                v-if="i.at_playlists.includes(item.slug)"
                class="Tracklist"
              >
                <li
                  v-for="(iii, index) in i.tracklistCompact"
                  :key="'b' + index"
                  v-if="i.tracklistCompact"
                  v-html="iii.p"
                />
              </div>
            </div>
          </ol>
        </div>

      </div>
    </div>

  </div>
</template>
