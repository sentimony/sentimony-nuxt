export type PaginatedLikesResponse<T> = { data: T[], total: number }

export function usePaginatedLikes<T extends object>(
  url: string,
  limit: number,
  initialTotal = 0,
) {
  const items = ref<T[]>([]) as Ref<T[]>
  const total = ref(initialTotal)
  const page = ref(0)
  const loading = ref(false)
  const loaded = ref(false)
  const hasMore = computed(() => items.value.length < total.value)

  async function load() {
    if (loading.value) return
    loading.value = true
    const res = await $fetch<PaginatedLikesResponse<T>>(url, {
      query: { page: page.value, limit },
    }).catch((err) => {
      console.error(`[usePaginatedLikes] ${url}:`, err)
      return { data: [], total: total.value } as PaginatedLikesResponse<T>
    })
    items.value = items.value.concat(res.data)
    total.value = res.total
    page.value++
    loaded.value = true
    loading.value = false
  }

  async function ensureLoaded() {
    if (!loaded.value && total.value > 0) await load()
  }

  return { items, total, loading, loaded, hasMore, loadMore: load, ensureLoaded }
}
