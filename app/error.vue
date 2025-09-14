<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const pageTitle = computed(() => String(props.error?.statusCode ?? 'Error'))
useHead({
  title: pageTitle,
  // Ensure our title formatting persists and does not get cleared
  titleTemplate: (title?: string) => title ? `${title} | Sentimony Records` : 'Sentimony Records'
})
</script>

<template>
  <NuxtLayout name="empty">
    <div class="max-w-xs flex flex-col justify-center h-[100vh] mx-auto px-2">
      <div class="text-2xl md:text-4xl my-4 md:my-6">{{ error?.statusCode }}</div>
      <div class="mb-6">{{ error?.statusMessage }}</div>
      <div>
        <BtnPrimary
          url="/"
          title="Go Home"
          icon="fa7-solid:home"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss"></style>
