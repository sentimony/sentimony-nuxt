import type { Artist, AsyncDataOptions } from '~/types'

export function useArtist(id: string | number, options: AsyncDataOptions<Artist> = {}) {
  return useAsyncData<Artist>(`artist:${id}`, () => $fetch<Artist>(`/api/artist/${id}`), options)
}
