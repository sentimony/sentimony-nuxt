import type { FriendsResponse, AsyncDataOptions } from '~/types'

export function useFriends(options: AsyncDataOptions<FriendsResponse> = {}) {
  return useAsyncData<FriendsResponse>('friends', () => $fetch('/api/friends'), options)
}
