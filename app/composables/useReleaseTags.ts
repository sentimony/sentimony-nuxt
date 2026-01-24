import type { Tag, AsyncDataOptions } from '~/types'

export function useReleaseTags(releaseSlug: string, options: AsyncDataOptions<Tag[]> = {}) {
  return useAsyncData<Tag[]>(
    `release-tags:${releaseSlug}`,
    () => $fetch(`/api/release/${releaseSlug}/tags`),
    options
  )
}
