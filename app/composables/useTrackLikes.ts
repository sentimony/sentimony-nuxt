export function useTrackLikes() {
  const { isLiked, likeCount, toggleLike, setCount } = createLikes('track', '/api/track-likes', '/api/track-likes/count/tracks')
  return {
    isTrackLiked: isLiked,
    toggleTrackLike: toggleLike,
    trackLikeCount: likeCount,
    setTrackCount: setCount,
  }
}
