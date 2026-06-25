-- Indexes for likes tables.
-- *_slug: count endpoints filter by slug only (.eq('<x>_slug', slug)).
-- (user_id, created_at desc): paginated liked-items lists order by created_at for a user.
-- The (user_id) leading column also serves the "list liked slugs" and delete queries.
-- The existing unique (user_id, <x>_slug) constraint already covers upsert onConflict.

create index if not exists release_likes_slug_idx on release_likes (release_slug);
create index if not exists release_likes_user_created_idx on release_likes (user_id, created_at desc);

create index if not exists artist_likes_slug_idx on artist_likes (artist_slug);
create index if not exists artist_likes_user_created_idx on artist_likes (user_id, created_at desc);

create index if not exists video_likes_slug_idx on video_likes (video_slug);
create index if not exists video_likes_user_created_idx on video_likes (user_id, created_at desc);

create index if not exists event_likes_slug_idx on event_likes (event_slug);
create index if not exists event_likes_user_created_idx on event_likes (user_id, created_at desc);

create index if not exists playlist_likes_slug_idx on playlist_likes (playlist_slug);
create index if not exists playlist_likes_user_created_idx on playlist_likes (user_id, created_at desc);

create index if not exists track_likes_slug_idx on track_likes (track_slug);
create index if not exists track_likes_user_created_idx on track_likes (user_id, created_at desc);
