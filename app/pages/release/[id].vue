<script setup lang="ts">
import { createError } from '#app'
import { toArray } from '~/composables/toArray'

const { id } = useRoute().params
interface ReleaseItemLinks {
  bandcamp_url?: string;
  bandcamp24_url?: string;
  beatport?: string;
  junodownload?: string;
  spotify?: string;
  applemusic_url?: string;
  youtube_music?: string;
  deezer?: string;
  amazon_music?: string;
  tidal?: string;
  qobuz?: string;
  soundcloud_url?: string;
  discogs?: string;
  ektoplazm?: string;
  beatspace?: string;
  psyshop?: string;
  bandcamp_id?: string;
  youtube?: string;
  youtube_playlist_id?: string;
  soundcloud_playlist_id?: string;
}

interface ReleaseItem {
  title: string;
  cover_og?: string;
  cover_th?: string;
  cover_xl?: string;
  cat_no?: string;
  date?: string;
  style?: string;
  format?: string;
  total_time?: string;
  information?: string;
  tracklistCompact?: Array<{ p: string }>;
  creditsCompact?: Array<{ p: string }>;
  relative_releases?: string[];
  artists?: string[];
  tracks_number?: number;
  links?: ReleaseItemLinks;
}

const releaseAsync = await useRelease<ReleaseItem>(id as string, {
  server: true,
})
const item = releaseAsync.data
const releaseError = releaseAsync.error

if (releaseError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Release not found' })
}
const { data: releasesRaw } = await useReleases()
const { data: artistsRaw } = await useArtists()
const releases = computed(() => toArray(releasesRaw.value, 'releases'))
const artists = computed(() => toArray(artistsRaw.value, 'artists'))
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

const { formatDate, formatYear } = useDate()
const formattedDate = computed(() => formatDate(item.value?.date))
const { embed: embedYTMusic } = useYouTubeMusicPlaylist(computed(() => item.value?.links?.youtube_music))

// SEO meta
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const year = computed(() => formatYear(item.value?.date))
const PageDescription = computed(() => [
  item.value?.title,
  item.value?.style,
  item.value?.format,
  year.value,
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
});

// Fallback HTML for missing players
const comingMusic = '<div class="p-4 text-center text-white/70">Player coming soon</div>'
</script>

<template>
  <div class="text-left border-t border-white/30">
    <div class="relative px-2">
      <SvgTriangle />

      <div class="container max-w-7xl" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-20 xl:mb-32 2xl:mb-56 ">

            <OpenImage
              :image_th="item.cover_th"
              :image_xl="item.cover_xl"
              :alt="(item.title || 'Release') + ' cover'"
              class="float-left"
            />

            <p><span class="text-white/50">Release Date:</span> {{ formattedDate }}</p>
            <p><span class="text-white/50">Catalog Number:</span> {{ item.cat_no }}</p>
            <p><span class="text-white/50">Styles:</span> {{ item.style }}</p>
            <p><span class="text-white/50">Format:</span> {{ item.format }}</p>
            <p><span class="text-white/50">Total Time:</span> {{ item.total_time }}</p>

            <div class="clear-left" />

            <!-- <p>
              <span class="text-[10px] md:text-[12px] text-white/50">{{ item.cat_no }}</span>
              <span class="text-[10px] md:text-[12px] text-white/50"> | {{ formattedDate }}</span>
            </p>
            <h1 class="">{{ item.title }}</h1>
            <p>
              <span class="text-[10px] md:text-[12px] text-white/50">{{ item.style }}</span>
              <span class="text-[10px] md:text-[12px] text-white/50"> | {{ item.total_time }}</span>
            </p> -->
            <!-- <br> -->

            <p v-if="item.links.diggersfactory_url"><span class="text-[10px] md:text-[12px] text-white/50">Purchase VINYL</span></p>
            <BtnPrimary
              v-if="item.links.diggersfactory_url"
              :url="item.links.diggersfactory_url"
              title="Diggers Factory"
              icon="cib:bandcamp"
            />

            <p><span class="text-[10px] md:text-[12px] text-white/50">Download</span></p>
            <BtnPrimary
              v-if="item.links.bandcamp_url"
              :url="item.links.bandcamp_url"
              title="Bandcamp <small>(16bit)</small>"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.bandcamp24_url"
              :url="item.links.bandcamp24_url"
              title="Bandcamp <small>(24bit)</small>"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.beatport"
              :url="item.links.beatport"
              title="Beatport"
              icon="simple-icons:beatport"
            />
            <BtnPrimary
              v-if="item.links.junodownload"
              :url="item.links.junodownload"
              title="JunoDownload"
              img="https://content.sentimony.com/assets/img/svg-icons/junodownload.svg?01"
            />

            <!-- <br> -->
            <p><span class="text-[10px] md:text-[12px] text-white/50">Stream</span></p>
            <BtnPrimary
              v-if="item.links.spotify"
              :url="item.links.spotify"
              title="Spotify"
              icon="fa-brands:spotify"
            />
            <BtnPrimary
              v-if="item.links.applemusic_url"
              :url="item.links.applemusic_url"
              title="Apple Music"
              icon="fa-brands:apple"
            />
            <BtnPrimary
              v-if="item.links.youtube_music"
              :url="item.links.youtube_music"
              title="YT Music"
              icon="simple-icons:youtubemusic"
            />
            <BtnPrimary
              v-if="item.links.deezer"
              :url="item.links.deezer"
              title="Deezer"
              icon="fa-brands:deezer"
            />
            <BtnPrimary
              v-if="item.links.amazon_music"
              :url="item.links.amazon_music"
              title="Amazon Music"
              img="https://content.sentimony.com/assets/img/svg-icons/amazon-music.svg?01"
            />
            <BtnPrimary
              v-if="item.links.tidal"
              :url="item.links.tidal"
              title="Tidal"
              icon="fa7-brands:tidal"
            />
            <BtnPrimary
              v-if="item.links.qobuz"
              :url="item.links.qobuz"
              title="Qobuz"
              img="https://content.sentimony.com/assets/img/svg-icons/qobuz.svg?01"
            />
            <BtnPrimary
              v-if="item.links.youtube"
              :url="item.links.youtube"
              title="YouTube"
              icon="fa:youtube"
            />
            <BtnPrimary
              v-if="item.links.soundcloud_url"
              :url="item.links.soundcloud_url"
              title="SoundCloud"
              icon="fa7-brands:soundcloud"
            />

          </div>
          <div class="max-w-[540px] mx-auto w-full mb-4">

            <Tabs>

              <Tab
                icon="cib:bandcamp"
                title="Bandcamp"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    v-if="item.links?.bandcamp_id"
                    class="border-[0px] w-[100%]"
                    :class="'BandcampIframe tracks-' + item.tracks_number"
                    :src="'https://bandcamp.com/EmbeddedPlayer/album=' + (item.links?.bandcamp_id || '') + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/transparent=true/'"
                    seamless
                    :title="item.title + ' Bandcamp Iframe'"
                  />
                  <div
                    v-if="!item.links?.bandcamp_id"
                    class="player-coming"
                    v-html="comingMusic"
                  />
                </div>
              </Tab>

              <Tab
                v-if="item.links?.youtube_playlist_id"
                icon="fa:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video"
                    :src="'https://www.youtube-nocookie.com/embed/videoseries?list=' + (item.links?.youtube_playlist_id || '') + '&loop=1'"
                    :title="item.title + 'YouTube video player'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
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
                    class="border-[0px] w-[100%]"
                    :class="'SoundcloudIframe tracks-' + item.tracks_number"
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
                    class="border-[0px] aspect-video"
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

    <div class="Content px-2 pt-2 pb-[30px] md:pb-[60px] bg-[#e0ebe0] text-black" v-if="item">
      <div class="max-w-[640px] mx-auto">

        <div v-if="item.information" v-html="item.information" />

        <div v-if="item.tracklistCompact">
          <hr class="my-4 border-black/30">
          <p><small><b>Tracklist:</b></small></p>
          <p
            v-for="(i, index) in item.tracklistCompact"
            :key="index"
            v-html="i.p"
          />
        </div>

        <div v-if="item.creditsCompact">
          <hr class="my-4 border-black/30">
          <p><small><b>Credits:</b></small></p>
          <p
            v-for="(ii, index) in item.creditsCompact"
            :key="index"
            v-html="ii.p"
          />
        </div>

        <div v-if="item.relative_releases">
          <hr class="my-4 border-black/30">
          <p><small><b>Relative Releases:</b></small></p>
          <p
            v-for="(iii, index) in releasesSortedByDate"
            :key="index"
          >
            <RelativeItem
              v-if="item.relative_releases.includes(iii.slug)"
              :i="iii"
              category="release"
            />
          </p>
        </div>

        <div v-if="item.artists">
          <hr class="my-4 border-black/30">
          <p><small><b>Relative Artists:</b></small></p>
          <p
            v-for="(iiii, index) in artistsSortedByCategoryId"
            :key="index"
          >
            <RelativeItem
              v-if="item.artists.includes(iiii.slug)"
              :i="iiii"
              category="artist"
            />
          </p>
        </div>

        <div v-if="item.links?.discogs || item.links?.ektoplazm">
          <hr class="my-4 border-black/30">
          <p><small><b>Links:</b></small></p>
          <p v-if="item.links?.discogs"><a :href="item.links?.discogs" target="_blank" rel="noopener">Discogs</a></p>
          <p v-if="item.links?.beatspace"><a :href="item.links?.beatspace" target="_blank" rel="noopener">Beatspace</a></p>
          <p v-if="item.links?.psyshop"><a :href="item.links?.psyshop" target="_blank" rel="noopener">Psyshop</a></p>
          <p v-if="item.links?.ektoplazm"><a :href="item.links?.ektoplazm" target="_blank" rel="noopener">Ektoplazm</a></p>
        </div>

      </div>
    </div>

  </div>
</template>

<style lang="scss">
.BandcampIframe {
  height: 276px;
  &.tracks-1 { height: 176px; }
  &.tracks-2 { height: 209px; }
  &.tracks-3 { height: 242px; }
  &.tracks-4 { height: 276px; }
  &.tracks-5 { height: 309px; }
  &.tracks-6 { height: 342px; }
  &.tracks-7 { height: 376px; }
  &.tracks-8 { height: 409px; }
  &.tracks-9 { height: 442px; }
  &.tracks-10 { height: 476px; }
  &.tracks-11 { height: 509px; }
  &.tracks-12 { height: 542px; }
  &.tracks-13 { height: 575px; }
  &.tracks-22 { height: 876px; }
  &.tracks-25 { height: 976px; }
  &.tracks-27 { height: 1042px; }
}

.SoundcloudIframe {
  height: 400px;
  &.tracks-1 { height: 290px; }
  &.tracks-2 { height: 320px; }
  &.tracks-3 { height: 360px; }
  &.tracks-4 { height: 400px; }
  &.tracks-5 { height: 430px; }
  &.tracks-6 { height: 460px; }
  &.tracks-7 { height: 500px; }
  &.tracks-8 { height: 530px; }
  &.tracks-9 { height: 560px; }
  &.tracks-10 { height: 590px; }
  &.tracks-11 { height: 620px; }
  &.tracks-12 { height: 650px; }
  &.tracks-13 { height: 680px; }
  &.tracks-22 { height: 960px; }
  &.tracks-25 { height: 1030px; }
  &.tracks-27 { height: 1100px; }
}
</style>
