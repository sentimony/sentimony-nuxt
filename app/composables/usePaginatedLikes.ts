export type PaginatedLikesResponse<T> = { data: T[], total: number }

export function usePaginatedLikes<T extends object>(
  url: string,
  limit: number,
  initial?: PaginatedLikesResponse<T>,
) {
  const items = ref<T[]>(initial?.data ? [...initial.data] : []) as Ref<T[]>
  const total = ref(initial?.total ?? 0)
  const page = ref(initial ? 1 : 0)
  const loading = ref(false)
  const hasMore = computed(() => items.value.length < total.value)

  async function load() {
    if (loading.value) return
    loading.value = true
    const res = await $fetch<PaginatedLikesResponse<T>>(url, {
      query: { page: page.value, limit }
    }).catch((err) => {
      console.error(`[usePaginatedLikes] ${url}:`, err)
      return { data: [], total: 0 } as PaginatedLikesResponse<T>
    })
    items.value = items.value.concat(res.data)
    total.value = res.total
    page.value++
    loading.value = false
  }

  onMounted(() => {
    if (!initial) load()
  })

  return { items, total, loading, hasMore, loadMore: load }
}
