export function useArtist<T = any>(id: string | number, options: any = {}) {
  return useAsyncData<T>(`artist:${id}`, () => $fetch(`/api/artist/${id}`), options)
}

