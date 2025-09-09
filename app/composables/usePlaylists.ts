export function usePlaylists() {
  // useAsyncData with a stable key ensures deduplication across layout/page in SSR
  return useAsyncData('playlists', () => $fetch('/api/playlists'))
}
