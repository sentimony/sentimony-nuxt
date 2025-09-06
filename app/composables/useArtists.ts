export function useArtists() {
  // useAsyncData with a stable key ensures deduplication across layout/page in SSR
  return useAsyncData('artists', () => $fetch('/api/artists'))
}

