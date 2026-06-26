import { toast } from 'vue-sonner'

export interface LikesApi {
  isLiked: (slug: string) => boolean
  likeCount: (slug: string) => number
  toggleLike: (slug: string) => Promise<void>
  setCount: (slug: string, count: number) => void
}

export function createLikes(key: string, apiBase: string): LikesApi {
  const user = useSupabaseUser()
  const likedSlugs = useState<string[]>(`${key}-likes`, () => [])
  const loaded = useState<boolean>(`${key}-likes-loaded`, () => false)
  const likeCounts = useState<Record<string, number>>(`${key}-like-counts`, () => ({}))

  const isLiked = (slug: string) => likedSlugs.value.includes(slug)
  const likeCount = (slug: string) => likeCounts.value[slug] ?? 0
  const setCount = (slug: string, count: number) => {
    likeCounts.value[slug] = count
  }

  async function load() {
    if (!user.value || loaded.value) return
    const data = await $fetch<string[]>(apiBase).catch(() => [])
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

  async function toggleLike(slug: string) {
    if (!user.value) {
      navigateTo('/signin')
      return
    }
    if (isLiked(slug)) {
      likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
      likeCounts.value[slug] = Math.max(0, (likeCounts.value[slug] ?? 1) - 1)
      await $fetch<{ ok: boolean }>(`${apiBase}/${slug}`, { method: 'DELETE' }).catch(() => {
        likedSlugs.value = [...likedSlugs.value, slug]
        likeCounts.value[slug] = (likeCounts.value[slug] ?? 0) + 1
        toast.error('Could not update favourites. Please try again.')
      })
    } else {
      likedSlugs.value = [...likedSlugs.value, slug]
      likeCounts.value[slug] = (likeCounts.value[slug] ?? 0) + 1
      await $fetch<{ ok: boolean }>(apiBase, { method: 'POST', body: { slug } }).catch(() => {
        likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
        likeCounts.value[slug] = Math.max(0, (likeCounts.value[slug] ?? 1) - 1)
        toast.error('Could not update favourites. Please try again.')
      })
    }
  }

  return { isLiked, likeCount, toggleLike, setCount }
}
