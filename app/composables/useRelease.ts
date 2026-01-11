import type { Release, AsyncDataOptions } from '~/types'

export function useRelease(id: string | number, options: AsyncDataOptions<Release> = {}) {
  return useAsyncData<Release>(`release:${id}`, () => $fetch(`/api/release/${id}`), options)
}
