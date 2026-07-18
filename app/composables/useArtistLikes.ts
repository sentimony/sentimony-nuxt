export function useArtistLikes() {
  return createLikes('artist', '/api/artist-likes', '/api/artist-likes/count/artists')
}
