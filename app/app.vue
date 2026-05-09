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
    class="fixed inset-0 -z-10 object-cover w-full h-full pointer-events-none"
    alt=""
    aria-hidden="true"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
