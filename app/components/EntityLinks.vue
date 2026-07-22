<script setup lang="ts">
import { computed } from 'vue'
import type { ReleaseLinks, PlaylistLinks } from '~/types'

const props = defineProps<{
  links?: ReleaseLinks | PlaylistLinks | null
}>()

type LinkDef = {
  keys: string[]
  title: string
  iconify?: string
  img?: string
}

const linkDefs: LinkDef[] = [
  { keys: ['diggersfactory_url'], title: 'Diggers Factory', img: 'https://content.sentimony.com/assets/img/svg-icons/diggers-factory.svg?01' },
  { keys: ['bandcamp_url'], title: 'Bandcamp <small>(16bit)</small>', iconify: 'simple-icons:bandcamp' },
  { keys: ['bandcamp24_url'], title: 'Bandcamp <small>(24bit)</small>', iconify: 'simple-icons:bandcamp' },
  { keys: ['beatport'], title: 'Beatport', iconify: 'simple-icons:beatport' },
  { keys: ['spotify'], title: 'Spotify', iconify: 'simple-icons:spotify' },
  { keys: ['applemusic_url', 'apple_music'], title: 'Apple Music', iconify: 'simple-icons:applemusic' },
  { keys: ['youtube_music'], title: 'YT Music', iconify: 'simple-icons:youtubemusic' },
  { keys: ['deezer'], title: 'Deezer', iconify: 'simple-icons:deezer' },
  { keys: ['amazon_music'], title: 'Amazon Music', iconify: 'simple-icons:amazonmusic' },
  { keys: ['tidal'], title: 'Tidal', iconify: 'simple-icons:tidal' },
  { keys: ['qobuz'], title: 'Qobuz', img: 'https://content.sentimony.com/assets/img/svg-icons/qobuz-2.svg?01' },
  { keys: ['youtube'], title: 'YouTube', iconify: 'simple-icons:youtube' },
  { keys: ['soundcloud_url'], title: 'SoundCloud', iconify: 'simple-icons:soundcloud' },
  { keys: ['ektoplazm'], title: 'Ektoplazm', img: 'https://content.sentimony.com/assets/img/svg-icons/ektoplazm.svg?01' },
  { keys: ['discogs'], title: 'Discogs', iconify: 'simple-icons:discogs' },
]

const resolvedLinks = computed(() => {
  const links = (props.links ?? {}) as Record<string, string | undefined>
  return linkDefs
    .map((def) => {
      const key = def.keys.find((k) => links[k])
      return key ? { ...def, url: links[key] as string } : null
    })
    .filter((v): v is LinkDef & { url: string } => v !== null)
})
</script>

<template>
  <template v-if="resolvedLinks.length">
    <p><span class="text-[10px] md:text-[12px] text-foreground/50">Links</span></p>
    <PrimaryButton
      v-for="link in resolvedLinks"
      :key="link.title"
      :to="link.url"
      :title="link.title"
      :iconify="link.iconify"
      :img="link.img"
    />
  </template>
</template>
