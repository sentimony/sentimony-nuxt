import type { TagsResponse, TagsQueryParams, AsyncDataOptions } from '~/types'

export function useTags(
  params: TagsQueryParams = {},
  options: AsyncDataOptions<TagsResponse> = {}
) {
  // Build query string from params
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.set('page', String(params.page))
  if (params.limit) queryParams.set('limit', String(params.limit))
  if (params.type) queryParams.set('type', params.type)
  if (params.name) queryParams.set('name', params.name)

  const queryString = queryParams.toString()
  const url = queryString ? `/api/tags?${queryString}` : '/api/tags'

  // Create unique key based on params
  const key = `tags:${queryString || 'all'}`

  return useAsyncData<TagsResponse>(key, () => $fetch(url), options)
}
