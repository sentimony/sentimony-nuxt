<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"/></svg>'

const pageTitle = computed(() => String(props.error?.statusCode ?? 'Error'))
useHead({
  title: pageTitle,
  // Ensure our title formatting persists and does not get cleared
  titleTemplate: (title?: string) => title ? `${title} · Sentimony Records` : 'Sentimony Records'
})
</script>

<template>
  <NuxtLayout name="empty">
    <div class="max-w-xs flex flex-col justify-center h-[100vh] mx-auto px-2">
      <div class="text-2xl md:text-4xl my-4 md:my-6">{{ error?.statusCode }}</div>
      <div class="mb-6">{{ error?.statusMessage }}</div>
      <div>
        <!-- <BtnPrimary
          to="/"
          title="Go Home"
          iconify="ic:sharp-home"
          img="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg?01"
          :svg="svg"
        /> -->
        <BtnPrimary
          to="/"
          title="Go Home"
          :svg="svg"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss"></style>
