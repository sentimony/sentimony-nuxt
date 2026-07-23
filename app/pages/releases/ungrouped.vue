<script setup lang="ts">
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'Ungrouped Releases'
const PageDescription = 'Sentimony Records releases that are not categorized as psytrance or psychill.'
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
    keyword="ungrouped"
    title="Ungrouped"
  />
</template>
