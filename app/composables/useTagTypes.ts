import type { TagTypesResponse, AsyncDataOptions } from '~/types'

export function useTagTypes(options: AsyncDataOptions<TagTypesResponse> = {}) {
  return useAsyncData<TagTypesResponse>('tag-types', () => $fetch('/api/tag-types'), options)
}
