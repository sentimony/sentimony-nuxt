<script setup lang="ts">
import { createError } from '#app'
import type { Release, Artist } from '~/types'

const { id } = useRoute().params
const { isLiked, toggleLike, likeCount, setCount } = useLikes()
const { isTrackLiked, toggleTrackLike, trackLikeCount, setTrackCount } = useTrackLikes()

type Track = { slug: string, title: string, artist_name: string, track_number: number, bpm: number | null, like_count: number }
const { data: tracks } = await useFetch<Track[]>(`/api/tracks/${id}`)

onMounted(() => {
  if (item.value) setCount(item.value.slug, item.value.like_count ?? 0)
  tracks.value?.forEach(t => setTrackCount(t.slug, t.like_count))
})

const releaseAsync = await useRelease(id as string, { server: true })
const item = releaseAsync.data
const releaseError = releaseAsync.error

if (releaseError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Release not found' })
}

const { data: releasesRaw } = await useReleases()
const { data: artistsRaw } = await useArtists()
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))

const releasesSortedByDate = computed(() =>
  [...releases.value]
    .filter(r => Boolean(r.visible))
    .sort((a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
)

const artistsSortedByReleaseOrder = computed(() => {
  if (!item.value?.artists) return []

  const artistsOrder = typeof item.value.artists === 'string'
    ? item.value.artists.split(',').map(s => s.trim())
    : (Array.isArray(item.value.artists) ? item.value.artists : [])

  return [...artists.value]
    .filter(artist => artistsOrder.includes(artist.slug))
    .sort((a, b) => {
      const indexA = artistsOrder.indexOf(a.slug)
      const indexB = artistsOrder.indexOf(b.slug)
      return indexA - indexB
    })
})

const { formatDate, formatYear } = useDate()
const formattedDate = computed(() => formatDate(item.value?.date))
const { embed: embedYTMusic } = useYouTubeMusicPlaylist(computed(() => item.value?.links?.youtube_music))

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const year = computed(() => formatYear(item.value?.date))
const PageDescription = computed(() => [
  item.value?.title,
  item.value?.style,
  item.value?.format,
  year.value,
].filter(Boolean).join(' - '))

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

const comingMusic = '<div class="p-4 text-center text-white/70">Player coming soon</div>'
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-[2] px-2">
      <div class="container max-w-7xl" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-12 xl:mb-24 2xl:mb-36 pr-2">

            <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">

              <div class="shrink-0">
                <OpenImage
                  :image_th="item.cover_th"
                  :image_xl="item.cover_xl"
                  :alt="(item.title || 'Release') + ' cover'"
                />
              </div>

              <div class="flex-1 min-w-0">

            <p><span class="text-foreground/50">Release Date:</span> {{ formattedDate }}</p>
            <p><span class="text-foreground/50">Catalog Number:</span> {{ item.cat_no }}</p>
            <p><span class="text-foreground/50">Styles:</span> {{ item.style }}</p>
            <p><span class="text-foreground/50">Format:</span> {{ item.format }}</p>
            <p><span class="text-foreground/50">Total Time:</span> {{ item.total_time }}</p>

            <div class="flex justify-start mb-4">
              <button
                @click="toggleLike(item.slug)"
                class="flex items-center gap-2 border rounded px-4 py-2 text-sm transition-colors duration-200 hover:bg-white/10"
                :class="isLiked(item.slug) ? 'border-red-400/50 text-red-400' : 'border-foreground/20 text-foreground/40 hover:text-foreground/70'"
                v-wave
              >
                <Icon name="lucide:heart" mode="svg" :class="isLiked(item.slug) && '[&_path]:fill-current'" size="18" />
                {{ isLiked(item.slug) ? 'Liked' : 'Like' }}
                <span v-if="likeCount(item.slug) > 0" class="opacity-50">{{ likeCount(item.slug) }}</span>
              </button>
            </div>

              </div>

            </div>

            <!-- <p>
              <span class="text-[10px] md:text-[12px] text-foreground/50">{{ item.cat_no }}</span>
              <span class="text-[10px] md:text-[12px] text-foreground/50"> | {{ formattedDate }}</span>
            </p>
            <h1 class="">{{ item.title }}</h1>
            <p>
              <span class="text-[10px] md:text-[12px] text-foreground/50">{{ item.style }}</span>
              <span class="text-[10px] md:text-[12px] text-foreground/50"> | {{ item.total_time }}</span>
            </p> -->
            <!-- <br> -->

            <p v-if="item.links?.diggersfactory_url"><span class="text-[10px] md:text-[12px] text-foreground/50">Purchase VINYL</span></p>
            <BtnPrimary
              v-if="item.links?.diggersfactory_url"
              :to="item.links?.diggersfactory_url"
              title="Diggers Factory"
              img="https://content.sentimony.com/assets/img/svg-icons/diggers-factory.svg?01"
            />

            <p><span class="text-[10px] md:text-[12px] text-foreground/50">Download</span></p>
            <BtnPrimary
              v-if="item.links?.bandcamp_url"
              :to="item.links?.bandcamp_url"
              title="Bandcamp <small>(16bit)</small>"
              iconify="simple-icons:bandcamp"
            />
            <BtnPrimary
              v-if="item.links?.bandcamp24_url"
              :to="item.links?.bandcamp24_url"
              title="Bandcamp <small>(24bit)</small>"
              iconify="simple-icons:bandcamp"
            />
            <BtnPrimary
              v-if="item.links?.beatport"
              :to="item.links?.beatport"
              title="Beatport"
              iconify="simple-icons:beatport"
            />
            <BtnPrimary
              v-if="item.links?.junodownload"
              :to="item.links?.junodownload"
              title="JunoDownload"
              img="https://content.sentimony.com/assets/img/svg-icons/junodownload.svg?01"
            />

            <!-- <br> -->
            <p><span class="text-[10px] md:text-[12px] text-foreground/50">Stream</span></p>
            <BtnPrimary
              v-if="item.links?.spotify"
              :to="item.links?.spotify"
              title="Spotify"
              iconify="simple-icons:spotify"
            />
            <BtnPrimary
              v-if="item.links?.applemusic_url"
              :to="item.links?.applemusic_url"
              title="Apple Music"
              iconify="simple-icons:applemusic"
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
              iconify="simple-icons:deezer"
            />
            <BtnPrimary
              v-if="item.links?.amazon_music"
              :to="item.links?.amazon_music"
              title="Amazon Music"
              iconify="simple-icons:amazonmusic"
            />
            <BtnPrimary
              v-if="item.links?.tidal"
              :to="item.links?.tidal"
              title="Tidal"
              iconify="simple-icons:tidal"
            />
            <BtnPrimary
              v-if="item.links?.qobuz"
              :to="item.links?.qobuz"
              title="Qobuz"
              img="https://content.sentimony.com/assets/img/svg-icons/qobuz.svg?01"
            />
            <BtnPrimary
              v-if="item.links?.youtube"
              :to="item.links?.youtube"
              title="YouTube"
              iconify="simple-icons:youtube"
            />
            <BtnPrimary
              v-if="item.links?.soundcloud_url"
              :to="item.links?.soundcloud_url"
              title="SoundCloud"
              iconify="simple-icons:soundcloud"
            />

            <p v-if="item.links?.discogs"><span class="text-[10px] md:text-[12px] text-foreground/50">Add to your collection</span></p>
            <BtnPrimary
              v-if="item.links?.discogs"
              :to="item.links?.discogs"
              title="Discogs"
              iconify="simple-icons:discogs"
            />

          </div>
          <div class="relative max-w-[540px] mx-auto w-full mb-4">

            <Tabs>

              <Tab
                icon="simple-icons:bandcamp"
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
                icon="simple-icons:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video w-full"
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
                icon="simple-icons:soundcloud"
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

    <ItemContent v-if="item">

        <div v-if="item.information" v-html="sanitizeHtml(item.information)" />

        <div v-if="tracks?.length || item.tracklistCompact" class="Tracklist">
          <hr class="my-4 border-black/30">
          <p><small><b>Tracklist:</b></small></p>

          <template v-if="tracks?.length">
            <p
              v-for="track in tracks"
              :key="track.slug"
              class="flex items-center justify-between gap-2"
            >
              <NuxtLink
                :to="`/track/${track.slug}`"
                class="hover:underline"
              >
                <small>{{ track.track_number < 10 ? ' ' + track.track_number : track.track_number }}.</small> <b>{{ track.artist_name }}</b> - {{ track.title }} <small v-if="track.bpm">({{ track.bpm }}bpm)</small>
              </NuxtLink>
              <button
                @click="toggleTrackLike(track.slug)"
                class="flex items-center gap-1 text-xs border rounded px-2 py-1 transition-colors duration-200 hover:bg-black/10 shrink-0"
                :class="isTrackLiked(track.slug) ? 'border-red-400/30 text-red-400' : 'border-black/30 text-black/60 hover:text-black/80'"
              >
                <Icon name="lucide:heart" mode="svg" :class="isTrackLiked(track.slug) && '[&_path]:fill-current'" size="12" />
                <span v-if="trackLikeCount(track.slug) > 0">{{ trackLikeCount(track.slug) }}</span>
              </button>
            </p>
          </template>

          <template v-else>
            <p
              v-for="(i, index) in item.tracklistCompact"
              :key="index"
              v-html="sanitizeHtml(i.p)"
            />
          </template>
        </div>

        <div v-if="item.creditsCompact">
          <hr class="my-4 border-black/30">
          <p><small><b>Credits:</b></small></p>
          <p
            v-for="(ii, index) in item.creditsCompact"
            :key="index"
            v-html="sanitizeHtml(ii.p)"
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
            v-for="(iiii, index) in artistsSortedByReleaseOrder"
            :key="index"
            class="mb-2 mr-4 last:mr-0"
          >
            <RelativeItem
              :i="iiii"
              category="artist"
            />
          </p>
        </div>

        <div v-if="item.links?.beatspace || item.links?.psyshop || item.links?.ektoplazm">
          <hr class="my-4 border-black/30">
          <p><small><b>Links:</b></small></p>
          <p v-if="item.links?.beatspace"><a :href="item.links?.beatspace" target="_blank" rel="noopener">Beatspace</a></p>
          <p v-if="item.links?.psyshop"><a :href="item.links?.psyshop" target="_blank" rel="noopener">Psyshop</a></p>
          <p v-if="item.links?.ektoplazm"><a :href="item.links?.ektoplazm" target="_blank" rel="noopener">Ektoplazm</a></p>
        </div>

    </ItemContent>

  </div>
</template>

<style>
.BandcampIframe { height: 276px; }
.BandcampIframe.tracks-1 { height: 176px; }
.BandcampIframe.tracks-2 { height: 209px; }
.BandcampIframe.tracks-3 { height: 242px; }
.BandcampIframe.tracks-4 { height: 276px; }
.BandcampIframe.tracks-5 { height: 309px; }
.BandcampIframe.tracks-6 { height: 342px; }
.BandcampIframe.tracks-7 { height: 376px; }
.BandcampIframe.tracks-8 { height: 409px; }
.BandcampIframe.tracks-9 { height: 442px; }
.BandcampIframe.tracks-10 { height: 476px; }
.BandcampIframe.tracks-11 { height: 509px; }
.BandcampIframe.tracks-12 { height: 542px; }
.BandcampIframe.tracks-13 { height: 575px; }
.BandcampIframe.tracks-22 { height: 876px; }
.BandcampIframe.tracks-25 { height: 976px; }
.BandcampIframe.tracks-27 { height: 1042px; }

.SoundcloudIframe { height: 400px; }
.SoundcloudIframe.tracks-1 { height: 290px; }
.SoundcloudIframe.tracks-2 { height: 320px; }
.SoundcloudIframe.tracks-3 { height: 360px; }
.SoundcloudIframe.tracks-4 { height: 400px; }
.SoundcloudIframe.tracks-5 { height: 430px; }
.SoundcloudIframe.tracks-6 { height: 460px; }
.SoundcloudIframe.tracks-7 { height: 500px; }
.SoundcloudIframe.tracks-8 { height: 530px; }
.SoundcloudIframe.tracks-9 { height: 560px; }
.SoundcloudIframe.tracks-10 { height: 590px; }
.SoundcloudIframe.tracks-11 { height: 620px; }
.SoundcloudIframe.tracks-12 { height: 650px; }
.SoundcloudIframe.tracks-13 { height: 680px; }
.SoundcloudIframe.tracks-22 { height: 960px; }
.SoundcloudIframe.tracks-25 { height: 1030px; }
.SoundcloudIframe.tracks-27 { height: 1100px; }
</style>
