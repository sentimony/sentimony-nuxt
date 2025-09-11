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
  <NuxtLayout name="default">
    <div class="flex flex-col py-20">
      <div class="text-5xl mb-4">{{ error?.statusCode }}</div>
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
