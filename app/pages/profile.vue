<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

type LikedRelease = { slug: string, title: string, cover_th: string, date: string }
type LikedTrack = { slug: string, title: string, artist_name: string, release_slug: string, track_number: number, bpm: number | null }
type LikedArtist = { slug: string, title: string, photo_th: string }
type LikedVideo = { slug: string, title: string, cover_th: string }
type LikedPlaylist = { slug: string, title: string, cover_th: string }
type LikedEvent = { slug: string, title: string, flyer_a_xl: string }

type ProfileLikesResponse = {
  artists: PaginatedLikesResponse<LikedArtist>
  releases: PaginatedLikesResponse<LikedRelease>
  tracks: PaginatedLikesResponse<LikedTrack>
  videos: PaginatedLikesResponse<LikedVideo>
  playlists: PaginatedLikesResponse<LikedPlaylist>
  events: PaginatedLikesResponse<LikedEvent>
}

const { data: initialLikes } = await useFetch<ProfileLikesResponse>('/api/profile-likes')

const artists = usePaginatedLikes('/api/artist-likes/artists', 25, initialLikes.value?.artists)
const releases = usePaginatedLikes('/api/likes/releases', 25, initialLikes.value?.releases)
const tracks = usePaginatedLikes('/api/track-likes/tracks', 25, initialLikes.value?.tracks)
const videos = usePaginatedLikes('/api/video-likes/videos', 25, initialLikes.value?.videos)
const playlists = usePaginatedLikes('/api/playlist-likes/playlists', 25, initialLikes.value?.playlists)
const events = usePaginatedLikes('/api/event-likes/events', 25, initialLikes.value?.events)

const allTabs = [
  { key: 'releases', label: 'Releases', data: releases },
  { key: 'tracks', label: 'Tracks', data: tracks },
  { key: 'artists', label: 'Artists', data: artists },
  { key: 'videos', label: 'Videos', data: videos },
  { key: 'playlists', label: 'Playlists', data: playlists },
  { key: 'events', label: 'Events', data: events },
]

const visibleTabs = computed(() =>
  allTabs.filter(t => t.data.loading.value || t.data.items.value.length > 0)
)

const activeTab = ref('releases')

watch(visibleTabs, (tabs) => {
  if (tabs.length && !tabs.find(t => t.key === activeTab.value)) {
    activeTab.value = tabs[0]!.key
  }
}, { immediate: true })

const mounted = ref(false)
onMounted(() => { mounted.value = true })

const allLoaded = computed(() => mounted.value && allTabs.every(t => !t.data.loading.value))
const hasAnyLikes = computed(() => allTabs.some(t => t.data.items.value.length > 0))

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/signin')
}
</script>

<template>
  <div class="px-4 py-12">
    <div class="container max-w-[112rem] mx-auto">

      <div class="max-w-5xl mx-auto">
        <div class="flex items-center justify-between py-3 mb-10 border-b border-black/10 dark:border-white/10">
          <span class="text-foreground/40 text-[10px] tracking-widest uppercase">{{ user?.email }}</span>
          <button
            @click="signOut"
            class="flex items-center gap-1.5 text-[10px] text-foreground/40 hover:text-foreground/70 tracking-wider uppercase transition-colors duration-200"
          >
            <Icon name="lucide:log-out" size="13" />
            Sign out
          </button>
        </div>
      </div>

      <div v-if="visibleTabs.length" class="flex flex-wrap gap-2 justify-center mb-10">
        <button
          v-for="tab in visibleTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-4 py-1.5 text-[10px] tracking-widest uppercase rounded transition-colors duration-200',
            activeTab === tab.key
              ? 'bg-black/15 dark:bg-white/15 text-foreground'
              : 'bg-black/5 dark:bg-white/5 text-foreground/40 hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground/70'
          ]"
        >
          {{ tab.label }}
          <span
            v-if="!tab.data.loading.value && tab.data.total.value > 0"
            class="ml-1 opacity-40"
          >{{ tab.data.total.value }}</span>
        </button>
      </div>

      <div v-else-if="allLoaded && !hasAnyLikes" class="text-center py-24">
        <p class="text-foreground/30 text-[10px] tracking-[0.2em] uppercase mb-2">Nothing here yet</p>
        <p class="text-foreground/20 text-xs">Explore releases, artists and events to build your collection</p>
      </div>

      <Transition name="tab-fade" mode="out-in">
        <div :key="activeTab" class="min-h-48">

          <template v-if="activeTab === 'releases'">
            <div class="flex flex-wrap justify-center">
              <Item v-for="r in releases.items.value" :key="r.slug" :i="r" category="release" />
            </div>
            <div v-if="releases.loading.value" class="flex justify-center py-10">
              <span class="text-foreground/30 text-[10px] tracking-widest uppercase animate-pulse">Loading</span>
            </div>
            <button v-if="releases.hasMore.value" :disabled="releases.loading.value" class="block mx-auto mt-6 text-[10px] tracking-widest uppercase text-foreground/35 hover:text-foreground/65 transition-colors duration-200 disabled:opacity-25" @click="releases.loadMore()">
              {{ releases.loading.value ? 'Loading…' : `Show more · ${releases.total.value - releases.items.value.length} left` }}
            </button>
          </template>

          <template v-else-if="activeTab === 'tracks'">
            <div class="max-w-2xl mx-auto text-left">
              <NuxtLink
                v-for="(t, i) in tracks.items.value"
                :key="t.slug"
                :to="`/release/${t.release_slug}`"
                class="group flex items-baseline gap-4 py-2.5 px-2 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 rounded"
              >
                <span class="font-mono text-foreground/25 text-[10px] w-5 text-right shrink-0">{{ i + 1 }}</span>
                <span class="text-foreground/50 text-xs shrink-0">{{ t.artist_name }}</span>
                <span class="text-foreground/85 text-xs flex-1">{{ t.title }}</span>
                <span v-if="t.bpm" class="font-mono text-foreground/25 text-[10px] shrink-0">{{ t.bpm }}bpm</span>
              </NuxtLink>
            </div>
            <div v-if="tracks.loading.value" class="flex justify-center py-10">
              <span class="text-foreground/30 text-[10px] tracking-widest uppercase animate-pulse">Loading</span>
            </div>
            <button v-if="tracks.hasMore.value" :disabled="tracks.loading.value" class="block mx-auto mt-4 text-[10px] tracking-widest uppercase text-foreground/35 hover:text-foreground/65 transition-colors duration-200 disabled:opacity-25" @click="tracks.loadMore()">
              {{ tracks.loading.value ? 'Loading…' : `Show more · ${tracks.total.value - tracks.items.value.length} left` }}
            </button>
          </template>

          <template v-else-if="activeTab === 'artists'">
            <div class="flex flex-wrap justify-center">
              <Item v-for="a in artists.items.value" :key="a.slug" :i="a" category="artist" />
            </div>
            <div v-if="artists.loading.value" class="flex justify-center py-10">
              <span class="text-foreground/30 text-[10px] tracking-widest uppercase animate-pulse">Loading</span>
            </div>
            <button v-if="artists.hasMore.value" :disabled="artists.loading.value" class="block mx-auto mt-6 text-[10px] tracking-widest uppercase text-foreground/35 hover:text-foreground/65 transition-colors duration-200 disabled:opacity-25" @click="artists.loadMore()">
              {{ artists.loading.value ? 'Loading…' : `Show more · ${artists.total.value - artists.items.value.length} left` }}
            </button>
          </template>

          <template v-else-if="activeTab === 'videos'">
            <div class="flex flex-wrap justify-center">
              <Item v-for="v in videos.items.value" :key="v.slug" :i="v" category="video" />
            </div>
            <div v-if="videos.loading.value" class="flex justify-center py-10">
              <span class="text-foreground/30 text-[10px] tracking-widest uppercase animate-pulse">Loading</span>
            </div>
            <button v-if="videos.hasMore.value" :disabled="videos.loading.value" class="block mx-auto mt-6 text-[10px] tracking-widest uppercase text-foreground/35 hover:text-foreground/65 transition-colors duration-200 disabled:opacity-25" @click="videos.loadMore()">
              {{ videos.loading.value ? 'Loading…' : `Show more · ${videos.total.value - videos.items.value.length} left` }}
            </button>
          </template>

          <template v-else-if="activeTab === 'playlists'">
            <div class="flex flex-wrap justify-center">
              <Item v-for="p in playlists.items.value" :key="p.slug" :i="p" category="playlist" />
            </div>
            <div v-if="playlists.loading.value" class="flex justify-center py-10">
              <span class="text-foreground/30 text-[10px] tracking-widest uppercase animate-pulse">Loading</span>
            </div>
            <button v-if="playlists.hasMore.value" :disabled="playlists.loading.value" class="block mx-auto mt-6 text-[10px] tracking-widest uppercase text-foreground/35 hover:text-foreground/65 transition-colors duration-200 disabled:opacity-25" @click="playlists.loadMore()">
              {{ playlists.loading.value ? 'Loading…' : `Show more · ${playlists.total.value - playlists.items.value.length} left` }}
            </button>
          </template>

          <template v-else-if="activeTab === 'events'">
            <div class="flex flex-wrap justify-center">
              <Item v-for="e in events.items.value" :key="e.slug" :i="e" category="event" />
            </div>
            <div v-if="events.loading.value" class="flex justify-center py-10">
              <span class="text-foreground/30 text-[10px] tracking-widest uppercase animate-pulse">Loading</span>
            </div>
            <button v-if="events.hasMore.value" :disabled="events.loading.value" class="block mx-auto mt-6 text-[10px] tracking-widest uppercase text-foreground/35 hover:text-foreground/65 transition-colors duration-200 disabled:opacity-25" @click="events.loadMore()">
              {{ events.loading.value ? 'Loading…' : `Show more · ${events.total.value - events.items.value.length} left` }}
            </button>
          </template>

        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.tab-fade-enter-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
.tab-fade-leave-active {
  transition: opacity 100ms ease-in, transform 100ms ease-in;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (prefers-reduced-motion: reduce) {
  .tab-fade-enter-active,
  .tab-fade-leave-active {
    transition: opacity 100ms ease;
  }
  .tab-fade-enter-from,
  .tab-fade-leave-to {
    transform: none;
  }
}
</style>
