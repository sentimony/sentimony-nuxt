export function useEvent<T = any>(id: string | number, options: any = {}) {
  return useAsyncData<T>(`event:${id}`, () => $fetch(`/api/event/${id}`), options)
}

