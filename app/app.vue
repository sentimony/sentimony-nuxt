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
