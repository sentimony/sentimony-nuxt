<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  // meta: [
  //   { name: 'apple-mobile-web-app-title', content: 'Sentimony Records' },
  // ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    // { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
    // { rel: 'shortcut icon', href: '/favicon.ico' },
    // { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    // { rel: 'manifest', href: '/site.webmanifest' },
  ]
})


// const loading = useLoadingIndicator({ duration: 2000 })
// loading.start()
// // ... await щось довге ...
// loading.finish()
</script>

<template>
  <!-- <NuxtLoadingIndicator  /> -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
body {
  @apply
  min-w-[320px] font-Montserrat antialiased text-xs md:text-sm lg:text-base text-white text-center
  bg-green-950
  bg-[url('https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?01')]
  /* bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-sm.webp?alt=media&token=46b43e97-4b63-4b09-a35e-fca9535c0d12')] */
  /* bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-lg.webp?alt=media&token=8482e0e2-dd3c-445c-8082-9c11b416b326')] */
  bg-center bg-no-repeat bg-cover bg-fixed
}

p { @apply mb-2 }

small { @apply opacity-60 }

.Content a { @apply text-blue-700 }
</style>
