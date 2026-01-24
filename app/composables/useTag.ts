import type { Tag, AsyncDataOptions } from '~/types'

export function useTag(slug: string, options: AsyncDataOptions<Tag> = {}) {
  return useAsyncData<Tag>(`tag:${slug}`, () => $fetch(`/api/tag/${slug}`), options)
}
