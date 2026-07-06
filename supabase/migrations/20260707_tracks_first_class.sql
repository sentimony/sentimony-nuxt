alter table tracks add column if not exists audio_url text;
alter table tracks drop constraint if exists tracks_release_track_key;
alter table tracks drop column if exists release_slug;
alter table tracks drop column if exists track_number;
