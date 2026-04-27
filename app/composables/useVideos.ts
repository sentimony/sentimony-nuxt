import type { VideosResponse, AsyncDataOptions } from '~/types'

export function useVideos(options: AsyncDataOptions<VideosResponse> = {}) {
  return useAsyncData<VideosResponse>('videos', () => $fetch('/api/videos'), options)
}
