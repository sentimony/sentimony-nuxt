export function useTrackLikes() {
  const { isLiked, likeCount, toggleLike, setCount } = createLikes('track', '/api/track-likes')
  return {
    isTrackLiked: isLiked,
    toggleTrackLike: toggleLike,
    trackLikeCount: likeCount,
    setTrackCount: setCount,
  }
}
