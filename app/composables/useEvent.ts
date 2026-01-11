import type { Event, AsyncDataOptions } from '~/types'

export function useEvent(id: string | number, options: AsyncDataOptions<Event> = {}) {
  return useAsyncData<Event>(`event:${id}`, () => $fetch(`/api/event/${id}`), options)
}
