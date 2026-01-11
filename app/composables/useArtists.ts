import type { ArtistsResponse, AsyncDataOptions } from '~/types'

export function useArtists(options: AsyncDataOptions<ArtistsResponse> = {}) {
  return useAsyncData<ArtistsResponse>('artists', () => $fetch('/api/artists'), options)
}
