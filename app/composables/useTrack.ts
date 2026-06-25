import type { TrackResponse, AsyncDataOptions } from '~/types'

export function useTrack(id: string | number, options: AsyncDataOptions<TrackResponse> = {}) {
  return useAsyncData<TrackResponse>(
    `track:${id}`,
    () => $fetch<TrackResponse>(`/api/track/${id}`),
    options,
  )
}
