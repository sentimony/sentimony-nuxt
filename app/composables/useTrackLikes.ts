export function useTrackLikes() {
  const { isLiked, likeCount, toggleLike, fetchCount, setCount } = createLikes('track', '/api/track-likes')
  return {
    isTrackLiked: isLiked,
    toggleTrackLike: toggleLike,
    trackLikeCount: likeCount,
    setTrackCount: setCount,
    fetchTrackCount: fetchCount,
  }
}
