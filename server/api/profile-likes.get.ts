export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  if (!userId) return {
    releases: { data: [], total: 0 },
    tracks: { data: [], total: 0 },
    artists: { data: [], total: 0 },
    videos: { data: [], total: 0 },
    playlists: { data: [], total: 0 },
    events: { data: [], total: 0 },
  }

  const pagination = { page: 0, limit: 25 }

  return aggregateProfileLikes({
    releases: () => fetchLikedItems(event, {
      table: 'release_likes',
      slugCol: 'release_slug',
      entityTable: 'releases',
      entitySelect: 'slug, title, cover_th, date',
      visibleOnly: true,
    }, userId, pagination),
    tracks: () => fetchLikedItems(event, {
      table: 'track_likes',
      slugCol: 'track_slug',
      entityTable: 'tracks',
      entitySelect: 'slug, title, artist_name, release_slug, track_number, bpm',
    }, userId, pagination),
    artists: () => fetchLikedItems(event, {
      table: 'artist_likes',
      slugCol: 'artist_slug',
      entityTable: 'artists',
      entitySelect: 'slug, title, photo_th',
      visibleOnly: true,
    }, userId, pagination),
    videos: () => fetchLikedItems(event, {
      table: 'video_likes',
      slugCol: 'video_slug',
      entityTable: 'videos',
      entitySelect: 'slug, title, cover_th',
      visibleOnly: true,
    }, userId, pagination),
    playlists: () => fetchLikedItems(event, {
      table: 'playlist_likes',
      slugCol: 'playlist_slug',
      entityTable: 'playlists',
      entitySelect: 'slug, title, cover_th',
      visibleOnly: true,
    }, userId, pagination),
    events: () => fetchLikedItems(event, {
      table: 'event_likes',
      slugCol: 'event_slug',
      entityTable: 'events',
      entitySelect: 'slug, title, flyer_a_xl',
      visibleOnly: true,
    }, userId, pagination),
  })
})
