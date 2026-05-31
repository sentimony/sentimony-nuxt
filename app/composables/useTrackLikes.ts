import { toast } from 'vue-sonner'

export function useTrackLikes() {
  const user = useSupabaseUser()
  const likedSlugs = useState<string[]>('track-likes', () => [])
  const loaded = useState<boolean>('track-likes-loaded', () => false)
  const trackCounts = useState<Record<string, number>>('track-counts', () => ({}))

  const isTrackLiked = (slug: string) => likedSlugs.value.includes(slug)
  const trackLikeCount = (slug: string) => trackCounts.value[slug] ?? 0

  function setTrackCount(slug: string, count: number) {
    trackCounts.value[slug] = count
  }

  async function fetchTrackCount(slug: string) {
    const { count } = await $fetch<{ count: number }>(`/api/track-likes/count/${slug}`).catch(() => ({ count: 0 }))
    trackCounts.value[slug] = count
  }

  async function load() {
    if (!user.value || loaded.value) return
    const data = await $fetch<string[]>('/api/track-likes').catch(() => [])
    likedSlugs.value = data
    loaded.value = true
  }

  onMounted(() => {
    if (user.value && !loaded.value) load()
  })

  watch(user, (u) => {
    if (u) load()
    else {
      likedSlugs.value = []
      loaded.value = false
    }
  })

  async function toggleTrackLike(slug: string) {
    if (!user.value) {
      navigateTo('/signin')
      return
    }
    if (isTrackLiked(slug)) {
      likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
      trackCounts.value[slug] = Math.max(0, (trackCounts.value[slug] ?? 1) - 1)
      await $fetch(`/api/track-likes/${slug}`, { method: 'DELETE' }).catch(() => {
        likedSlugs.value = [...likedSlugs.value, slug]
        trackCounts.value[slug] = (trackCounts.value[slug] ?? 0) + 1
        toast.error('Could not update favourites. Please try again.')
      })
    } else {
      likedSlugs.value = [...likedSlugs.value, slug]
      trackCounts.value[slug] = (trackCounts.value[slug] ?? 0) + 1
      await $fetch('/api/track-likes', { method: 'POST', body: { slug } }).catch(() => {
        likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
        trackCounts.value[slug] = Math.max(0, (trackCounts.value[slug] ?? 1) - 1)
        toast.error('Could not update favourites. Please try again.')
      })
    }
  }

  return { isTrackLiked, toggleTrackLike, trackLikeCount, setTrackCount, fetchTrackCount }
}
