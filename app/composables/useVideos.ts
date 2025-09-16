export function useVideos(options: any = {}) {
  // useAsyncData with a stable key ensures deduplication across layout/page in SSR
  return useAsyncData('videos', () => $fetch('/api/videos'), options)
}
