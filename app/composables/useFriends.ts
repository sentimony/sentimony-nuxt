export function useFriends() {
  // Stable key to dedupe across views/layouts
  return useAsyncData('friends', () => $fetch('/api/friends'))
}

