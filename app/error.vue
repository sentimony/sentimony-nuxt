<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"/></svg>'
const isError = props.error?.error

const handleError = () => clearError({ redirect: '/' })

const pageTitle = computed(() => String(props.error?.statusCode ?? 'Error'))
useHead({
  title: pageTitle,
  titleTemplate: (title?: string) => title ? `${title} · Sentimony Records` : 'Sentimony Records',
  bodyAttrs: {
    class: isError ? 'isError' : ''
  }
})
</script>

<template>
  <div class="max-w-sm flex flex-col justify-center min-h-screen mx-auto px-2 text-center text-white ">
    <div class="text-2xl md:text-4xl my-4 md:my-6">{{ error?.statusCode }}</div>
    <div class="mb-6">{{ error?.statusMessage }}</div>
    <div>
      <button
        @click="handleError"
        class="transition-background ease-in-out duration-300 inline-flex items-center h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-md border hover:bg-white/30 px-3 md:px-4 mb-2 mr-2 last:mr-0 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] backdrop-blur-sm"
        v-wave
      >
        <span class="mr-2" v-if="svg" v-html="svg"></span>
        <span>Go Home</span>
      </button>
    </div>
  </div>
</template>

<style>
body.isError {
  @apply
  font-montserrat
  bg-[url('https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?01')]
}
</style>
