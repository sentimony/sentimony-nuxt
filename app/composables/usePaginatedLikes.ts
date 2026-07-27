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
  const error = ref(false)
  const hasMore = computed(() => items.value.length < total.value)

  async function load() {
    if (loading.value) return
    loading.value = true

    try {
      const res = await $fetch<PaginatedLikesResponse<T>>(url, {
        query: { page: page.value, limit },
      })
      items.value = items.value.concat(res.data)
      total.value = res.total
      page.value++
      loaded.value = true
      error.value = false
    }
    catch (err) {
      console.error(`[usePaginatedLikes] ${url}:`, err)
      error.value = true
    }
    finally {
      loading.value = false
    }
  }

  async function ensureLoaded() {
    if (loaded.value) return
    if (total.value > 0) await load()
    else loaded.value = true
  }

  async function retry() {
    await load()
  }

  return { items, total, loading, loaded, error, hasMore, loadMore: load, ensureLoaded, retry }
}
