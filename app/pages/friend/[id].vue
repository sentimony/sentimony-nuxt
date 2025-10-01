<script setup lang="ts">
import { createError } from '#app'
interface FriendItem {
  title: string
  cover_og?: string
  cover_th?: string
}

const { id } = useRoute().params
const friendAsync = await useFriend<FriendItem>(id as string, {
  server: true,
})
const item = friendAsync.data
const friendError = friendAsync.error

if (friendError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Friend not found' })
}
// SEO meta
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageDescription = computed(() => [item.value?.title].filter(Boolean).join(' — '))
useSeoMeta({
  title: () => item.value?.title,
  description: () => PageDescription.value,
  ogTitle: () => item.value?.title,
  ogDescription: () => PageDescription.value,
  ogImage: () => item.value?.cover_og || item.value?.cover_th || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.cover_og || item.value?.cover_th || appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>

<template>
  <div class="text-left border-t border-white/30">
    <div class="relative px-2 pb-[30px] md:pb-[60px]">
      <SvgTriangle />

      <div class="max-w-[640px] mx-auto relative" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div>
          <!-- <NuxtImg
            v-if="item.cover_th"
            :src="item.cover_th"
            class="inline text-xs w-[120px] mr-1"
            sizes="xs:120px"
            densities="x2"
            format="webp"
            :alt="item.title"
          /> -->
          <img
            v-if="item.cover_th"
            :src="item.cover_th"
            class="inline text-xs w-[120px] mr-1"
            :alt="item.title"
          />

        </div>
      </div>
    </div>

    <div class="Content text-left px-2 pt-2 pb-[30px] md:pb-[60px]">
      <div class="max-w-[640px] mx-auto">

        <p>{{ item.title }}</p>

      </div>
    </div>

  </div>
</template>
