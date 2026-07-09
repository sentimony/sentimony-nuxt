-- Structured per-track data (track_number, slug, artist, title, bpm, url)
-- synced from the local export; complements the legacy tracklist_compact text.

alter table releases add column if not exists tracklist jsonb;
