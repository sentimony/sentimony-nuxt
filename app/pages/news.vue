<script setup lang="ts">
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()

// Load three collections
const { data: releasesRaw } = await useReleases()
const { data: eventsRaw } = await useEvents()
const { data: videosRaw } = await useVideos()

const releases = computed(() => toArray(releasesRaw.value, 'releases'))
const events = computed(() => toArray(eventsRaw.value, 'events'))
const videos = computed(() => toArray(videosRaw.value, 'videos'))

type NewsItem = {
  date?: string | number | Date
  slug: string
  title: string
  href: string
  category: 'release' | 'event' | 'video'
  image?: string
}

const newsItems = computed<NewsItem[]>(() => {
  const r = releases.value
    .filter((i: any) => Boolean(i?.visible))
    .map((i: any) => ({
      date: i?.date,
      slug: i?.slug,
      title: i?.title,
      href: `/release/${i?.slug}`,
      category: 'release' as const,
      image: i?.cover_th || i?.photo_th,
    }))

  const e = events.value
    .filter((i: any) => Boolean(i?.visible))
    .map((i: any) => ({
      date: i?.date,
      slug: i?.slug,
      title: i?.title,
      href: `/event/${i?.slug}`,
      category: 'event' as const,
      image: i?.photo_th || i?.cover_th,
    }))

  const v = videos.value
    .filter((i: any) => Boolean(i?.visible))
    .map((i: any) => ({
      date: i?.date,
      slug: i?.slug,
      title: i?.title,
      href: `/video/${i?.slug}`,
      category: 'video' as const,
      image: i?.cover_th || i?.photo_th,
    }))

  return [...r, ...e, ...v].sort(
    (a, b) => new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
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
          class="flex items-center justify-between gap-4 py-4 md:py-6 group"
          v-wave
        >
          <div class="flex items-center gap-4">
            <div class="h-10 w-10 md:h-12 md:w-12 rounded-md bg-white/5 ring-1 ring-white/10 flex items-center justify-center overflow-hidden">
              <img v-if="i.image" :src="i.image" :alt="i.title + ' Thumbnail'" class="h-full w-full object-cover" />
              <div v-else class="h-6 w-6 rounded bg-white/10"></div>
            </div>
            <div class="text-left">
              <div class="text-base md:text-lg font-medium text-white transition-colors group-hover:text-white">{{ i.title }}</div>
              <div class="text-xs md:text-sm text-white/50">{{ formatDate(i.date) }}</div>
            </div>
          </div>
          <span class="text-white/40 group-hover:text-white/70 transition-colors">›</span>
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<style lang="scss"></style>
