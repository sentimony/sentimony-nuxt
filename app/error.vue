<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const handleError = (redirect: string) => clearError({ redirect })

const pageTitle = computed(() => String(props.error?.statusCode ?? 'Error'))
useHead({
  title: pageTitle,
  titleTemplate: (title?: string) => title ? `${title} · Sentimony Records` : 'Sentimony Records',
})
</script>

<template>
  <main class="max-w-sm flex flex-col justify-center min-h-screen mx-auto px-2 text-center text-foreground">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ error?.statusCode }}</h1>
    <p class="mb-6 text-muted-foreground">{{ error?.statusMessage }}</p>
    <div class="flex flex-wrap justify-center gap-2">
      <DefaultButton iconify="lucide:house" title="Go Home" @click="handleError('/')" />
      <DefaultButton iconify="lucide:disc-3" title="Releases" @click="handleError('/releases')" />
      <DefaultButton iconify="lucide:users" title="Artists" @click="handleError('/artists')" />
    </div>
  </main>
</template>
