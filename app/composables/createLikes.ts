import { toast } from 'vue-sonner'

export interface LikesApi {
  isLiked: (slug: string) => boolean
  likeCount: (slug: string) => number
  toggleLike: (slug: string) => Promise<void>
  setCount: (slug: string, count: number) => void
}

const ANON_LIKE_COOKIE = 'sentimony_anon_id'

export function createLikes(key: string, apiBase: string): LikesApi {
  const user = useSupabaseUser()
  const anonId = useCookie<string | null>(ANON_LIKE_COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })
  const likedSlugs = useState<string[]>(`${key}-likes`, () => [])
  const loaded = useState<boolean>(`${key}-likes-loaded`, () => false)
  const likeCounts = useState<Record<string, number>>(`${key}-like-counts`, () => ({}))

  const hasIdentity = () => Boolean(user.value || anonId.value)

  const ensureAnonId = () => {
    if (user.value || anonId.value) return
    const id = crypto.randomUUID()
    anonId.value = id
    // Write synchronously so the immediately-following request carries the cookie
    // (useCookie flushes to document.cookie asynchronously via a reactive effect).
    document.cookie = `${ANON_LIKE_COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  }

  const isLiked = (slug: string) => likedSlugs.value.includes(slug)
  const likeCount = (slug: string) => likeCounts.value[slug] ?? 0
  const setCount = (slug: string, count: number) => {
    // Never lower a count already on screen: the cached catalog total can lag
    // behind this client's freshly accumulated clicks (clap model, no unlike).
    likeCounts.value[slug] = Math.max(likeCounts.value[slug] ?? 0, count)
  }

  async function load() {
    if (!hasIdentity() || loaded.value) return
    const data = await $fetch<{ slug: string, count: number }[]>(apiBase).catch(() => [])
    likedSlugs.value = data.map(entry => entry.slug)
    // Keep whichever is larger: the public total from SSR or this client's own
    // accumulated clicks — so a reload never drops the user's contribution even
    // while the cached catalog like_count is still catching up.
    for (const { slug, count } of data) {
      likeCounts.value[slug] = Math.max(likeCounts.value[slug] ?? 0, count)
    }
    loaded.value = true
  }

  onMounted(() => {
    if (hasIdentity() && !loaded.value) load()
  })

  watch(user, () => {
    loaded.value = false
    load()
  })

  async function toggleLike(slug: string) {
    ensureAnonId()
    // Clap model: every click adds one. Optimistically bump the public total and
    // mark the entity as liked; roll back only the increment if the request fails.
    if (!likedSlugs.value.includes(slug)) likedSlugs.value = [...likedSlugs.value, slug]
    likeCounts.value[slug] = (likeCounts.value[slug] ?? 0) + 1
    await $fetch<{ ok: boolean, count: number }>(apiBase, { method: 'POST', body: { slug } }).catch(() => {
      likeCounts.value[slug] = Math.max(0, (likeCounts.value[slug] ?? 1) - 1)
      toast.error('Could not update favourites. Please try again.')
    })
  }

  return { isLiked, likeCount, toggleLike, setCount }
}
