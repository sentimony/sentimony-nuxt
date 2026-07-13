<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '~/components/ui/sonner'

const img = useImage()
const forestBg = img(
  'https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg',
  { format: 'webp', width: 1920, quality: 60 },
)

useHead({
  htmlAttrs: { lang: 'en' },
  style: [
    { textContent: `:root{--forest-bg:url("${forestBg}")}` },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-center" />
  <AudioBridge />
</template>
