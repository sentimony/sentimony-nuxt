<script setup lang="ts">
import type { TitleSegment } from '~/utils/tracks'

const props = withDefaults(defineProps<{
  cover?: string
  releaseLink?: string
  releaseTitle?: string
  artistSegments: TitleSegment[]
  nameSegments: TitleSegment[]
  trackLink?: string
  coverSize?: number
}>(), {
  coverSize: 40,
})

const hasArtistLinks = computed(() => props.artistSegments.some(s => s.slug))
const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <TooltipProvider v-if="cover" :delay-duration="0">
      <Tooltip>
        <TooltipTrigger as-child>
          <component
            :is="releaseLink ? NuxtLink : 'div'"
            :to="releaseLink"
            class="shrink-0"
            :aria-label="releaseLink ? 'Open release' : undefined"
          >
            <img
              :src="thumb(cover)"
              alt="Release cover"
              :width="coverSize"
              :height="coverSize"
              class="rounded object-cover"
              :style="{ width: `${coverSize}px`, height: `${coverSize}px` }"
            />
          </component>
        </TooltipTrigger>
        <TooltipContent v-if="releaseTitle" side="top">
          {{ releaseTitle }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <div class="min-w-0 text-left text-sm leading-tight">
      <span class="block truncate font-bold">
        <template v-for="(segment, i) in artistSegments" :key="i">
          <component
            :is="segment.slug ? NuxtLink : 'span'"
            :to="segment.slug ? `/artist/${segment.slug}` : undefined"
            :class="segment.slug ? 'hover:underline' : (hasArtistLinks && 'font-normal opacity-60')"
          >{{ segment.text }}</component>
        </template>
      </span>
      <span class="block truncate opacity-60">
        <template v-for="(segment, i) in nameSegments" :key="i">
          <NuxtLink
            v-if="segment.slug"
            :to="`/artist/${segment.slug}`"
            class="hover:underline"
          >{{ segment.text }}</NuxtLink>
          <component
            v-else
            :is="trackLink ? NuxtLink : 'span'"
            :to="trackLink"
            :class="trackLink && 'hover:underline'"
          >{{ segment.text }}</component>
        </template>
      </span>
    </div>
  </div>
</template>
