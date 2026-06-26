export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)

  const empty = { releases: 0, tracks: 0, artists: 0, videos: 0, playlists: 0, events: 0 }
  if (!userId) return empty

  const [releases, tracks, artists, videos, playlists, events] = await Promise.all([
    countUserLikes('release_likes', userId),
    countUserLikes('track_likes', userId),
    countUserLikes('artist_likes', userId),
    countUserLikes('video_likes', userId),
    countUserLikes('playlist_likes', userId),
    countUserLikes('event_likes', userId),
  ])

  return { releases, tracks, artists, videos, playlists, events }
})
