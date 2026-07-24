<script setup lang="ts">
import { createError } from '#app'

const { id } = useRoute().params
const { isLiked, toggleLike, likeCount } = useVideoLikes()

const videoAsync = await useVideo(id as string, { server: true })
const item = videoAsync.data
const videoError = videoAsync.error

if (videoError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Video not found' })
}

const { embed } = useYouTube(computed(() => item.value?.links?.youtube))
const { formatDate, formatYear } = useDate()
const formattedDate = computed(() => formatDate(item.value?.date))

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const year = computed(() => formatYear(item.value?.date))
const PageDescription = computed(() => [
  item.value?.title,
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
})
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-[2] px-2 pb-7.5 md:pb-15">
      <div class="container max-w-7xl" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-12 xl:mb-24 2xl:mb-36">

            <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">

              <div class="shrink-0">
                <OpenImage
                  :image_th="item.cover_th"
                  :image_xl="item.cover_xl"
                  :alt="(item.title || 'Video') + ' cover'"
                  ratio="video"
                />
              </div>

              <div class="flex-1 min-w-0">

                <p><span class="text-foreground/50">Release Date:</span> {{ formattedDate }}</p>

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

            <p><span class="text-[10px] md:text-[12px] text-foreground/50">Links</span></p>
            <PrimaryButton
              v-if="item.links?.youtube"
              :to="item.links?.youtube"
              title="YouTube"
              iconify="simple-icons:youtube"
            />

          </div>
          <div class="relative max-w-[540px] mx-auto w-full mb-4">

            <Tabs>
              <Tab
                v-if="item.links?.youtube"
                icon="simple-icons:youtube"
                title="YouTube"
              >
                <div class="rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]">
                  <iframe
                    class="border-[0px] aspect-video w-full"
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

    <ItemContent v-if="item">

        <div v-if="item.information" v-html="sanitizeHtml(item.information)" />

        <div v-if="item.credits">
          <hr class="my-4 border-black/30">
          <p><small><b>Сredits:</b></small></p>
          <!-- <p
            v-for="(i, index) in item.credits"
            :key="index"
            v-html="sanitizeHtml(i.p)"
          /> -->
          <div v-html="sanitizeHtml(item.credits)" />
        </div>

    </ItemContent>

  </div>
</template>
