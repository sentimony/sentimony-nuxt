export default likedItemsHandler({ table: 'track_likes', slugCol: 'track_slug', entityTable: 'tracks', entitySelect: 'slug, title, artist_name, release_slug, track_number, bpm', defaultLimit: 20 })
