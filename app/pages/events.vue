<script setup lang="ts">
const { data: eventsRaw } = await useEvents()
const events = computed(() => toArray(eventsRaw.value, 'events'))
const eventsSortedByDate = computed(() =>
  [...events.value]
    .filter((r: any) => Boolean(r?.visible))
    .sort((a: any, b: any) =>
      new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime()
    )
)
const { formatDate } = useDate()
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
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
  <div class="container">

    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ PageTitle }}</h1>

    <div class=" pb-[30px] md:pb-[60px]">
      <p
        v-for="i in eventsSortedByDate"
        :key="i.slug"
      >
        <NuxtLink
          :to="'/event/' + i.slug + '/'"
          class=""
          v-wave
        >
          <!-- <NuxtImg
            v-if="i.cover_th"
            :src="i.cover_th"
            class="inline text-xs w-5 mr-1"
            sizes="xs:20px"
            densities="x2"
            format="webp"
            :alt="i.title"
          /> -->
          <span class="">{{ formatDate(i.date) }} @ {{ i.title }}</span>
        </NuxtLink>
      </p>
    </div>

  </div>
</template>

<style lang="scss"></style>
