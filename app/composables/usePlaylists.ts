import type { PlaylistsResponse, AsyncDataOptions } from '~/types'

export function usePlaylists(options: AsyncDataOptions<PlaylistsResponse> = {}) {
  return useAsyncData<PlaylistsResponse>('playlists', () => $fetch('/api/playlists'), options)
}
