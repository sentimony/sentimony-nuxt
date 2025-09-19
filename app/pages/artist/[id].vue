<script setup lang="ts">
import { computed } from 'vue'
import { createError } from '#app'

interface ArtistItem {
  slug: string
  title: string
  photo_og?: string
  photo_th?: string
  photo_xl?: string
  style?: string
  name?: string
  location?: string
  information?: string
  discogs?: string
  youtube_playlist_id?: string
  soundcloud_track_id?: string
  spotify?: string
  soundcloud_url?: string
  facebook?: string
  instagram?: string
  youtube_url?: string
  bandcamp_url?: string
}

const { id } = useRoute().params
const artistAsync = await useArtist<ArtistItem>(id as string, {
  server: true,
})
const item = artistAsync.data
const artistError = artistAsync.error

if (artistError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
}
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
  ogImage: () => item.value?.photo_og || item.value?.photo_xl || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.photo_og || item.value?.photo_xl || appConfig.brand.defaultOgImage,
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
          <div class="w-full mb-4">

            <OpenImage
              :image_th="item.photo_th"
              :image_xl="item.photo_xl"
              :alt="(item.title || 'Artist') + ' photo'"
              class="float-left"
            />

            <p v-if="item.name"><span class="text-white/50">Name:</span> {{ item.name }}</p>
            <p v-if="item.location"><span class="text-white/50">Location:</span> {{ item.location }}</p>
            <p v-if="item.style"><span class="text-white/50">Styles:</span> {{ item.style }}</p>

            <div class="clear-left" />

            <p><span class="text-[10px] md:text-[12px] text-white/50">Links</span></p>
            <BtnPrimary
              v-if="item.spotify"
              :to="item.spotify"
              title="Spotify"
              iconify="fa-brands:spotify"
            />
            <BtnPrimary
              v-if="item.soundcloud_url"
              :to="item.soundcloud_url"
              title="SoundCloud"
              iconify="fa-brands:soundcloud"
            />
            <BtnPrimary
              v-if="item.facebook"
              :to="item.facebook"
              title="Facebook"
              iconify="fa-brands:facebook"
            />
            <BtnPrimary
              v-if="item.instagram"
              :to="item.instagram"
              title="Instagram"
              iconify="fa-brands:instagram"
            />
            <BtnPrimary
              v-if="item.youtube_url"
              :to="item.youtube_url"
              title="YouTube"
              iconify="fa:youtube"
            />
            <BtnPrimary
              v-if="item.bandcamp_url"
              :to="item.bandcamp_url"
              title="Bandcamp"
              iconify="cib:bandcamp"
            />

          </div>
          <div class="max-w-[540px] mx-auto w-full mb-4">

            <Tabs>

              <Tab
                v-if="item.youtube_playlist_id"
                icon="fa:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video"
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
                icon="fa-brands:soundcloud"
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

              <Tab
                v-if="item.facebook"
                icon="fa-brands:facebook"
                title="Facebook"
              >
                <iframe
                  class="facebook-widget facebook-widget--size-sm md:hidden"
                  :src="'https://www.facebook.com/plugins/page.php?href=' + (item.facebook || '') + '%2F&tabs&width=287&height=214&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=197035617008842'"
                  :title="item.title + ' Facebook Mobile Iframe'"
                  scrolling="no"
                  frameborder="0"
                  allowTransparency="true"
                />
                <iframe
                  class="facebook-widget facebook-widget--size-md hidden md:block"
                  :src="'https://www.facebook.com/plugins/page.php?href=' + (item.facebook || '') + '%2F&tabs&width=500&height=214&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=197035617008842'"
                  :title="item.title + ' Facebook Desktop Iframe'"
                  scrolling="no"
                  frameborder="0"
                  allowTransparency="true"
                />
              </Tab>

            </Tabs>

          </div>
        </div>

      </div>
    </div>

    <div class="Content px-2 pt-2 pb-[30px] md:pb-[60px] bg-[#e0ebe0] text-black" v-if="item">
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
              v-if="i.artists.includes(item.slug)"
              :i="i"
              category="release"
            />
          </p>
        </div>

        <div v-if="item.discogs">
          <hr class="my-4 border-black/30">
          <p><small><b>Links:</b></small></p>
          <p><a :href="item.discogs" target="_blank" rel="noopener">Discogs</a></p>
        </div>

      </div>
    </div>

  </div>
</template>

<style lang="scss">
.facebook-widget {
  border: none;
  overflow: hidden;
  margin: 0 auto;

  &--size-sm {
    height: 98px;
    width: 287px;
  }

  &--size-md {
    width: 500px;
    height: 130px;
  }
}
</style>
