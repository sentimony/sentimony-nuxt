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

const { data: likedReleases } = await useFetch<LikedRelease[]>('/api/likes/releases')
const { data: likedTracks } = await useFetch<LikedTrack[]>('/api/track-likes/tracks')
const { data: likedArtists } = await useFetch<LikedArtist[]>('/api/artist-likes/artists')
const { data: likedVideos } = await useFetch<LikedVideo[]>('/api/video-likes/videos')
const { data: likedPlaylists } = await useFetch<LikedPlaylist[]>('/api/playlist-likes/playlists')
const { data: likedEvents } = await useFetch<LikedEvent[]>('/api/event-likes/events')

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

      <div v-if="likedArtists?.length" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Artists</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="a in likedArtists"
            :key="a.slug"
            :to="`/artist/${a.slug}`"
            class="group"
          >
            <img v-if="a.photo_th" :src="a.photo_th" :alt="a.title" class="w-full aspect-square object-cover rounded mb-2 transition-opacity group-hover:opacity-80">
            <div v-else class="w-full aspect-square rounded mb-2 bg-white/10 flex items-center justify-center">
              <Icon name="heroicons:user" size="40" class="text-white/30" />
            </div>
            <p class="text-sm text-white/80 truncate">{{ a.title }}</p>
          </NuxtLink>
        </div>
      </div>

      <div v-if="likedReleases?.length" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Releases</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="r in likedReleases"
            :key="r.slug"
            :to="`/release/${r.slug}`"
            class="group"
          >
            <img :src="r.cover_th" :alt="r.title" class="w-full aspect-square object-cover rounded mb-2 transition-opacity group-hover:opacity-80">
            <p class="text-sm text-white/80 truncate">{{ r.title }}</p>
          </NuxtLink>
        </div>
      </div>

      <div v-if="likedVideos?.length" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Videos</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="v in likedVideos"
            :key="v.slug"
            :to="`/video/${v.slug}`"
            class="group"
          >
            <img v-if="v.cover_th" :src="v.cover_th" :alt="v.title" class="w-full aspect-square object-cover rounded mb-2 transition-opacity group-hover:opacity-80">
            <p class="text-sm text-white/80 truncate">{{ v.title }}</p>
          </NuxtLink>
        </div>
      </div>

      <div v-if="likedPlaylists?.length" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Playlists</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="p in likedPlaylists"
            :key="p.slug"
            :to="`/playlist/${p.slug}`"
            class="group"
          >
            <img v-if="p.cover_th" :src="p.cover_th" :alt="p.title" class="w-full aspect-square object-cover rounded mb-2 transition-opacity group-hover:opacity-80">
            <p class="text-sm text-white/80 truncate">{{ p.title }}</p>
          </NuxtLink>
        </div>
      </div>

      <div v-if="likedEvents?.length" class="mb-10">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Events</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="e in likedEvents"
            :key="e.slug"
            :to="`/event/${e.slug}`"
            class="group"
          >
            <img v-if="e.flyer_a_xl" :src="e.flyer_a_xl" :alt="e.title" class="w-full aspect-square object-cover rounded mb-2 transition-opacity group-hover:opacity-80">
            <p class="text-sm text-white/80 truncate">{{ e.title }}</p>
          </NuxtLink>
        </div>
      </div>

      <div v-if="likedTracks?.length">
        <h2 class="font-['Julius_Sans_One'] tracking-wide text-lg mb-5">Liked Tracks</h2>
        <div class="max-w-xl">
          <NuxtLink
            v-for="t in likedTracks"
            :key="t.slug"
            :to="`/release/${t.release_slug}`"
            class="flex items-center gap-3 py-1 hover:text-white/70 transition-colors"
          >
            <span><b>{{ t.artist_name }}</b> - {{ t.title }} <small v-if="t.bpm">({{ t.bpm }}bpm)</small></span>
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>
