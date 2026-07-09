-- Anonymous play counters for release tracks, keyed by canonical track slug
-- (`<release_slug>-<track_number>`, same key space as track_likes.track_slug).
-- Writes go through the service-role client only; public reads are allowed.

create table if not exists track_plays (
  track_slug text primary key,
  play_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table track_plays enable row level security;

create policy "track_plays_public_read" on track_plays for select using (true);

create or replace function increment_track_play(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into track_plays (track_slug, play_count, updated_at)
  values (p_slug, 1, now())
  on conflict (track_slug)
  do update set play_count = track_plays.play_count + 1, updated_at = now();
$$;
