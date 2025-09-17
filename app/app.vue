<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  // meta: [
  //   { name: 'apple-mobile-web-app-title', content: 'Sentimony Records' },
  // ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
    // { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' },
    // { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
    // { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
    // { rel: 'manifest', href: '/favicon/site.webmanifest' },
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

<style lang="scss">
// html { @apply text-[16px] xl:text-[16px] }
body { @apply min-w-[320px] font-Montserrat antialiased text-xs md:text-sm lg:text-base text-white text-center bg-green-950 bg-[url('https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?01')] bg-center bg-no-repeat bg-cover bg-fixed }
// h1, h2, h3, h4, h5, h6, p { @apply mb-[.3rem] md:mb-[.5rem] }
// h1, h2, h3, h4, h5, h6 { @apply font-normal }
// h1 { @apply text-[18px] md:text-[32px] my-[.5em] }
// h2 { @apply text-[1.5em] }
// h3 { @apply text-[1.17em] }
// h4 { @apply text-[1em] }
// h5 { @apply text-[0.83em] }
// h6 { @apply text-[0.67em] }

p { @apply mb-2 }

small { @apply opacity-60 }

// .container { @apply max-w-7xl }
.Content a { @apply text-blue-700 }

// @theme {
//   --container-8xl: 96rem;
// }

</style>
