export default likedItemsHandler({ table: 'track_likes', slugCol: 'track_slug', entityTable: 'tracks', entitySelect: 'slug, title, artist_name, artist_slug, bpm, audio_url', defaultLimit: 20 })
