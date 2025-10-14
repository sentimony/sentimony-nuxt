export function useFriends(options: any = {}) {
  // Stable key to dedupe across views/layouts
  return useAsyncData('friends', () => $fetch('/api/friends'), options)
}
