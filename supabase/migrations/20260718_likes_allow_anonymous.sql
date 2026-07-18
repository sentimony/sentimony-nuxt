-- Allow anonymous (device-id) likes across all entities.
-- Drop the auth.users foreign key on every *_likes table so that a client-generated
-- anonymous UUID (stored in the `sentimony_anon_id` cookie) can be written to user_id.
-- Writes still go exclusively through the service-role client, so RLS stays intact.
-- Trade-off: deleting an auth user no longer cascades their likes away; orphaned rows
-- keep the same UUID and are harmless to the public like counters.

alter table public.release_likes  drop constraint if exists release_likes_user_id_fkey;
alter table public.artist_likes   drop constraint if exists artist_likes_user_id_fkey;
alter table public.track_likes    drop constraint if exists track_likes_user_id_fkey;
alter table public.video_likes    drop constraint if exists video_likes_user_id_fkey;
alter table public.event_likes    drop constraint if exists event_likes_user_id_fkey;
alter table public.playlist_likes drop constraint if exists playlist_likes_user_id_fkey;
