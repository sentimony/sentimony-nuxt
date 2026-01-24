<script setup lang="ts">
import { createError } from '#app'
import type { Release } from '~/types'

const { slug } = useRoute().params

const { data: tag, error: tagError } = await useTag(slug as string, { server: true })

if (tagError.value || !tag.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
}

// Get all releases to filter by tag
const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))

// Extract release slugs from tag's releases URLs (e.g., "/api/release/slug" -> "slug")
const tagReleaseSlugs = computed(() => {
  if (!tag.value?.releases) return []
  return tag.value.releases.map((url) => url.split('/').pop() || '')
})

// Filter and sort releases that belong to this tag
const tagReleases = computed(() =>
  [...releases.value]
    .filter((r) => Boolean(r.visible) && tagReleaseSlugs.value.includes(r.slug))
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
)

// Convert country code to flag emoji
function countryCodeToFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// SEO meta
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()

const PageTitle = computed(() => tag.value?.title || 'Tag')
const PageDescription = computed(() => {
  const parts = [tag.value?.type?.title, tag.value?.title]
  if (tag.value?.description) parts.push(tag.value.description)
  return parts.filter(Boolean).join(' — ')
})

useSeoMeta({
  title: () => PageTitle.value,
  description: () => PageDescription.value,
  ogTitle: () => PageTitle.value,
  ogDescription: () => PageDescription.value,
  ogImage: () => tag.value?.image_url || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => PageTitle.value,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => tag.value?.image_url || appConfig.brand.defaultOgImage,
  twitterCard: 'summary',
})
</script>

<template>
  <div class="text-left border-t border-white/30">
    <div class="relative px-2 pb-[30px] md:pb-[60px]">
      <SvgTriangle />

      <div class="container max-w-7xl" v-if="tag">
        <!-- Breadcrumb -->
        <div class="text-sm text-white/50 my-4">
          <NuxtLink to="/tags" class="hover:text-white">Tags</NuxtLink>
          <span class="mx-2">→</span>
          <NuxtLink :to="`/tags`" class="hover:text-white">{{ tag.type?.title_plural }}</NuxtLink>
          <span class="mx-2">→</span>
          <span class="text-white">{{ tag.title }}</span>
        </div>

        <!-- Title with icon/flag -->
        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6 flex items-center justify-center gap-3">
          <!-- Country flag -->
          <span v-if="tag.country_code" class="text-3xl md:text-5xl">
            {{ countryCodeToFlag(tag.country_code) }}
          </span>
          <!-- Type icon -->
          <Icon
            v-else-if="tag.type?.slug === 'musicians'"
            name="mdi:account-music"
            class="text-3xl md:text-5xl text-white/70"
          />
          <Icon
            v-else-if="tag.type?.slug === 'styles'"
            name="mdi:music-note"
            class="text-3xl md:text-5xl text-white/70"
          />
          <span>{{ tag.title }}</span>
        </h1>

        <!-- Tag type badge -->
        <div class="text-center mb-6">
          <span class="inline-block px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
            {{ tag.type?.title }}
          </span>
        </div>

        <!-- Tag image if available -->
        <div v-if="tag.image_url" class="flex justify-center mb-6">
          <img
            :src="tag.image_url"
            :alt="tag.title"
            class="rounded-md shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] max-w-[200px] md:max-w-[300px]"
          >
        </div>

        <!-- Description -->
        <div v-if="tag.description" class="max-w-2xl mx-auto text-center mb-8 text-white/80">
          {{ tag.description }}
        </div>
      </div>
    </div>

    <!-- Releases section -->
    <div class="Content px-2 pt-2 pb-[30px] md:pb-[60px]" v-if="tag">
      <div class="container max-w-7xl">
        <h2 class="text-xl md:text-2xl mb-4">
          Releases
          <span class="text-white/50 text-base">({{ tagReleases.length }})</span>
        </h2>

        <!-- Releases grid -->
        <div
          v-if="tagReleases.length > 0"
          class="flex flex-wrap justify-center w-full"
        >
          <Item
            v-for="release in tagReleases"
            :key="release.slug"
            category="release"
            :i="release"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-8 text-black/50">
          No releases found for this tag
        </div>
      </div>
    </div>
  </div>
</template>
