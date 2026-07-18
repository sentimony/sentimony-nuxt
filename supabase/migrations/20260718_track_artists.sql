-- Normalized track<->artist links, derived from the CSV artist_slug column of
-- the catalog export by scripts/sync-supabase.mjs. No FK to artists: track CSVs
-- occasionally reference guest artists that have no row in the artists table.
create table if not exists public.track_artists (
  track_slug text not null references public.tracks(slug) on delete cascade,
  artist_slug text not null,
  position integer not null,
  primary key (track_slug, artist_slug)
);

create index if not exists track_artists_artist_slug_idx
  on public.track_artists (artist_slug);

alter table public.track_artists enable row level security;

drop policy if exists "track_artists_public_read" on public.track_artists;
create policy "track_artists_public_read" on public.track_artists
  for select using (true);

grant select on public.track_artists to anon, authenticated;
grant all on public.track_artists to service_role;
