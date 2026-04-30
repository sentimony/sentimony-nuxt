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

const artists = usePaginatedLikes<LikedArtist>('/api/artist-likes/artists', 5)
const releases = usePaginatedLikes<LikedRelease>('/api/likes/releases', 5)
const tracks = usePaginatedLikes<LikedTrack>('/api/track-likes/tracks', 20)
const videos = usePaginatedLikes<LikedVideo>('/api/video-likes/videos', 5)
const playlists = usePaginatedLikes<LikedPlaylist>('/api/playlist-likes/playlists', 5)
const events = usePaginatedLikes<LikedEvent>('/api/event-likes/events', 5)

async function signOut() {
  await supabase.auth.signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="px-4 py-16">
    <div class="container max-w-5xl mx-auto">
      <h1 class="text-2xl font-['Julius_Sans_One'] tracking-wide text-center mb-8">Profile</h1>

      <div class="max-w-sm mx-auto bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6 flex flex-col gap-4 mb-12">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-white/50 tracking-widest uppercase">Email</span>
          <span class="text-white/80">{{ user?.email }}</span>
        </div>

        <button
          @click="signOut"
          class="transition-colors duration-300 border border-white/30 rounded px-4 py-2 hover:bg-white/20 text-sm mt-2"
        >
          Sign Out
        </button>
      </div>

      <div v-if="releases.items.value.length || releases.loading.value" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Releases</h2>
        <div class="flex flex-wrap">
          <Item v-for="r in releases.items.value" :key="r.slug" :i="r" category="release" />
        </div>
        <button
          v-if="releases.hasMore.value"
          :disabled="releases.loading.value"
          @click="releases.loadMore()"
          class="mt-4 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-40"
        >
          {{ releases.loading.value ? 'Loading...' : `Show more 5 (${releases.total.value - releases.items.value.length} left)` }}
        </button>
      </div>

      <div v-if="tracks.items.value.length || tracks.loading.value" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Tracks</h2>
        <div class="max-w-xl">
          <NuxtLink
            v-for="t in tracks.items.value"
            :key="t.slug"
            :to="`/release/${t.release_slug}`"
            class="flex items-center gap-3 py-1 hover:text-white/70 transition-colors"
          >
            <span><b>{{ t.artist_name }}</b> - {{ t.title }} <small v-if="t.bpm">({{ t.bpm }}bpm)</small></span>
          </NuxtLink>
        </div>
        <button
          v-if="tracks.hasMore.value"
          :disabled="tracks.loading.value"
          @click="tracks.loadMore()"
          class="mt-4 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-40"
        >
          {{ tracks.loading.value ? 'Loading...' : `Show more 20 (${tracks.total.value - tracks.items.value.length} left)` }}
        </button>
      </div>

      <div v-if="artists.items.value.length || artists.loading.value" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Artists</h2>
        <div class="flex flex-wrap">
          <Item v-for="a in artists.items.value" :key="a.slug" :i="a" category="artist" />
        </div>
        <button
          v-if="artists.hasMore.value"
          :disabled="artists.loading.value"
          @click="artists.loadMore()"
          class="mt-4 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-40"
        >
          {{ artists.loading.value ? 'Loading...' : `Show more 5 (${artists.total.value - artists.items.value.length} left)` }}
        </button>
      </div>

      <div v-if="playlists.items.value.length || playlists.loading.value" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Playlists</h2>
        <div class="flex flex-wrap">
          <Item v-for="p in playlists.items.value" :key="p.slug" :i="p" category="playlist" />
        </div>
        <button
          v-if="playlists.hasMore.value"
          :disabled="playlists.loading.value"
          @click="playlists.loadMore()"
          class="mt-4 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-40"
        >
          {{ playlists.loading.value ? 'Loading...' : `Show more (${playlists.total.value - playlists.items.value.length} left)` }}
        </button>
      </div>

      <div v-if="events.items.value.length || events.loading.value" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Events</h2>
        <div class="flex flex-wrap">
          <Item v-for="e in events.items.value" :key="e.slug" :i="e" category="event" />
        </div>
        <button
          v-if="events.hasMore.value"
          :disabled="events.loading.value"
          @click="events.loadMore()"
          class="mt-4 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-40"
        >
          {{ events.loading.value ? 'Loading...' : `Show more (${events.total.value - events.items.value.length} left)` }}
        </button>
      </div>

      <div v-if="videos.items.value.length || videos.loading.value" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Videos</h2>
        <div class="flex flex-wrap">
          <Item v-for="v in videos.items.value" :key="v.slug" :i="v" category="video" />
        </div>
        <button
          v-if="videos.hasMore.value"
          :disabled="videos.loading.value"
          @click="videos.loadMore()"
          class="mt-4 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-40"
        >
          {{ videos.loading.value ? 'Loading...' : `Show more (${videos.total.value - videos.items.value.length} left)` }}
        </button>
      </div>

    </div>
  </div>
</template>
