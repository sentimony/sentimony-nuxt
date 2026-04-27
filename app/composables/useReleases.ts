import type { ReleasesResponse, AsyncDataOptions } from '~/types'

export function useReleases(options: AsyncDataOptions<ReleasesResponse> = {}) {
  return useAsyncData<ReleasesResponse>('releases', () => $fetch('/api/releases'), options)
}
