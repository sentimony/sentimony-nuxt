<script setup lang="ts">
import { createError } from '#app'

const route = useRoute()
const id = computed(() => String(route.params.id))

const eventAsync = await useEvent(id.value, { server: true })
const item = eventAsync.data
const eventError = eventAsync.error

if (eventError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}
const { formatDate, formatYear } = useDate()

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
  ogImage: () => item.value?.cover_og || item.value?.cover_th || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.cover_og || item.value?.cover_th || appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})


// Template ref used in <img ref="triangleEl" .../>
// const triangleEl = ref<HTMLImageElement | null>(null)
</script>

<template>
  <div class="text-left border-t border-white/30">
    <div class="relative px-2 pb-[30px] md:pb-[60px]">
      <SvgTriangle />

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

        <div class="clear-left" />

      </div>
    </div>

    <div class="Content text-left px-2 pt-2 pb-[30px] md:pb-[60px]">
      <div class="max-w-[640px] mx-auto">

        <p v-if="item?.info"><small><b>Info:</b></small></p>
        <div v-if="item?.info" v-html="item?.info" />

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

      </div>
    </div>

  </div>
</template>
