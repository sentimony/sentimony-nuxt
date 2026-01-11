<script setup lang="ts">
import type { Release, Event, Video, NewsItem } from '~/types'

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()

const { data: releasesRaw } = await useReleases()
const { data: eventsRaw } = await useEvents()
const { data: videosRaw } = await useVideos()

const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const events = computed(() => toArray<Event>(eventsRaw.value, 'events'))
const videos = computed(() => toArray<Video>(videosRaw.value, 'videos'))

const newsItems = computed<NewsItem[]>(() => {
  const r = releases.value
    .filter(i => Boolean(i.visible) && !i.coming_soon)
    .map(i => ({
      date: i.date,
      slug: i.slug,
      title: i.title,
      href: `/release/${i.slug}`,
      category: 'release' as const,
      image: i.cover_th,
    }))

  const e = events.value
    .filter(i => Boolean(i.visible))
    .map(i => ({
      date: i.date,
      slug: i.slug,
      title: i.title,
      href: `/event/${i.slug}`,
      category: 'event' as const,
      image: i.flyer_a_xl,
    }))

  const v = videos.value
    .filter(i => Boolean(i.visible))
    .map(i => ({
      date: i.date,
      slug: i.slug,
      title: i.title,
      href: `/video/${i.slug}`,
      category: 'video' as const,
      image: i.cover_th,
    }))

  return [...r, ...e, ...v].sort(
    (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
  )
})

const { formatDate } = useDate()

const PageTitle = 'News'
const PageDescription = 'Stay updated with Sentimony Records: fresh relases, music videos and live performances across psytrance darkprog & psychill. Artists, gigs, mixes & more.'
useSeoMeta({
  title: PageTitle,
  description: PageDescription,
  ogTitle: PageTitle,
  ogDescription: PageDescription,
  ogImage: appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: PageTitle,
  twitterDescription: PageDescription,
  twitterImage: appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>

<template>
  <div class="container max-w-lg">

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class="pb-[30px] md:pb-[60px]">
      <div class="divide-y divide-white/10">
        <NuxtLink
          v-for="i in newsItems"
          :key="i.category + ':' + i.slug"
          :to="i.href"
          class="flex items-center justify-between p-4 group hover:bg-white/20"
          v-wave
        >
          <div class="flex items-center">

            <!-- <div class="w-12 rounded-md bg-white/5 ring-1 ring-white/10 flex items-center justify-center overflow-hidden"> -->
              <img v-if="i.image"
                :src="i.image"
                :alt="i.title + ' Thumbnail'"
                class="rounded-sm ring-1 ring-white/30 group-hover:ring-white/60"
                width="48" height="48"
                loading="lazy"
              >
              <div v-else class="h-6 w-6 rounded bg-white/10"></div>
            <!-- </div> -->
            <div class="text-left ml-4">
              <div class="text-xs md:text-sm text-white/50">{{ formatDate(i.date) }}</div>
              <div class="text-base md:text-lg font-medium text-white transition-colors">{{ i.title }}</div>
            </div>
          </div>
          <span class="ml-4 text-white/40 group-hover:text-white/70 transition-colors">
            <Icon name="ic:baseline-arrow-forward-ios" size="18" />
          </span>
        </NuxtLink>
      </div>
    </div>

  </div>
</template>
