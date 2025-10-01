<script setup lang="ts">
import { createError } from '#app'

const { id } = useRoute().params

interface VideoItemLinks {
  youtube?: string;
}

interface VideoItem {
  title: string;
  date?: string;
  cover_og?: string;
  cover_th?: string;
  cover_xl?: string;
  information?: string;
  credits?: string;
  links?: VideoItemLinks;
}

const videoAsync = await useVideo<VideoItem>(id as string, {
  server: true,
})
const item = videoAsync.data
const videoError = videoAsync.error

if (videoError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Video not found' })
}

// Compute embeddable YouTube URL from short link
const { embed } = useYouTube(computed(() => item.value?.links?.youtube))
const { formatDate, formatYear } = useDate()
const formattedDate = computed(() => formatDate(item.value?.date))

// SEO meta
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const year = computed(() => formatYear(item.value?.date))
const PageDescription = computed(() => [
  item.value?.title,
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
              :alt="(item.title || 'Video') + ' cover'"
              class="float-left"
            />

            <p><span class="text-white/50">Release Date:</span> {{ formattedDate }}</p>

            <div class="clear-left"/>

            <p><span class="text-[10px] md:text-[12px] text-white/50">Links</span></p>
            <BtnPrimary
              v-if="item.links?.youtube"
              :to="item.links?.youtube"
              title="YouTube"
              iconify="cib:bandcamp"
            />

          </div>
          <div class="max-w-[540px] mx-auto w-full mb-4">

            <Tabs>
              <Tab
                v-if="item.links?.youtube"
                icon="cib:bandcamp"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video"
                    :src="embed"
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

        <div v-if="item.information" v-html="item.information" />

        <div v-if="item.credits">
          <hr class="my-4 border-black/30">
          <p><small><b>Сredits:</b></small></p>
          <!-- <p
            v-for="(i, index) in item.credits"
            :key="index"
            v-html="i.p"
          /> -->
          <div v-html="item.credits" />
        </div>

      </div>
    </div>

  </div>
</template>
