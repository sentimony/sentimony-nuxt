export function usePlaylist<T = any>(id: string | number, options: any = {}) {
  return useAsyncData<T>(`playlist:${id}`, () => $fetch(`/api/playlist/${id}`), options)
}

