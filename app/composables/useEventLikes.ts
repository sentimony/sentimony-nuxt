export function useEventLikes() {
  return createLikes('event', '/api/event-likes', '/api/event-likes/count/events')
}
