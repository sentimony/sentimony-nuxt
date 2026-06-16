update artists set apple_music = applemusic_url where applemusic_url is not null and (apple_music is null or apple_music = '');
alter table artists drop column if exists applemusic_url;
