<script setup lang="ts">
import { createError } from '#app'
import PagePlayer from '~/components/players/PagePlayer.vue'
import { toArray } from '~/composables/toArray'
import type { Artist } from '~/types'

const { id } = useRoute().params
const { isLiked, toggleLike, likeCount } = useLikes()
const { isTrackLiked, toggleTrackLike, trackLikeCount } = useTrackLikes()

type RelatedRelease = { slug: string, title?: string, cover_xl?: string, date?: string }
type RelatedArtist = { slug: string, title?: string, photo_xl?: string }
type RelatedResponse = { releases: RelatedRelease[], artists: RelatedArtist[] }

const releaseAsync = await useRelease(id as string, { server: true })
const relatedAsync = useFetch<RelatedResponse>(`/api/release/${id}/related`, { lazy: true, server: false })

const item = releaseAsync.data
const releaseError = releaseAsync.error
const relatedReleases = computed(() => relatedAsync.data.value?.releases ?? [])
const relatedArtists = computed(() => relatedAsync.data.value?.artists ?? [])

if (releaseError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Release not found' })
}

const playCounts = ref<Record<string, number>>({})
const tracklistSlugs = computed(() => (item.value?.tracklist ?? []).map(t => t.slug).filter(Boolean))

onMounted(async () => {
  if (tracklistSlugs.value.length) {
    playCounts.value = await $fetch<Record<string, number>>('/api/track-plays', {
      query: { slugs: tracklistSlugs.value.join(',') },
    }).catch(() => ({}))
  }
})

const player = ref<InstanceType<typeof PagePlayer> | null>(null)

function playFromTracklist(slug: string) {
  const index = playerTracks.value.findIndex(t => t.slug === slug)
  if (index >= 0) player.value?.playTrack(index)
}

const route = useRoute()
const releaseCover = computed(() => item.value?.cover_th || item.value?.cover_xl)

const playerTracks = computed(() =>
  (item.value?.tracklist ?? []).filter(t => t.url).map((t) => {
    return {
      title: `${t.artist} - ${t.title}`,
      titleSegments: splitTitleByArtists(`${t.artist} - ${t.title}`, titleArtists.value),
      url: t.url,
      slug: t.slug,
      artist: t.artist,
      artistSegments: splitTitleByArtists(t.artist, titleArtists.value),
      name: t.title,
      nameSegments: splitTitleByArtists(t.title, titleArtists.value),
      cover: releaseCover.value,
      releaseLink: route.path,
      releaseTitle: item.value?.title,
      artistLink: t.artist_slug ? `/artist/${t.artist_slug}` : undefined,
    }
  })
)

const allArtistsAsync = useFetch<Record<string, Artist> | Artist[]>('/api/artists-all', { server: false })
const allArtists = computed(() => toArray<Artist>(allArtistsAsync.data.value))
const titleArtists = computed(() =>
  (allArtists.value.length ? allArtists.value : relatedArtists.value),
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
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-[2] px-2">
      <div class="container max-w-7xl" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-12 xl:mb-24 2xl:mb-36 pr-2">

            <div class="flex flex-col sm:flex-row">

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
              <LikeButton
                size="lg"
                :liked="isLiked(item.slug)"
                :count="likeCount(item.slug)"
                @like="toggleLike(item.slug)"
              />
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

            <EntityLinks :links="item.links" />

          </div>
          <div class="relative max-w-[540px] mx-auto w-full mb-4">

            <Tabs>

              <Tab
                icon="sentimony:logo"
                title="Sentimony"
              >
                <PagePlayer ref="player" :tracks="playerTracks" :play-counts="playCounts" />
              </Tab>

              <Tab
                v-if="item.links?.bandcamp_id"
                icon="simple-icons:bandcamp"
                title="Bandcamp"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] w-[100%]"
                    :class="'BandcampIframe tracks-' + item.tracks_number"
                    :src="'https://bandcamp.com/EmbeddedPlayer/album=' + (item.links?.bandcamp_id || '') + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/transparent=true/'"
                    seamless
                    :title="item.title + ' Bandcamp Iframe'"
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

        <div v-if="item.tracklist?.length || item.tracklistCompact" class="Tracklist">
          <hr class="my-4 border-black/30">
          <p><small><b>Tracklist:</b></small></p>

          <template v-if="item.tracklistCompact && !item.tracklist?.length">
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
                <TrackArtists :name="t.artist" :slug="t.artist_slug" />
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
                        class="flex items-center text-xs rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10 text-foreground/40 hover:text-foreground/70 disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Play"
                      >
                        <Icon name="lucide:circle-play" size="16" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Play</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <NuxtLink
                  :to="`/track/${t.slug}`"
                  class="flex items-center gap-1 text-xs border border-transparent rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10 hover:border-foreground/20 text-foreground/40 hover:text-foreground/70"
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
                  class="flex items-center gap-1 text-xs border border-transparent rounded px-2 py-1 transition-colors duration-200 text-foreground/40 hover:text-foreground/70 hover:border-foreground/20 hover:bg-foreground/10"
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
