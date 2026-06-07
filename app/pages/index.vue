<script setup lang="ts">
const logoOldUrl = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo.svg?01"
const logoOldAlt = "Sentimony Records logo svg"
const logoNewUrlv1 = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.1.svg?01"
const logoNewAltv1 = "Sentimony Records logo svg v3.1"
const logoNewUrlv2 = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01"
const logoNewAltv2 = "Sentimony Records logo svg v3.2"
const logoNewUrlv3 = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg?01"
const logoNewAltv3 = "Sentimony Records logo svg v3.3"
const aboutDescription = "<p>Sentimony Records is an independent psychedelic music label founded in Kyiv, Ukraine, in the autumn of 2006 by the visionary Ihor Orlovskyi, also known by his moniker 🇺🇦 <a href='/artist/irukanji'>Irukanji</a>.</p><p>The label's main mission is to contribute to the growth of talented psy-minded artists, enriching the global soundscape with unique and exciting musical journeys.</p><p>Over the years, Sentimony Records has focused on its most beloved psychedelic subgenres: <a href='/playlist/dark-prog-zenonesque'>DarkProg Psytrance</a> and <a href='/playlist/psychill-psybient'>Trippy Psychill</a>. Through a deep commitment to these styles, the label continues to captivate listeners and inspire the worldwide psychedelic music community.</p>"

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
const PageTitle = 'Home'
const PageDescription = 'Sentimony Records - an independent psychedelic music label from Kyiv since 2006. DarkProg psytrance and psychill releases, artists, videos and events.'
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

useHead({
  bodyAttrs: {
    class: 'homepage-route',
  },
})
</script>

<template>
  <div data-testid="homepage-about" class="relative overflow-hidden bg-white dark:bg-black">
    <div
      class="absolute inset-0 bg-[url('https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg')] bg-cover bg-center"
      aria-hidden="true"
    />
    <div class="absolute inset-0 bg-white/50 dark:bg-black/50" aria-hidden="true" />
    <div class="relative max-w-lg mx-auto px-2 py-10">
      <p>
        <img class="mx-auto invert dark:invert-0" :src="logoNewUrlv1" :alt="logoNewAltv1" width="60" height="60">
      </p>
      <div
        class="text-left indent-5 [&>p>a]:text-emerald-800 [&>p>a:hover]:text-emerald-950 dark:[&>p>a]:text-green-500 dark:[&>p>a:hover]:text-green-300"
        v-html="aboutDescription"
      />
      <NuxtLink to="/artist/irukanji" class="mt-8 mb-4 flex justify-center">
        <img
          src="https://content.sentimony.com/assets/img/artists/irukanji-01_th.jpg"
          alt="Irukanji avatar"
          width="80" height="80"
          class="size-20 rounded-full object-cover ring-1 ring-black/30 dark:ring-white/30"
        >
      </NuxtLink>
      <p>
        <img class="mx-auto invert dark:invert-0" :src="logoOldUrl" :alt="logoOldAlt" width="60" height="60">
      </p>
    </div>
  </div>
</template>
