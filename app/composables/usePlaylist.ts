import type { Playlist, AsyncDataOptions } from '~/types'

export function usePlaylist(id: string | number, options: AsyncDataOptions<Playlist> = {}) {
  return useAsyncData<Playlist>(`playlist:${id}`, () => $fetch(`/api/playlist/${id}`), options)
}
