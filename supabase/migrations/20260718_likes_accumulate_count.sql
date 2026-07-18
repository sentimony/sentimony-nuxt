-- Accumulating likes: every click is +1 (clap model), for both anonymous and authed users.
-- Store a per-(user_id, slug) click counter instead of a single toggle row.
-- Public like_count for an entity becomes SUM(count) across all rows for that slug.

alter table public.release_likes  add column if not exists count integer not null default 1;
alter table public.artist_likes   add column if not exists count integer not null default 1;
alter table public.track_likes    add column if not exists count integer not null default 1;
alter table public.video_likes    add column if not exists count integer not null default 1;
alter table public.event_likes    add column if not exists count integer not null default 1;
alter table public.playlist_likes add column if not exists count integer not null default 1;

-- Atomic increment. Fast successive clicks must not lose counts, so we do the
-- read-modify-write inside a single upsert with an ON CONFLICT increment.
-- security definer so it runs with owner rights (bypasses RLS, like the service-role path);
-- the table name is validated against a fixed allow-list to prevent SQL injection.
create or replace function public.increment_like(
  p_table text,
  p_slug_col text,
  p_slug text,
  p_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  if p_table not in (
    'release_likes','artist_likes','track_likes',
    'video_likes','event_likes','playlist_likes'
  ) then
    raise exception 'invalid table %', p_table;
  end if;

  if p_slug_col not in (
    'release_slug','artist_slug','track_slug',
    'video_slug','event_slug','playlist_slug'
  ) then
    raise exception 'invalid slug column %', p_slug_col;
  end if;

  execute format(
    'insert into public.%I (user_id, %I, count) values ($1, $2, 1)
       on conflict (user_id, %I) do update set count = %I.count + 1
       returning count',
    p_table, p_slug_col, p_slug_col, p_table
  )
  into new_count
  using p_user_id, p_slug;

  return new_count;
end;
$$;

grant execute on function public.increment_like(text, text, text, uuid) to service_role;
