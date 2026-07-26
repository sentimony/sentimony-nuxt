<script setup lang="ts">
import { createError } from '#app'
import { toArray } from '~/composables/toArray'
import type { Artist } from '~/types'

const route = useRoute()
const id = computed(() => String(route.params.id))
const { isLiked, toggleLike, likeCount } = useEventLikes()

const eventAsync = await useEvent(id.value, { server: true })
const item = eventAsync.data
const eventError = eventAsync.error

if (eventError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}

const allArtistsAsync = useFetch<Record<string, Artist> | Artist[]>('/api/artists-all', { server: false })
const allArtists = computed(() => toArray<Artist>(allArtistsAsync.data.value))
const artistBySlug = computed(() => new Map(allArtists.value.map(a => [a.slug, a])))

const lineup = computed(() =>
  (item.value?.lineup ?? [])
    .map(entry => entry.musician?.trim())
    .filter((name): name is string => Boolean(name))
)

const lineupArtists = computed(() => {
  const found = new Map<string, Artist>()
  for (const name of lineup.value) {
    for (const segment of splitTitleByArtists(name, allArtists.value)) {
      const artist = segment.slug ? artistBySlug.value.get(segment.slug) : undefined
      if (artist) found.set(artist.slug, artist)
    }
  }
  return [...found.values()]
})

const organizers = computed(() =>
  (item.value?.organizer ?? [])
    .map(slug => artistBySlug.value.get(slug))
    .filter((artist): artist is Artist => Boolean(artist))
)

const linkIcons: Record<string, string> = {
  facebook: 'simple-icons:facebook',
  instagram: 'simple-icons:instagram',
  'last.fm': 'simple-icons:lastdotfm',
  vk: 'simple-icons:vk',
  youtube: 'simple-icons:youtube',
}

const eventLinks = computed(() =>
  (item.value?.links ?? [])
    .filter(link => link.url)
    .map(link => ({
      title: link.id || link.url!,
      url: link.url!,
      iconify: linkIcons[(link.id || '').toLowerCase()] ?? 'lucide:link',
    }))
)

const { formatDate, formatYear } = useDate()
const formattedDate = computed(() => formatDate(item.value?.date))

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const year = computed(() => formatYear(item.value?.date))
const PageDescription = computed(() => [
  item.value?.title,
  item.value?.location,
  year.value,
].filter(Boolean).join(' - '))
useSeoMeta({
  title: () => item.value?.title,
  description: () => PageDescription.value,
  ogTitle: () => item.value?.title,
  ogDescription: () => PageDescription.value,
  ogImage: () => item.value?.flyer_a_og || item.value?.flyer_a_xl || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.flyer_a_og || item.value?.flyer_a_xl || appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>

<template>
  <div class="text-left border-t border-black/20 dark:border-white/20">
    <div class="relative z-[2] px-2">
      <div class="container max-w-7xl" v-if="item">

        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>

        <div class="flex flex-col lg:flex-row">
          <div class="w-full mb-4 lg:mb-12 xl:mb-24 2xl:mb-36 pr-2">

            <div class="flex flex-col sm:flex-row">

              <div class="shrink-0 flex flex-wrap">
                <OpenImage
                  :image_th="item.flyer_a_th"
                  :image_xl="item.flyer_a_xl"
                  :alt="(item.title || 'Event') + ' flyer front'"
                />
                <OpenImage
                  v-if="item.flyer_b_xl"
                  :image_th="item.flyer_b_th"
                  :image_xl="item.flyer_b_xl"
                  :alt="(item.title || 'Event') + ' flyer back'"
                />
              </div>

              <div class="flex-1 min-w-0">

                <p v-if="formattedDate"><span class="text-foreground/50">Date:</span> {{ formattedDate }}</p>
                <p v-if="item.time"><span class="text-foreground/50">Time:</span> {{ item.time }}</p>
                <p v-if="item.location"><span class="text-foreground/50">Location:</span> {{ item.location }}</p>

                <div class="flex justify-start mb-4">
                  <LikeButton
                    size="lg"
                    :liked="isLiked(item.slug)"
                    :count="likeCount(item.slug)"
                    @like="toggleLike(item.slug)"
                  />
                </div>

              </div>

            </div>

            <template v-if="eventLinks.length">
              <p><span class="text-[10px] md:text-[12px] text-foreground/50">Links</span></p>
              <PrimaryButton
                v-for="link in eventLinks"
                :key="link.url"
                :to="link.url"
                :title="link.title"
                :iconify="link.iconify"
              />
            </template>

          </div>
          <div v-if="lineup.length" class="relative max-w-[540px] mx-auto w-full mb-4">

            <Tabs>

              <Tab
                icon="lucide:users"
                title="Lineup"
              >
                <div class="flex flex-col gap-1">
                  <p
                    v-for="(name, index) in lineup"
                    :key="name"
                    class="flex items-center gap-2 text-xs py-1 text-black/60 dark:text-white/60"
                  >
                    <span class="font-mono w-6 shrink-0 flex items-center justify-end">{{ index + 1 }}</span>
                    <span class="truncate"><TrackTitle :title="name" :artists="allArtists" /></span>
                  </p>
                </div>
              </Tab>

            </Tabs>

          </div>
        </div>
      </div>
    </div>

    <ItemContent v-if="item">

        <div v-if="item.info" v-html="sanitizeHtml(item.info)" />

        <div v-if="organizers.length">
          <hr class="my-4 border-black/30">
          <p><small><b>Organizers:</b></small></p>
          <p
            v-for="organizer in organizers"
            :key="organizer.slug"
          >
            <RelativeItem
              :i="organizer"
              category="artist"
            />
          </p>
        </div>

        <div v-if="lineupArtists.length">
          <hr class="my-4 border-black/30">
          <p><small><b>Relative Artists:</b></small></p>
          <p
            v-for="artist in lineupArtists"
            :key="artist.slug"
            class="mb-2 mr-4 last:mr-0"
          >
            <RelativeItem
              :i="artist"
              category="artist"
            />
          </p>
        </div>

    </ItemContent>

  </div>
</template>
