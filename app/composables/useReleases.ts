export function useReleases() {
  // useAsyncData with a stable key ensures deduplication across layout/page in SSR
  return useAsyncData('releases', () => $fetch('/api/releases'))
}
