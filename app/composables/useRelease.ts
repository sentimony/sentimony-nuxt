export function useRelease<T = any>(id: string | number, options: any = {}) {
  // Stable key per release id; dedupes across layout/page in SSR
  return useAsyncData<T>(`release:${id}`, () => $fetch(`/api/release/${id}`), options)
}

