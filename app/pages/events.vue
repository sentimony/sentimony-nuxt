<script setup lang="ts">
import type { Event } from '~/types'

const { data: eventsRaw } = await useEvents()
const events = computed(() => toArray<Event>(eventsRaw.value, 'events'))
const eventsSortedByDate = computed(() => visibleByDate(events.value))
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'Events'
const PageDescription = 'Sentimony Records events and gigs: label nights, festival shows and live performances across psytrance darkprog and psychill. Dates, venues, lineups.'
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
  <div class="container max-w-[112rem]">

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class="flex flex-wrap justify-center w-full pb-7.5 md:pb-15">
      <!-- <p
        v-for="i in eventsSortedByDate"
        :key="i.slug"
      > -->
        <Item
          v-for="i in eventsSortedByDate"
          :key="i.slug"
          category="event"
          :i="i"
        />
        <!-- <NuxtLink
          :to="'/event/' + i.slug"
          class=""
          v-wave
        >
          <img v-if="i.flyer_xl" :src="i.flyer_xl" :alt="i.title" width="120" class="mx-auto">
          <span class="">{{ formatDate(i.date) }} @ {{ i.title }}</span>
        </NuxtLink> -->
      <!-- </p> -->
    </div>

  </div>
</template>
