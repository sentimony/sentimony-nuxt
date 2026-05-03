INSERT INTO public.artists (
  slug, title, visible, name, location, style, information,
  soundcloud_url, bandcamp_url, facebook, spotify
) VALUES (
  'alien-immigrant',
  'Alien Immigrant',
  false,
  'Maksym Finchuk',
  'Michigan, United States',
  'Psychill, Psydub',
  'Alien Immigrant, an electronic project by a Ukrainian multi-instrumentalist Maksym Finchuk, delves into a diverse array of psychedelic genres, spanning organic psychill to forest psytrance.

Maksym''s fascination with psychedelic rock legends such as the Doors, Pink Floyd, and Jimi Hendrix ignited at a young age, gradually expanding into a broader interest in psychedelic sound.

Alien Immigrant''s soundscape is a captivating fusion of live recordings and synthesized sounds, transporting listeners to fantastical and sci-fi-inspired realms.',
  'https://soundcloud.com/alien_immigrant',
  'https://alienimmigrant.bandcamp.com/',
  'https://www.facebook.com/profile.php?id=61575371733365',
  'https://open.spotify.com/artist/4Y3JzPONLkJJxURbejMK6Z'
);

INSERT INTO public.releases (
  slug, title, cat_no, visible, date, format, style, artists, tracks_number, total_time
) VALUES (
  'alien-immigrant-lucid-dreaming',
  'Alien Immigrant «Lucid Dreaming» EP',
  'SENCD099',
  false,
  '2026-05-08T00:00:00+00:00',
  'EP',
  'Psychill, Psydub',
  'Alien Immigrant',
  '3',
  '17m 49s'
);

INSERT INTO public.tracks (slug, title, artist_slug, artist_name, release_slug, track_number, bpm)
VALUES
  ('alien-immigrant-dub-train',      'Dub Train',      'alien-immigrant', 'Alien Immigrant', 'alien-immigrant-lucid-dreaming', 1, 68),
  ('alien-immigrant-lucid-dreaming', 'Lucid Dreaming', 'alien-immigrant', 'Alien Immigrant', 'alien-immigrant-lucid-dreaming', 2, 81),
  ('alien-immigrant-plant-medicine', 'Plant Medicine', 'alien-immigrant', 'Alien Immigrant', 'alien-immigrant-lucid-dreaming', 3, 87);
