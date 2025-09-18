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

<style lang="scss">
// html { @apply text-[16px] xl:text-[16px] }
body {
  @apply min-w-[320px] font-Montserrat antialiased text-xs md:text-sm lg:text-base text-white text-center bg-green-950
  bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-1-xs.jpg?alt=media&token=07b08683-4dc9-421d-a228-7834955efd4a')]
  sm:bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-1-sm.jpg?alt=media&token=1e7b3cfd-8e18-47fd-b81c-41f5c0e30e02')]
  md:bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-1-md.jpg?alt=media&token=a3cb2bcd-3fb9-437a-bd31-03fa4046e5ff')]
  lg:bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-1-lg.jpg?alt=media&token=228d2484-8839-4d8f-ac1e-edab2d8f54d9')]
  xl:bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-1-xl.jpg?alt=media&token=9531618a-36d2-44c2-85b5-e33c93242e55')]
  2xl:bg-[url('https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/backgrounds%2Ftrees-green_v5-1-2xl.jpg?alt=media&token=99ea89fb-d3aa-4379-ad26-3c24cc96f715')]
  bg-center bg-no-repeat bg-cover bg-fixed
}
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
