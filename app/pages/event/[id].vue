<script setup lang="ts">
import { computed } from 'vue'
import { createError } from '#app'

interface EventLink { id?: string; url?: string }
interface EventLineup { musician?: string }
interface EventItem {
  title?: string
  cover_og?: string
  cover_th?: string
  date?: string
  location?: string
  info?: string
  lineup?: EventLineup[]
  links?: EventLink[]
}

const route = useRoute()
const id = computed(() => String(route.params.id))
const eventAsync = await useEvent<EventItem>(id.value, {
  server: true,
})
const item = eventAsync.data
const eventError = eventAsync.error

if (eventError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}

useSeoMeta({
  title: item.value?.title,
  description: (item.value?.title ?? '') + ' description',
  ogImage: item.value?.cover_og,
})

const { formatDate } = useDate()

// Template ref used in <img ref="triangleEl" .../>
// const triangleEl = ref<HTMLImageElement | null>(null)
</script>

<template>
  <div class="text-left border-t border-white/30">
    <div class="relative px-2 pb-[30px] md:pb-[60px]">
      <SvgTriangle />

      <div class="max-w-[640px] mx-auto" v-if="item">

        <h1 class="text-center mt-[0.75em] mb-[0.75em]">{{ item.title }}</h1>

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
            v-if="item?.cover_th"
            :src="item?.cover_th"
            class="inline text-xs w-[120px] mr-1"
            :alt="item?.title"
          />
        </div>

        <p>{{ formatDate(item?.date) }}</p>
        <p>{{ item?.location }}</p>

      </div>
    </div>

    <div class="Content text-left px-2 pt-2 pb-[30px] md:pb-[60px] bg-[#e0ebe0] text-black">
      <div class="max-w-[640px] mx-auto">

        <p v-if="item?.info"><small><b>Info:</b></small></p>
        <div v-if="item?.info" v-html="item?.info" />

        <hr class="my-4 border-black/30">

        <p v-if="(item?.lineup || []).length"><small><b>Artists:</b></small></p>
        <p v-for="(i, index) in item?.lineup || []" :key="i.musician || index">
          <span>{{ i.musician }}</span>
        </p>

        <hr class="my-4 border-black/30">

        <p v-if="(item?.links || []).length"><small><b>Links:</b></small></p>
        <p v-for="(ii, index) in item?.links || []" :key="ii.id || index">
          <a
            v-if="ii.url" :href="ii.url"
            target="_blank" rel="noopener"
            v-wave
          >{{ ii.id }}</a>
          <span v-else>{{ ii.id }}</span>
        </p>

      </div>
    </div>

  </div>
</template>

<style lang="scss"></style>
