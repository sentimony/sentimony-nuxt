import type { Event, AsyncDataOptions } from '~/types'

export function useEvent(id: string | number, options: AsyncDataOptions<Event> = {}) {
  return useAsyncData<Event>(`event:${id}`, () => $fetch<Event>(`/api/event/${id}`), options)
}
