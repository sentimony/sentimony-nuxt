export function useArtists(options: any = {}) {
  // useAsyncData with a stable key ensures deduplication across layout/page in SSR
  return useAsyncData('artists', () => $fetch('/api/artists'), options)
}
