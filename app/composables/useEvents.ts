export function useEvents() {
  // useAsyncData with a stable key ensures deduplication across layout/page in SSR
  return useAsyncData('events', () => $fetch('/api/events'))
}
