export function usePaginatedLikes<T extends object>(url: string, limit: number) {
  const items: Ref<T[]> = ref([])
  const total = ref(0)
  const page = ref(0)
  const loading = ref(false)
  const hasMore = computed(() => items.value.length < total.value)

  async function load() {
    if (loading.value) return
    loading.value = true
    type Response = { data: T[], total: number }
    const res = await $fetch<Response>(url, {
      query: { page: page.value, limit }
    }).catch((err) => {
      console.error(`[usePaginatedLikes] ${url}:`, err)
      return { data: [], total: 0 } as Response
    })
    items.value = items.value.concat(res.data)
    total.value = res.total
    page.value++
    loading.value = false
  }

  onMounted(() => load())

  return { items, total, loading, hasMore, loadMore: load }
}
