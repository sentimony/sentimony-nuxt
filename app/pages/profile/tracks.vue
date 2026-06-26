<script setup lang="ts">
import type { Track } from '~/types'

const { data: summary } = await useProfileSummary()
const tracks = usePaginatedLikes<Track>(
  '/api/track-likes/tracks',
  25,
  summary.value?.tracks ?? 0,
)

await tracks.ensureLoaded()
</script>

<template>
  <section aria-labelledby="liked-tracks-title" class="min-h-48">
    <h1 id="liked-tracks-title" class="sr-only">
      Liked tracks
    </h1>

    <div v-if="tracks.items.value.length" class="mx-auto max-w-2xl text-left">
      <NuxtLink
        v-for="(track, index) in tracks.items.value"
        :key="track.slug"
        :to="`/release/${track.release_slug}`"
        class="group grid grid-cols-[1.25rem_minmax(0,auto)_minmax(0,1fr)] items-baseline gap-x-3 rounded border-b border-black/5 px-2 py-2.5 transition-colors duration-150 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:grid-cols-[1.25rem_minmax(0,auto)_minmax(0,1fr)_auto] sm:gap-x-4 dark:border-white/5 dark:hover:bg-white/5"
      >
        <span class="shrink-0 text-right font-mono text-[10px] text-foreground/25">
          {{ index + 1 }}
        </span>
        <span class="shrink-0 text-xs text-foreground/50">
          {{ track.artist_name }}
        </span>
        <span class="min-w-0 truncate text-xs text-foreground/85">
          {{ track.title }}
        </span>
        <span
          v-if="track.bpm"
          class="col-start-3 font-mono text-[10px] text-foreground/25 sm:col-start-4"
        >
          {{ track.bpm }}bpm
        </span>
      </NuxtLink>
    </div>

    <ProfileCollectionStatus
      :loading="tracks.loading.value"
      :has-more="tracks.hasMore.value"
      :remaining="tracks.total.value - tracks.items.value.length"
      :empty="tracks.loaded.value && tracks.items.value.length === 0"
      @load-more="tracks.loadMore()"
    />
  </section>
</template>
