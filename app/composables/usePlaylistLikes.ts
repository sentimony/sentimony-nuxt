export function usePlaylistLikes() {
  return createLikes('playlist', '/api/playlist-likes')
}
