<script setup lang="ts">
import { createError } from '#app'
import AudioTrackPlaylist from '~/components/AudioTrackPlaylist.vue'
import { toArray } from '~/composables/toArray'
import type { Artist } from '~/types'

const { id } = useRoute().params
const { isLiked, toggleLike, likeCount, setCount } = useLikes()
const { isTrackLiked, toggleTrackLike, trackLikeCount, setTrackCount } = useTrackLikes()

type Track = { slug: string, title: string, artist_name: string, artist_slug?: string, track_number: number, bpm: number | null, like_count: number }
type RelatedRelease = { slug: string, title?: string, cover_xl?: string, date?: string }
type RelatedArtist = { slug: string, title?: string, photo_xl?: string }
type RelatedResponse = { releases: RelatedRelease[], artists: RelatedArtist[] }

const [releaseAsync, tracksAsync, relatedAsync] = await Promise.all([
  useRelease(id as string, { server: true }),
  useFetch<Track[]>(`/api/tracks/${id}`),
  useFetch<RelatedResponse>(`/api/release/${id}/related`),
])

const item = releaseAsync.data
const releaseError = releaseAsync.error
const tracks = tracksAsync.data
const relatedReleases = computed(() => relatedAsync.data.value?.releases ?? [])
const relatedArtists = computed(() => relatedAsync.data.value?.artists ?? [])

if (releaseError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Release not found' })
}

const playCounts = ref<Record<string, number>>({})
const tracklistSlugs = computed(() => (item.value?.tracklist ?? []).map(t => t.slug).filter(Boolean))

onMounted(async () => {
  if (item.value) setCount(item.value.slug, item.value.like_count ?? 0)
  tracks.value?.forEach(t => setTrackCount(t.slug, t.like_count))

  if (tracklistSlugs.value.length) {
    playCounts.value = await $fetch<Record<string, number>>('/api/track-plays', {
      query: { slugs: tracklistSlugs.value.join(',') },
    }).catch(() => ({}))
  }
})

const player = ref<InstanceType<typeof AudioTrackPlaylist> | null>(null)

function playFromTracklist(slug: string) {
  const index = playerTracks.value.findIndex(t => t.slug === slug)
  if (index >= 0) player.value?.playTrack(index)
}

const playerTracks = computed(() =>
  (item.value?.tracklist ?? []).filter(t => t.url).map(t => ({
    title: `${t.artist} - ${t.title}`,
    url: t.url,
    slug: t.slug,
  }))
)

const allArtistsAsync = useFetch<Record<string, Artist> | Artist[]>('/api/artists-all', { server: false })
const allArtists = computed(() => toArray<Artist>(allArtistsAsync.data.value))
const titleArtists = computed(() =>
  (allArtists.value.length ? allArtists.value : relatedArtists.value),
)

const artistSlugByTrackNumber = computed(() =>
  new Map((tracks.value ?? []).map(t => [t.track_number, t.artist_slug]))
)

const { formatDate, formatYear } = useDate()
const formattedDate = computed(() => formatDate(item.value?.date))
const { embed: embedYTMusic } = useYouTubeMusicPlaylist(computed(() => item.value?.links?.youtube_music))

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
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
                class="transition-background ease-in-out duration-300 inline-flex items-center gap-2 h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-md border hover:bg-white/30 px-3 md:px-4 backdrop-blur-sm"
                :class="isLiked(item.slug) ? 'border-red-400/50 text-red-400' : ''"
                v-wave
              >
                <Icon name="lucide:thumbs-up" size="19" />
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

            <p v-if="item.links?.bandcamp_url || item.links?.bandcamp24_url || item.links?.beatport || item.links?.junodownload"><span class="text-[10px] md:text-[12px] text-foreground/50">Download</span></p>
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
            <p v-if="item.links?.spotify || item.links?.applemusic_url || item.links?.youtube_music || item.links?.deezer || item.links?.amazon_music || item.links?.tidal || item.links?.qobuz || item.links?.youtube || item.links?.soundcloud_url"><span class="text-[10px] md:text-[12px] text-foreground/50">Stream</span></p>
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
              img="https://content.sentimony.com/assets/img/svg-icons/qobuz-2.svg?01"
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
            <BtnPrimary
              v-if="item.links?.ektoplazm"
              :to="item.links?.ektoplazm"
              title="Ektoplazm"
              img="https://content.sentimony.com/assets/img/svg-icons/ektoplazm.svg?01"
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
                v-if="item.tracklist?.length"
                icon="sentimony:logo"
                title="Sentimony"
              >
                <AudioTrackPlaylist ref="player" :tracks="playerTracks" />
              </Tab>

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

        <div v-if="tracks?.length || item.tracklistCompact || item.tracklist?.length" class="Tracklist">
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
                class="flex items-center gap-1 text-xs border rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10 shrink-0"
                :class="isTrackLiked(track.slug) ? 'border-red-400/30 text-red-400' : 'border-foreground/20 text-foreground/40 hover:text-foreground/70'"
              >
                <Icon name="lucide:thumbs-up" size="12" />
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

          <template v-if="item.tracklist?.length">
            <p
              v-for="t in item.tracklist"
              :key="t.slug"
              class="flex items-center justify-between gap-2"
            >
              <span class="min-w-0">
                <small class="font-mono">{{ String(t.track_number).padStart(2, '0') }}.</small>
                <TrackArtists :name="t.artist" :slug="artistSlugByTrackNumber.get(t.track_number)" />
                -
                <TrackTitle :title="t.title" :artists="titleArtists" />
                <small v-if="t.bpm" class="font-mono"> ({{ t.bpm }}bpm)</small>
              </span>
              <span class="flex items-center gap-1 shrink-0">
                <TooltipProvider :delay-duration="0">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button
                        :disabled="!t.url"
                        @click="playFromTracklist(t.slug)"
                        class="flex items-center text-xs border rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10 border-foreground/20 text-foreground/40 hover:text-foreground/70 disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Play"
                      >
                        <Icon name="lucide:play" size="12" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Play</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <NuxtLink
                  :to="`/track/${t.slug}`"
                  class="flex items-center gap-1 text-xs border rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10 border-foreground/20 text-foreground/40 hover:text-foreground/70"
                >
                  <Icon name="lucide:audio-lines" size="12" />
                  View Track
                </NuxtLink>
                <TooltipProvider v-if="playCounts[t.slug]" :delay-duration="0">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <span class="flex items-center gap-1 text-xs font-mono px-2 py-1 text-foreground/40">
                        <Icon name="lucide:headphones" size="12" />
                        {{ playCounts[t.slug] }}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Plays</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <button
                  @click="toggleTrackLike(t.slug)"
                  class="flex items-center gap-1 text-xs border rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10"
                  :class="isTrackLiked(t.slug) ? 'border-red-400/30 text-red-400' : 'border-foreground/20 text-foreground/40 hover:text-foreground/70'"
                >
                  <Icon name="lucide:thumbs-up" size="12" />
                  <span v-if="trackLikeCount(t.slug) > 0">{{ trackLikeCount(t.slug) }}</span>
                </button>
              </span>
            </p>
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

        <div v-if="relatedReleases.length">
          <hr class="my-4 border-black/30">
          <p><small><b>Relative Releases:</b></small></p>
          <p
            v-for="(iii, index) in relatedReleases"
            :key="index"
          >
            <RelativeItem
              :i="iii"
              category="release"
            />
          </p>
        </div>

        <div v-if="relatedArtists.length">
          <hr class="my-4 border-black/30">
          <p><small><b>Relative Artists:</b></small></p>
          <p
            v-for="(iiii, index) in relatedArtists"
            :key="index"
            class="mb-2 mr-4 last:mr-0"
          >
            <RelativeItem
              :i="iiii"
              category="artist"
            />
          </p>
        </div>

        <div v-if="item.links?.beatspace || item.links?.psyshop">
          <hr class="my-4 border-black/30">
          <p><small><b>Links:</b></small></p>
          <p v-if="item.links?.beatspace"><a :href="item.links?.beatspace" target="_blank" rel="noopener">Beatspace</a></p>
          <p v-if="item.links?.psyshop"><a :href="item.links?.psyshop" target="_blank" rel="noopener">Psyshop</a></p>
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
