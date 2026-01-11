import type { EventsResponse, AsyncDataOptions } from '~/types'

export function useEvents(options: AsyncDataOptions<EventsResponse> = {}) {
  return useAsyncData<EventsResponse>('events', () => $fetch('/api/events'), options)
}
