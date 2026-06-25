import type { Video, AsyncDataOptions } from '~/types'

export function useVideo(id: string | number, options: AsyncDataOptions<Video> = {}) {
  return useAsyncData<Video>(`video:${id}`, () => $fetch<Video>(`/api/video/${id}`), options)
}
