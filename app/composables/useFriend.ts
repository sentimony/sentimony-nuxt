export function useFriend<T = any>(id: string | number, options: any = {}) {
  return useAsyncData<T>(`friend:${id}`, () => $fetch(`/api/friend/${id}`), options)
}

