<script setup lang="ts">
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'Psytrance Releases'
const PageDescription = 'Dark progressive psytrance, forest psy and zenonesque releases from Sentimony Records.'
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
  twitterCard: 'summary',
})
</script>

<template>
  <ReleasesFiltered
    keyword="psytrance"
    title="Psytrance"
    description="Dark progressive psytrance, forest psy and zenonesque releases from Sentimony Records."
  />
</template>
