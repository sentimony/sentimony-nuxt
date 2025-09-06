export function useVideo<T = any>(id: string | number, options: any = {}) {
  return useAsyncData<T>(`video:${id}`, () => $fetch(`/api/video/${id}`), options)
}

