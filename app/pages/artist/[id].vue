<script setup lang="ts">
import { createError } from '#app'
import type { Release } from '~/types'

const { id } = useRoute().params
const { isLiked, toggleLike, likeCount, fetchCount } = useArtistLikes()

const artistAsync = await useArtist(id as string, { server: true })
const item = artistAsync.data
const artistError = artistAsync.error

if (artistError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
}

onMounted(() => {
  fetchCount(item.value!.slug)
})

const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))

const releasesSortedByDate = computed(() =>
  [...releases.value]
    // .filter(r => Boolean(r.visible))
    .sort((a, b) =>
      new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
)

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
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
    <div class="relative z-[2] px-2 pb-[30px] md:pb-[60px]">
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
              <button
                @click="toggleLike(item.slug)"
                class="flex items-center gap-2 border rounded px-4 py-2 text-sm transition-colors duration-200 hover:bg-white/10"
                :class="isLiked(item.slug) ? 'border-red-400/50 text-red-400' : 'border-white/20 text-white/40 hover:text-white/70'"
                v-wave
              >
                <Icon name="lucide:heart" mode="svg" :class="isLiked(item.slug) && '[&_path]:fill-current'" size="18" />
                {{ isLiked(item.slug) ? 'Liked' : 'Like' }}
                <span v-if="likeCount(item.slug) > 0" class="opacity-50">{{ likeCount(item.slug) }}</span>
              </button>
            </div>

              </div>

            </div>

            <div v-if="item.bandcamp_url">
              <p><span class="text-[10px] md:text-[12px] text-white/50">Follow and support:</span></p>
              <BtnPrimary
                :to="item.bandcamp_url"
                title="Bandcamp"
                iconify="simple-icons:bandcamp"
              />
            </div>

            <p><span class="text-[10px] md:text-[12px] text-white/50">Links</span></p>

            <BtnPrimary
              v-if="item.soundcloud_url"
              :to="item.soundcloud_url"
              title="SoundCloud"
              iconify="simple-icons:soundcloud"
            />

            <BtnPrimary
              v-if="item.spotify"
              :to="item.spotify"
              title="Spotify"
              iconify="simple-icons:spotify"
            />
            <BtnPrimary
              v-if="item.applemusic_url"
              :to="item.applemusic_url"
              title="Apple Music"
              iconify="simple-icons:applemusic"
            />
            <BtnPrimary
              v-if="item.youtubemusic_url"
              :to="item.youtubemusic_url"
              title="YT Music"
              iconify="simple-icons:youtubemusic"
            />
            <BtnPrimary
              v-if="item.youtube_url"
              :to="item.youtube_url"
              title="YouTube"
              iconify="simple-icons:youtube"
            />
            <BtnPrimary
              v-if="item.facebook"
              :to="item.facebook"
              title="Facebook"
              iconify="simple-icons:facebook"
            />
            <BtnPrimary
              v-if="item.instagram"
              :to="item.instagram"
              title="Instagram"
              iconify="simple-icons:instagram"
            />
            <BtnPrimary
              v-if="item.discogs"
              :to="item.discogs"
              title="Discogs"
              iconify="simple-icons:discogs"
            />
            <BtnPrimary
              v-if="item.wikipedia_url"
              :to="item.wikipedia_url"
              title="Wikipedia"
              iconify="fa6-brands:wikipedia-w"
            />



          </div>
          <div class="relative max-w-[540px] mx-auto w-full mb-4">

            <Tabs>

              <Tab
                v-if="item.youtube_playlist_id"
                icon="simple-icons:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video w-full"
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

    <div class="Content px-2 pt-2 pb-[30px] md:pb-[60px]" v-if="item">
      <SvgTriangle />
      <div class="max-w-[640px] mx-auto">

        <div v-if="item.information" v-html="item.information" />

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

        <!-- <div v-if="item.wikipedia_url || item.discogs">
          <hr class="my-4 border-black/30">
          <p><small><b>Links:</b></small></p>
          <p v-if="item.wikipedia_url"><a :href="item.wikipedia_url" target="_blank" rel="noopener">Wikipedia</a></p>
          <p v-if="item.discogs"><a :href="item.discogs" target="_blank" rel="noopener">Discogs</a></p>
        </div> -->

      </div>
    </div>

  </div>
</template>
