<script setup lang="ts">
definePageMeta({
  layout: 'ddos',
})
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Tracks'
const PageDescription = 'Explore Sentimony Records tracks across dark progressive psytrance and psychill. Discover catalog highlights, follow new music and dive into our sound.'
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
  </div>
</template>

<style lang="scss"></style>
