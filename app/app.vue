<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ]
})
</script>

<template>
  <NuxtImg
    src="https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?02"
    class="fixed inset-0 -z-10 w-full h-full object-cover pointer-events-none"
    alt=""
    width="1920"
    height="1080"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
