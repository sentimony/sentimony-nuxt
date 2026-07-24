<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { QueueItem } from '~/utils/audioQueue'

import type { TitleSegment } from '~/utils/tracks'

const props = withDefaults(defineProps<{
  tracks: {
    title: string
    titleSegments?: TitleSegment[]
    url: string
    slug?: string
    artist?: string
    artistSegments?: TitleSegment[]
    name?: string
    nameSegments?: TitleSegment[]
    cover?: string
    releaseLink?: string
    releaseTitle?: string
    artistLink?: string
  }[]
  playCounts?: Record<string, number>
  showIndex?: boolean
}>(), { showIndex: true })

const route = useRoute()
const { current, isPlaying, play, toggle, playToken } = useAudioPlayer()

const playCounts = ref<Record<string, number>>({ ...(props.playCounts ?? {}) })

const trackSlugs = computed(() =>
  props.tracks.map(t => t.slug).filter((s): s is string => Boolean(s))
)

watch(() => props.playCounts, (incoming) => {
  mergePlayCounts(playCounts.value, incoming)
}, { deep: true })

onMounted(async () => {
  if (props.playCounts) return
  if (!trackSlugs.value.length) return
  try {
    playCounts.value = await $fetch<Record<string, number>>('/api/track-plays', {
      query: { slugs: trackSlugs.value.join(',') },
    })
  } catch { /* counts stay empty */ }
})

const playable = computed(() => props.tracks.filter(t => t.url))
function toQueueItem(t: typeof props.tracks[number]): QueueItem {
  return {
    src: t.url,
    title: t.title,
    link: t.slug ? `/track/${t.slug}` : route.path,
    artist: t.artist,
    artistSegments: t.artistSegments,
    name: t.name,
    nameSegments: t.nameSegments,
    cover: t.cover,
    releaseLink: t.releaseLink ?? route.path,
    releaseTitle: t.releaseTitle,
    artistLink: t.artistLink,
  }
}

const queue = computed<QueueItem[]>(() => playable.value.map(toQueueItem))

const activeIndex = computed(() =>
  playable.value.findIndex(t => t.url === current.value?.src)
)
const isActive = computed(() => activeIndex.value !== -1)
const playingThis = computed(() => isActive.value && isPlaying.value)

const currentTrack = computed(() => playable.value[activeIndex.value] ?? playable.value[0])

const currentArtistSegments = computed(() => {
  const t = currentTrack.value
  if (t?.artistSegments?.length) return t.artistSegments
  return [{ text: t?.artist ?? '', slug: null }]
})
const currentNameSegments = computed(() => {
  const t = currentTrack.value
  if (t?.nameSegments?.length) return t.nameSegments
  return [{ text: t?.name ?? '', slug: null }]
})
const currentTrackLink = computed(() => currentTrack.value?.slug ? `/track/${currentTrack.value.slug}` : undefined)

const canPrev = computed(() => isActive.value && activeIndex.value > 0)
const canNext = computed(() => isActive.value && activeIndex.value < playable.value.length - 1)

function registerPlay(slug?: string) {
  if (!slug) return
  playCounts.value = { ...playCounts.value, [slug]: (playCounts.value[slug] ?? 0) + 1 }
  $fetch('/api/track-plays', { method: 'POST', body: { slug } }).catch(() => {})
}

function playTrack(index: number) {
  const track = props.tracks[index]
  if (!track?.url) return
  const queueIndex = playable.value.findIndex(t => t.url === track.url)
  play({ kind: 'track', ...toQueueItem(track), queue: queue.value, queueIndex })
}

// Count one play per playback cycle (new track, queue move, or repeat replay)
// for whichever queued track is currently active.
watch(playToken, () => {
  if (!isActive.value) return
  registerPlay(playable.value[activeIndex.value]?.slug)
})

const hasAudio = computed(() => playable.value.length > 0)

function togglePlay() {
  if (isActive.value) toggle()
  else playTrack(props.tracks.findIndex(t => t.url))
}

defineExpose({ playTrack })
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <PlayerControls
        size="sm"
        :show-sides="false"
        :is-playing="playingThis"
        :can-prev="canPrev"
        :can-next="canNext"
        :play-disabled="!hasAudio"
        @toggle="togglePlay"
      />

      <PlayerTrackInfo
        v-if="isActive && currentTrack"
        :cover="currentTrack.cover"
        :release-link="currentTrack.releaseLink"
        :release-title="currentTrack.releaseTitle"
        :artist-segments="currentArtistSegments"
        :name-segments="currentNameSegments"
        :track-link="currentTrackLink"
      />
    </div>

    <div v-if="!hasAudio" class="py-4 text-center text-black/60 dark:text-white/70">Music is coming</div>

    <div v-else class="flex flex-col gap-1">
      <button
        v-for="(track, index) in tracks"
        :key="index"
        type="button"
        class="flex items-center gap-2 text-xs text-left py-1 rounded transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/10"
        :class="track.url && track.url === current?.src ? 'text-black font-bold dark:text-white' : 'text-black/60 dark:text-white/60'"
        @click="playTrack(index)"
      >
        <span
          v-if="showIndex || (track.url && track.url === current?.src)"
          class="font-mono w-6 shrink-0 flex items-center justify-end"
        >
          <Icon
            v-if="track.url && track.url === current?.src"
            name="lucide:loader"
            size="14"
            class="animate-spin text-white [animation-duration:1.33s]"
          />
          <template v-else-if="showIndex">{{ index + 1 }}</template>
        </span>
        <span class="truncate">
          <template v-if="track.titleSegments?.length">
            <template v-for="(seg, si) in track.titleSegments" :key="si">{{ seg.text }}</template>
          </template>
          <template v-else>{{ track.title }}</template>
        </span>
        <span
          v-if="track.slug && playCounts[track.slug]"
          class="ml-auto flex items-center gap-1 font-mono shrink-0 opacity-60"
        >
          <Icon name="lucide:play" size="12" />
          <span class=" w-6">{{ playCounts[track.slug] }}</span>
        </span>
      </button>
    </div>
  </div>
</template>
