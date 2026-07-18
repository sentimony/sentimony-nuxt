<script setup lang="ts">
import { createError } from '#app'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { isLiked, toggleLike, likeCount } = useEventLikes()

const eventAsync = await useEvent(id.value, { server: true })
const item = eventAsync.data
const eventError = eventAsync.error

if (eventError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}

const { formatDate, formatYear } = useDate()

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
  ogImage: () => item.value?.cover_og || item.value?.cover_th || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.cover_og || item.value?.cover_th || appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-[2] px-2 pb-7.5 md:pb-15">
      <div class="max-w-[640px] mx-auto relative" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <OpenImage
          :image_th="item.flyer_a_xl"
          :image_xl="item.flyer_a_xl"
          :alt="(item.title || 'event') + ' flyer'"
          class="float-left"
        />

        <p v-if="item.date">{{ formatDate(item?.date) }}</p>
        <p v-if="item.location">{{ item?.location }}</p>
        <p v-if="item.time">{{ item?.time }}</p>

        <div class="flex justify-start mb-4">
          <button
            @click="toggleLike(item.slug)"
            class="flex items-center gap-2 border rounded px-4 py-2 text-sm transition-colors duration-200 hover:bg-white/10"
            :class="isLiked(item.slug) ? 'border-red-400/50 text-red-400' : 'border-white/20 text-white/40 hover:text-white/70'"
            v-wave
          >
            <Icon name="lucide:thumbs-up" size="18" />
            {{ isLiked(item.slug) ? 'Liked' : 'Like' }}
            <span v-if="likeCount(item.slug) > 0" class="opacity-50">{{ likeCount(item.slug) }}</span>
          </button>
        </div>

        <div class="clear-left" />

      </div>
    </div>

    <ItemContent>

        <p v-if="item?.info"><small><b>Info:</b></small></p>
        <div v-if="item?.info" v-html="sanitizeHtml(item.info)" />

        <hr class="my-4 border-black/30">

        <OpenImage
          :image_th="item.flyer_b_xl"
          :image_xl="item.flyer_b_xl"
          :alt="(item.title || 'event') + ' flyer'"
          class="float-right"
        />
        <div class="clear-left" />

        <p v-if="(item?.lineup || []).length"><small><b>Artists:</b></small></p>
        <p v-for="(i, index) in item?.lineup || []" :key="i.musician || index">
          <span>{{ i.musician }}</span>
        </p>

        <hr class="my-4 border-black/30">

        <p v-if="(item?.links || []).length"><small><b>Links:</b></small></p>
        <p v-for="(ii, index) in item?.links || []" :key="ii.id || index">
          <a
            v-if="ii.url"
            :href="ii.url"
            target="_blank" rel="noopener"
            v-wave
          >{{ ii.id }}</a>
          <span v-else>{{ ii.id }}</span>
        </p>

    </ItemContent>

  </div>
</template>
