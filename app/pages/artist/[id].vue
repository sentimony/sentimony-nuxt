<script setup lang="ts">
import { createError } from '#app'
import AudioTrackPlaylist from '~/components/AudioTrackPlaylist.vue'
import type { TitleSegment } from '~/utils/tracks'
import type { Release, Event } from '~/types'

type ArtistTrack = {
  slug: string
  title: string
  artist_name: string
  displaySegments: TitleSegment[]
  artistSegments: TitleSegment[]
  nameSegments: TitleSegment[]
  url: string
  release_slug: string
  cover: string | null
}

const { id } = useRoute().params
const { isLiked, toggleLike, likeCount } = useArtistLikes()

const [artistAsync, releasesAsync, eventsAsync] = await Promise.all([
  useArtist(id as string, { server: true }),
  useReleases(),
  useEvents(),
])

const item = artistAsync.data
const artistError = artistAsync.error
const releasesRaw = releasesAsync.data
const eventsRaw = eventsAsync.data

if (artistError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
}

const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const releasesSortedByDate = computed(() => visibleByDate(releases.value))

const hasLinks = computed(() => {
  const a = item.value
  return !!(
    a?.bandcamp_url ||
    a?.soundcloud_url ||
    a?.spotify ||
    a?.apple_music ||
    a?.youtubemusic_url ||
    a?.youtube_url ||
    a?.facebook ||
    a?.instagram ||
    a?.discogs ||
    a?.wikipedia_url
  )
})

const mixRelease = computed(() =>
  releasesSortedByDate.value.find(r => r.slug === item.value?.mix_release_slug)
)

const artistTracksAsync = useFetch<ArtistTrack[]>(`/api/artist/${id}/tracks`)
const sentimonyTracks = computed(() =>
  (artistTracksAsync.data.value ?? []).map(t => ({
    title: `${t.artist_name} - ${t.title}`,
    titleSegments: t.displaySegments,
    url: t.url,
    slug: t.slug,
    artist: t.artist_name,
    artistSegments: t.artistSegments,
    name: t.title,
    nameSegments: t.nameSegments,
    cover: t.cover ?? undefined,
    releaseLink: `/release/${t.release_slug}`,
    artistLink: item.value ? `/artist/${item.value.slug}` : undefined,
  }))
)
const hasSentimonyTracks = computed(() => sentimonyTracks.value.length > 0)

const portfolioReleases = computed(() => {
  if (item.value?.category !== 'designer') return []
  const slug = item.value.slug
  return releasesSortedByDate.value.filter(r =>
    r.artists?.includes(slug) && !!(r.cover_xl || r.cover_og)
  )
})

const events = computed(() => toArray<Event>(eventsRaw.value, 'events'))
const organizedEvents = computed(() => {
  const slug = item.value?.slug
  if (!slug) return []
  return events.value.filter(e => e.visible && e.organizer?.includes(slug))
})

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageDescription = computed(() => [
  item.value?.title,
  item.value?.style,
].filter(Boolean).join(' - '))
useSeoMeta({
  title: () => item.value?.title,
  description: () => PageDescription.value,
  ogTitle: () => item.value?.title,
  ogDescription: () => PageDescription.value,
  ogImage: () => item.value?.photo_og || item.value?.photo_xl || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.photo_og || item.value?.photo_xl || appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-2 px-2 pb-7.5 md:pb-15">
        <div class="container max-w-7xl" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-12 xl:mb-24 2xl:mb-36">

            <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">

              <div class="shrink-0">
                <OpenImage
                  :image_th="item.photo_th"
                  :image_xl="item.photo_xl"
                  :alt="(item.title || 'Artist') + ' photo'"
                />
              </div>

              <div class="flex-1 min-w-0">

            <p v-if="item.name"><span class="text-white/50">Name:</span> {{ item.name }}</p>
            <p v-if="item.location"><span class="text-white/50">Location:</span> {{ item.location }}</p>
            <p v-if="item.style"><span class="text-white/50">Styles:</span> {{ item.style }}</p>

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

            <p v-if="hasLinks"><span class="text-[10px] md:text-[12px] text-white/50">Links</span></p>

            <PrimaryButton
              v-if="item.bandcamp_url"
              :to="item.bandcamp_url"
              title="Bandcamp"
              iconify="simple-icons:bandcamp"
            />

            <PrimaryButton
              v-if="item.soundcloud_url"
              :to="item.soundcloud_url"
              title="SoundCloud"
              iconify="simple-icons:soundcloud"
            />

            <PrimaryButton
              v-if="item.spotify"
              :to="item.spotify"
              title="Spotify"
              iconify="simple-icons:spotify"
            />
            <PrimaryButton
              v-if="item.apple_music"
              :to="item.apple_music"
              title="Apple Music"
              iconify="simple-icons:applemusic"
            />
            <PrimaryButton
              v-if="item.youtubemusic_url"
              :to="item.youtubemusic_url"
              title="YT Music"
              iconify="simple-icons:youtubemusic"
            />
            <PrimaryButton
              v-if="item.youtube_url"
              :to="item.youtube_url"
              title="YouTube"
              iconify="simple-icons:youtube"
            />
            <PrimaryButton
              v-if="item.facebook"
              :to="item.facebook"
              title="Facebook"
              iconify="simple-icons:facebook"
            />
            <PrimaryButton
              v-if="item.instagram"
              :to="item.instagram"
              title="Instagram"
              iconify="simple-icons:instagram"
            />
            <PrimaryButton
              v-if="item.discogs"
              :to="item.discogs"
              title="Discogs"
              iconify="simple-icons:discogs"
            />
            <PrimaryButton
              v-if="item.wikipedia_url"
              :to="item.wikipedia_url"
              title="Wikipedia"
              iconify="simple-icons:wikipedia"
            />



          </div>
          <div class="relative max-w-135 mx-auto w-full mb-4">

            <Tabs>

              <Tab
                v-if="hasSentimonyTracks"
                :order="0"
                icon="sentimony:logo"
                title="Sentimony"
              >
                <AudioTrackPlaylist :tracks="sentimonyTracks" />
              </Tab>

              <Tab
                v-if="item.mix_audio_url"
                :order="1"
                icon="lucide:music"
                title="Mix"
              >
                <AudioMixPlayer
                  :src="item.mix_audio_url || ''"
                  :title="item.mix_title"
                  :tracklist="mixRelease?.tracklistCompact"
                />
              </Tab>

              <Tab
                v-if="item.youtube_playlist_id"
                :order="2"
                icon="simple-icons:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-0 aspect-video w-full"
                    :src="'https://www.youtube-nocookie.com/embed/videoseries?list=' + (item.youtube_playlist_id || '') + '&loop=1'"
                    :title="item.title + 'YouTube video player'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  />
                </div>
              </Tab>

              <Tab
                v-if="item.soundcloud_track_id"
                :order="3"
                icon="simple-icons:soundcloud"
                title="SoundCloud"
              >
                <iframe
                  width="100%"
                  height="300"
                  scrolling="no"
                  frameborder="no"
                  allow="autoplay"
                  :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + (item.soundcloud_track_id || '') + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true'"
                />
              </Tab>


            </Tabs>

          </div>
        </div>

      </div>
    </div>

    <ItemContent v-if="item">

      <div v-if="item.information">
        <div v-html="sanitizeHtml(item.information)" />
      </div>

      <div v-if="organizedEvents.length > 0">
        <hr class="my-4 border-black/30">
        <p><small><b>Organized Events:</b></small></p>
        <p
          v-for="e in organizedEvents"
          :key="e.slug"
        >
          <RelativeItem
            :i="e"
            category="event"
          />
        </p>
      </div>

      <div>
        <hr class="my-4 border-black/30">
        <p><small><b>Releases with {{ item.title }}:</b></small></p>
        <p
          v-for="(i, index) in releasesSortedByDate"
          :key="index"
        >
          <RelativeItem
            v-if="i.artists?.includes(item.slug)"
            :i="i"
            category="release"
          />
        </p>
      </div>

      <div v-if="portfolioReleases.length > 0">
        <hr class="my-4 border-black/30">
        <p><small><b>Portfolio:</b></small></p>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          <NuxtLink
            v-for="r in portfolioReleases"
            :key="r.slug"
            :to="'/release/' + r.slug"
            class="block aspect-square overflow-hidden rounded"
          >
            <img
              :src="thumb(r.cover_xl || r.cover_og)"
              :alt="r.title || ''"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </NuxtLink>
        </div>
      </div>

    </ItemContent>

  </div>
</template>
