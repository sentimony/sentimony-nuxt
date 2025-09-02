<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { toArray } from '~/composables/toArray'

const { id } = useRoute().params
interface ReleaseItem {
  title: string;
  cover_og?: string;
  cover_th?: string;
  cat_no?: string;
  date?: string;
  style?: string;
  total_time?: string;
  information?: string;
  tracklistCompact?: Array<{ p: string }>;
  creditsCompact?: Array<{ p: string }>;
  relative_releases?: string[];
  artists?: string[];
}
const { data: item } = await useFetch<ReleaseItem>(`https://sentimony-db.firebaseio.com/releases/${id}.json`, { server: true })
const { data: releasesRaw } = await useFetch('https://sentimony-db.firebaseio.com/releases.json', { server: true })
const { data: artistsRaw } = await useFetch('https://sentimony-db.firebaseio.com/artists.json', { server: true })
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

function formatDate(val?: string | number | Date | null): string {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

const formattedDate = computed(() => formatDate(item.value?.date))
useSeoMeta({
  title: item.value?.title,
  description: (item.value?.title ?? '') + ' description',
  ogImage: item.value?.cover_og,
});

// Triangle SVG height measurement
const triangleEl = ref<HTMLImageElement | null>(null)
const TriangleHeight = ref(0)

function updateTriangleHeight() {
  const el = triangleEl.value
  if (!el) return
  TriangleHeight.value = el.clientHeight || 0
}

onMounted(() => {
  if (triangleEl.value?.complete) updateTriangleHeight()
  triangleEl.value?.addEventListener('load', updateTriangleHeight)
  window.addEventListener('resize', updateTriangleHeight)
})

onBeforeUnmount(() => {
  triangleEl.value?.removeEventListener('load', updateTriangleHeight)
  window.removeEventListener('resize', updateTriangleHeight)
})
</script>

<template>
  <div class="text-left">

    <div 
      class="container px-2 relative" 
      :style="'margin-bottom: -' + TriangleHeight * 0.66 + 'px;'" 
    >
      <div class="border-t border-white/30 pt-[1.8em] flex flex-col lg:flex-row">
        <h1 class="mt-0">{{ item.title }}</h1>
      </div>
      <div class="flex flex-col lg:flex-row">
        <div class="mb-4">
          <!-- <NuxtImg
            v-if="item.cover_th"
            :src="item.cover_th"
            class="inline text-xs w-[120px] mr-1"
            sizes="xs:120px"
            densities="x2"
            format="webp"
            :alt="item.title"
          /> -->
          <div class="float-left w-[100px] md:w-[190px] mr-4 mb-2 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-black/50">
            <img
              v-if="item.cover_th"
              :src="item.cover_th"
              class=""
              :alt="item.title"
            />
          </div>

          <p><span class="text-white/50">Release Date:</span> {{ formattedDate }}</p>
          <p><span class="text-white/50">Catalog Number:</span> {{ item.cat_no }}</p>
          <p><span class="text-white/50">Styles:</span> {{ item.style }}</p>
          <p><span class="text-white/50">Format:</span> {{ item.format }}</p>
          <p><span class="text-white/50">Total Time:</span> {{ item.total_time }}</p>

          <div class="clear-left">

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
          <p><span class="text-[10px] md:text-[12px] text-white/50">Download</span></p>
          <div v-if="item.links">
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
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.junodownload"
              :url="item.links.junodownload"
              title="JunoDownload"
              icon="cib:bandcamp"
            />
          </div>
          </div>

          <!-- <br> -->
          <p><span class="text-[10px] md:text-[12px] text-white/50">Stream</span></p>
          <div v-if="item.links">
            <BtnPrimary
              v-if="item.links.spotify"
              :url="item.links.spotify"
              title="Spotify"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.applemusic_url"
              :url="item.links.applemusic_url"
              title="Apple Music"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.youtube_music"
              :url="item.links.youtube_music"
              title="YouTube Music"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.deezer"
              :url="item.links.deezer"
              title="Deezer"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.amazon_music"
              :url="item.links.amazon_music"
              title="Amazon Music"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.tidal"
              :url="item.links.tidal"
              title="Tidal"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.qobuz"
              :url="item.links.qobuz"
              title="Qobuz"
              icon="cib:bandcamp"
            />
            <BtnPrimary
              v-if="item.links.soundcloud_url"
              :url="item.links.soundcloud_url"
              title="SoundCloud"
              icon="fa7-brands:soundcloud"
            />
          </div>

        </div>
        <div class="max-w-[540px] mx-auto w-[100%] mb-4">

          <Tabs>
            <Tab
              icon="cib:bandcamp"
              title="Bandcamp"
            >
              <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                <iframe
                  v-if="item.links.bandcamp_id"
                  class="border-[0px] w-[100%]"
                  :class="'BandcampIframe tracks-' + item.tracks_number"
                  :src="'https://bandcamp.com/EmbeddedPlayer/album=' + item.links.bandcamp_id + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/transparent=true/'"
                  seamless
                  :title="item.title + ' Bandcamp Iframe'"
                />
                <div
                  v-if="!item.links.bandcamp_id"
                  class="player-coming"
                  v-html="comingMusic"
                />
              </div>
            </Tab>

            <Tab
              v-if="item.links.youtube_playlist_id"
              icon="cib:bandcamp"
              title="YouTube"
            >
              <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                <iframe
                  class="border-[0px] aspect-video"
                  :src="'https://www.youtube-nocookie.com/embed/videoseries?list=' + item.links.youtube_playlist_id + '&loop=1'"
                  :title="item.title + 'YouTube video player'"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                />
              </div>
            </Tab>

            <Tab
              v-if="item.links.soundcloud_playlist_id"
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
                  :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + item.links.soundcloud_playlist_id + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'"
                  :title="item.title + ' SoundCloud Iframe'"
                />
              </div>
            </Tab>
          </Tabs>

        </div>
      </div>
    </div>

    <img ref="triangleEl" src="/images/triangle.svg" alt="Triangle SVG" @load="updateTriangleHeight" />
    
    <!-- <div class="bg-[url('/images/triangle.svg?01')] bg-bottom bg-no-repeat">
      <div class="pt-[50px] pb-[100px] px-2 text-xs text-white/60 text-center">{{ TriangleHeight }}</div>
    </div> -->

    <div class="Content px-2 pt-2 pb-[30px] md:pb-[60px] bg-[#e0ebe0] text-black">
      <div class="container">
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

          <div v-if="item.links.discogs || item.links.ektoplazm">
            <hr class="my-4 border-black/30">
            <p><small><b>Links:</b></small></p>
            <p v-if="item.links.discogs"><a :href="item.links.discogs" target="_blank" rel="noopener">Discogs</a></p>
            <p v-if="item.links.beatspace"><a :href="item.links.beatspace" target="_blank" rel="noopener">Beatspace</a></p>
            <p v-if="item.links.psyshop"><a :href="item.links.psyshop" target="_blank" rel="noopener">Psyshop</a></p>
            <p v-if="item.links.ektoplazm"><a :href="item.links.ektoplazm" target="_blank" rel="noopener">Ektoplazm</a></p>
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
