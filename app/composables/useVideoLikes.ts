export function useVideoLikes() {
  return createLikes('video', '/api/video-likes', '/api/video-likes/count/videos')
}
