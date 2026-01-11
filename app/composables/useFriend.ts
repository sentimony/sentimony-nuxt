import type { Friend, AsyncDataOptions } from '~/types'

export function useFriend(id: string | number, options: AsyncDataOptions<Friend> = {}) {
  return useAsyncData<Friend>(`friend:${id}`, () => $fetch(`/api/friend/${id}`), options)
}
