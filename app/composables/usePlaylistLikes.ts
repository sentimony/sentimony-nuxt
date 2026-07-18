export function usePlaylistLikes() {
  return createLikes('playlist', '/api/playlist-likes', '/api/playlist-likes/count/playlists')
}
