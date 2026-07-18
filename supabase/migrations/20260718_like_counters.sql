-- Aggregated public like counters, one row per (entity, slug).
-- Maintained atomically by increment_like(); reads no longer SUM the per-user
-- rows on every catalog request.
create table if not exists public.like_counters (
  entity text not null,
  slug text not null,
  total bigint not null default 0,
  primary key (entity, slug)
);

alter table public.like_counters enable row level security;

drop policy if exists "like_counters_public_read" on public.like_counters;
create policy "like_counters_public_read" on public.like_counters
  for select using (true);

grant select on public.like_counters to anon, authenticated;
grant all on public.like_counters to service_role;

-- Extend the existing security-definer RPC: bump the aggregate in the same
-- transaction as the per-user row, so no trigger is needed (all like writes
-- already funnel through this function).
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
  v_entity text;
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

  v_entity := replace(p_table, '_likes', '');
  insert into public.like_counters (entity, slug, total)
  values (v_entity, p_slug, 1)
  on conflict (entity, slug) do update set total = like_counters.total + 1;

  return new_count;
end;
$$;

grant execute on function public.increment_like(text, text, text, uuid) to service_role;

-- Backfill aggregates from the per-user tables (idempotent).
insert into public.like_counters (entity, slug, total)
select 'release', release_slug, sum(count) from public.release_likes group by release_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'artist', artist_slug, sum(count) from public.artist_likes group by artist_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'track', track_slug, sum(count) from public.track_likes group by track_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'video', video_slug, sum(count) from public.video_likes group by video_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'event', event_slug, sum(count) from public.event_likes group by event_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'playlist', playlist_slug, sum(count) from public.playlist_likes group by playlist_slug
on conflict (entity, slug) do update set total = excluded.total;
