import { toast } from 'vue-sonner'

export function useArtistLikes() {
  const user = useSupabaseUser()
  const likedSlugs = useState<string[]>('artist-likes', () => [])
  const loaded = useState<boolean>('artist-likes-loaded', () => false)
  const likeCounts = useState<Record<string, number>>('artist-like-counts', () => ({}))

  const isLiked = (slug: string) => likedSlugs.value.includes(slug)
  const likeCount = (slug: string) => likeCounts.value[slug] ?? 0

  async function load() {
    if (!user.value || loaded.value) return
    const data = await $fetch<string[]>('/api/artist-likes').catch(() => [])
    likedSlugs.value = data
    loaded.value = true
  }

  async function fetchCount(slug: string) {
    const { count } = await $fetch<{ count: number }>(`/api/artist-likes/count/${slug}`).catch(() => ({ count: 0 }))
    likeCounts.value[slug] = count
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

  async function toggleLike(slug: string) {
    if (!user.value) {
      navigateTo('/signin')
      return
    }
    if (isLiked(slug)) {
      likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
      likeCounts.value[slug] = Math.max(0, (likeCounts.value[slug] ?? 1) - 1)
      await $fetch(`/api/artist-likes/${slug}`, { method: 'DELETE' }).catch(() => {
        likedSlugs.value = [...likedSlugs.value, slug]
        likeCounts.value[slug] = (likeCounts.value[slug] ?? 0) + 1
        toast.error('Could not update favourites. Please try again.')
      })
    } else {
      likedSlugs.value = [...likedSlugs.value, slug]
      likeCounts.value[slug] = (likeCounts.value[slug] ?? 0) + 1
      await $fetch('/api/artist-likes', { method: 'POST', body: { slug } }).catch(() => {
        likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
        likeCounts.value[slug] = Math.max(0, (likeCounts.value[slug] ?? 1) - 1)
        toast.error('Could not update favourites. Please try again.')
      })
    }
  }

  return { isLiked, likeCount, toggleLike, fetchCount }
}
