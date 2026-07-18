export function useLikes() {
  return createLikes('release', '/api/likes', '/api/likes/count/releases')
}
