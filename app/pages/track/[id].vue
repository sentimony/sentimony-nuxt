<script setup lang="ts">
import { createError } from '#app'
import PagePlayer from '~/components/player/PagePlayer.vue'
import { toArray } from '~/composables/toArray'
import type { Artist } from '~/types'

const { id } = useRoute().params
const {
  isTrackLiked,
  toggleTrackLike,
  trackLikeCount,
} = useTrackLikes()

const trackAsync = await useTrack(id as string, { server: true })
const data = trackAsync.data
const trackError = trackAsync.error

if (trackError.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Track not found' })
}

if (!data.value.track && !data.value.redirect) {
  throw createError({ statusCode: 404, statusMessage: 'Track not found' })
}

if (data.value.redirect) {
  await navigateTo(`/track/${data.value.redirect}`, { redirectCode: 301, replace: true })
}

const track = computed(() => data.value!.track ?? ({} as NonNullable<typeof data.value.track>))
const release = computed(() => data.value!.release)
const artists = computed(() => data.value!.artists ?? [])

const { formatDate, formatYear } = useDate()
const releaseDate = computed(() => formatDate(release.value?.date))
const releaseYear = computed(() => formatYear(release.value?.date))

const primaryArtist = computed(() => artists.value[0])
const artistsTitleLine = computed(() =>
  artists.value.map(a => a.title).filter(Boolean).join(' & ') || track.value.artist_name,
)

const releaseCover = computed(() => release.value?.cover_th || release.value?.cover_xl)

const allArtistsAsync = useFetch<Record<string, Artist> | Artist[]>('/api/artists-all', { server: false })
const allArtists = computed(() => toArray<Artist>(allArtistsAsync.data.value))
const titleArtists = computed(() => (allArtists.value.length ? allArtists.value : artists.value))

const playerTracks = computed(() => {
  const t = track.value
  if (!t.audio_url) return []
  return [{
    title: `${t.artist_name} - ${t.title}`,
    titleSegments: splitTitleByArtists(`${t.artist_name} - ${t.title}`, titleArtists.value),
    url: t.audio_url,
    slug: t.slug,
    artist: t.artist_name,
    artistSegments: splitTitleByArtists(t.artist_name, titleArtists.value),
    name: t.title,
    nameSegments: splitTitleByArtists(t.title, titleArtists.value),
    cover: releaseCover.value,
    releaseLink: release.value ? `/release/${release.value.slug}` : undefined,
    releaseTitle: release.value?.title,
    artistLink: t.artist_slug ? `/artist/${t.artist_slug.split(',')[0]!.trim()}` : undefined,
  }]
})

const playCounts = ref<Record<string, number>>({})

onMounted(async () => {
  if (track.value.slug) {
    playCounts.value = await $fetch<Record<string, number>>('/api/track-plays', {
      query: { slugs: track.value.slug },
    }).catch(() => ({}))
  }
})

const { embed: embedYTMusic } = useYouTubeMusicPlaylist(
  computed(() => release.value?.links?.youtube_music),
)

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageDescription = computed(() => [
  track.value.title,
  artistsTitleLine.value,
  release.value?.title,
  releaseYear.value,
].filter(Boolean).join(' - '))

useSeoMeta({
  title: () => `${track.value.title} - ${artistsTitleLine.value}`,
  description: () => PageDescription.value,
  ogTitle: () => `${track.value.title} - ${artistsTitleLine.value}`,
  ogDescription: () => PageDescription.value,
  ogImage: () => release.value?.cover_og || release.value?.cover_xl || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => `${track.value.title} - ${artistsTitleLine.value}`,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => release.value?.cover_og || release.value?.cover_xl || appConfig.brand.defaultOgImage,
  twitterCard: 'summary',
})

const hasBandcamp = computed(() => Boolean(release.value?.links?.bandcamp_id))
const hasSoundcloud = computed(() => Boolean(release.value?.links?.soundcloud_playlist_id))
const hasYoutube = computed(() => Boolean(release.value?.links?.youtube_playlist_id))
const hasYTMusic = computed(() => Boolean(release.value?.links?.youtube_music))
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-[2] px-2">
      <div class="container max-w-7xl">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ artistsTitleLine }} - {{ track.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-12 xl:mb-24 2xl:mb-36 pr-2">

            <div class="flex flex-col sm:flex-row">

              <div class="shrink-0">
                <OpenImage
                  v-if="release"
                  :image_th="release.cover_th"
                  :image_xl="release.cover_xl"
                  :alt="(release.title || 'Release') + ' cover'"
                />
              </div>

              <div class="flex-1 min-w-0">

                <p v-if="release"><span class="text-foreground/50">Release:</span>
                  <NuxtLink :to="`/release/${release.slug}`" class="ml-1 hover:underline">{{ release.title }}</NuxtLink>
                </p>
                <p v-if="releaseDate"><span class="text-foreground/50">Release Date:</span> {{ releaseDate }}</p>
                <p v-if="release?.cat_no"><span class="text-foreground/50">Catalog Number:</span> {{ release.cat_no }}</p>
                <p v-if="release?.style"><span class="text-foreground/50">Styles:</span> {{ release.style }}</p>
                <p v-if="track.bpm"><span class="text-foreground/50">BPM:</span> {{ track.bpm }}</p>
                <p><span class="text-foreground/50">Track No:</span> {{ track.track_number }}</p>

              </div>

            </div>

            <div class="flex justify-start mt-4 mb-2">
              <LikeButton
                size="lg"
                :liked="isTrackLiked(track.slug)"
                :count="trackLikeCount(track.slug)"
                @like="toggleTrackLike(track.slug)"
              />
            </div>

            <EntityLinks :links="release?.links" />

          </div>
          <div class="relative max-w-[540px] mx-auto w-full mb-4">

            <Tabs>

              <Tab
                icon="sentimony:logo"
                title="Sentimony"
              >
                <PagePlayer :tracks="playerTracks" :play-counts="playCounts" :show-index="false" />
              </Tab>

              <Tab
                v-if="hasBandcamp"
                icon="simple-icons:bandcamp"
                title="Bandcamp"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] w-[100%]"
                    :class="'BandcampIframe tracks-' + (release?.tracks_number || 1)"
                    :src="'https://bandcamp.com/EmbeddedPlayer/album=' + (release?.links?.bandcamp_id || '') + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/track=' + track.track_number + '/transparent=true/'"
                    seamless
                    :title="track.title + ' Bandcamp Iframe'"
                  />
                </div>
              </Tab>

              <Tab
                v-if="hasSoundcloud"
                icon="simple-icons:soundcloud"
                title="SoundCloud"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] w-[100%]"
                    :class="'SoundcloudIframe tracks-' + (release?.tracks_number || 1)"
                    scrolling="no"
                    height="450"
                    allow="autoplay"
                    :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + (release?.links?.soundcloud_playlist_id || '') + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'"
                    :title="track.title + ' SoundCloud Iframe'"
                  />
                </div>
              </Tab>

              <Tab
                v-if="hasYoutube"
                icon="simple-icons:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video w-full"
                    :src="'https://www.youtube-nocookie.com/embed/videoseries?list=' + (release?.links?.youtube_playlist_id || '') + '&loop=1'"
                    :title="track.title + ' YouTube video player'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  />
                </div>
              </Tab>

              <Tab
                v-if="hasYTMusic"
                icon="simple-icons:youtubemusic"
                title="YT Music"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video w-full"
                    :src="embedYTMusic"
                    :title="track.title + ' YouTube Music player'"
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

    <ItemContent>

        <p class="text-[11px] md:text-[13px] text-foreground/60">
          <span>Track</span>
          <span v-if="release"> · </span>
          <NuxtLink
            v-if="release"
            :to="`/release/${release.slug}`"
            class="hover:text-foreground transition-colors"
          >{{ release.title }}</NuxtLink>
          <span v-if="releaseYear"> · {{ releaseYear }}</span>
          <span v-if="track.bpm"> · {{ track.bpm }} bpm</span>
        </p>

        <div v-if="release">
          <hr class="my-4 border-black/30">
          <p><small><b>From release:</b></small></p>
          <p>
            <RelativeItem :i="release" category="release" />
          </p>
        </div>

        <div v-if="artists.length">
          <hr class="my-4 border-black/30">
          <p><small><b>Artists:</b></small></p>
          <p
            v-for="artist in artists"
            :key="artist.slug"
            class="mb-2 mr-4 last:mr-0"
          >
            <RelativeItem :i="artist" category="artist" />
          </p>
        </div>

        <div v-if="primaryArtist?.bandcamp_url">
          <hr class="my-4 border-black/30">
          <p><small><b>Follow {{ primaryArtist.title }}:</b></small></p>
          <p>
            <a :href="primaryArtist.bandcamp_url" target="_blank" rel="noopener" class="hover:underline">Bandcamp</a>
            <span v-if="primaryArtist.soundcloud_url"> · </span>
            <a v-if="primaryArtist.soundcloud_url" :href="primaryArtist.soundcloud_url" target="_blank" rel="noopener" class="hover:underline">SoundCloud</a>
            <span v-if="primaryArtist.spotify"> · </span>
            <a v-if="primaryArtist.spotify" :href="primaryArtist.spotify" target="_blank" rel="noopener" class="hover:underline">Spotify</a>
          </p>
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
</style>
