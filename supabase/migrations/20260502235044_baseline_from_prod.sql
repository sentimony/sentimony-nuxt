--
-- PostgreSQL database dump
--

\restrict PcoZHe14uKMeL0k2YnId1GNvBfr6UWPzKYDY88lFugrUN5Ko5duMdVRa6IIoKpV

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artist_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artist_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    artist_slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: artists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artists (
    slug text NOT NULL,
    title text,
    visible boolean DEFAULT false,
    category text,
    category_id integer,
    name text,
    location text,
    style text,
    photo_og text,
    photo_th text,
    photo_xl text,
    information text,
    soundcloud_url text,
    soundcloud_label_playlist_id text,
    soundcloud_artist_playlist_id text,
    mixcloud text,
    youtube_playlist_id text,
    spotify text,
    discogs text,
    facebook text,
    facebook_personal text,
    instagram text,
    instagram_personal text,
    bandcamp_url text,
    youtube_url text,
    website text,
    applemusic_url text,
    photo text,
    photo_02_og text,
    photo_02_th text,
    photo_02_xl text,
    soundcloud_track_id text,
    wikipedia_url text,
    youtube_artist_playlist_id text,
    youtubemusic_url text
);


--
-- Name: event_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    slug text NOT NULL,
    title text,
    visible boolean DEFAULT false,
    date timestamp with time zone,
    "time" text,
    location text,
    info text,
    flyer_a_xl text,
    flyer_b_xl text,
    lineup jsonb,
    links jsonb
);


--
-- Name: friends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friends (
    slug text NOT NULL,
    title text,
    visible boolean DEFAULT false,
    links jsonb
);


--
-- Name: playlist_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlist_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    playlist_slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlists (
    slug text NOT NULL,
    title text,
    visible boolean DEFAULT false,
    date timestamp with time zone,
    style text,
    cover_og text,
    cover_th text,
    cover_xl text,
    info text,
    links jsonb
);


--
-- Name: release_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.release_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    release_slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: releases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.releases (
    slug text NOT NULL,
    title text,
    cat_no text,
    visible boolean DEFAULT false,
    date timestamp with time zone,
    coming_soon boolean DEFAULT false,
    is_new boolean DEFAULT false,
    style text,
    cover_og text,
    cover_th text,
    cover_xl text,
    tracks_number text,
    total_time text,
    format text,
    artists text,
    relative_releases text,
    at_playlists text,
    information text,
    tracklist_compact jsonb,
    credits_compact jsonb,
    links jsonb
);


--
-- Name: track_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.track_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    track_slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tracks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    artist_slug text NOT NULL,
    artist_name text NOT NULL,
    release_slug text NOT NULL,
    track_number integer NOT NULL,
    bpm integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: video_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    video_slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    slug text NOT NULL,
    title text,
    visible boolean DEFAULT false,
    date timestamp with time zone,
    format text,
    cover_og text,
    cover_th text,
    cover_xl text,
    information text,
    credits text,
    links jsonb
);


--
-- Name: artist_likes artist_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_likes
    ADD CONSTRAINT artist_likes_pkey PRIMARY KEY (id);


--
-- Name: artist_likes artist_likes_user_id_artist_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_likes
    ADD CONSTRAINT artist_likes_user_id_artist_slug_key UNIQUE (user_id, artist_slug);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (slug);


--
-- Name: event_likes event_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_likes
    ADD CONSTRAINT event_likes_pkey PRIMARY KEY (id);


--
-- Name: event_likes event_likes_user_id_event_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_likes
    ADD CONSTRAINT event_likes_user_id_event_slug_key UNIQUE (user_id, event_slug);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (slug);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (slug);


--
-- Name: playlist_likes playlist_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_likes
    ADD CONSTRAINT playlist_likes_pkey PRIMARY KEY (id);


--
-- Name: playlist_likes playlist_likes_user_id_playlist_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_likes
    ADD CONSTRAINT playlist_likes_user_id_playlist_slug_key UNIQUE (user_id, playlist_slug);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (slug);


--
-- Name: release_likes release_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_likes
    ADD CONSTRAINT release_likes_pkey PRIMARY KEY (id);


--
-- Name: release_likes release_likes_user_id_release_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_likes
    ADD CONSTRAINT release_likes_user_id_release_slug_key UNIQUE (user_id, release_slug);


--
-- Name: releases releases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_pkey PRIMARY KEY (slug);


--
-- Name: track_likes track_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_likes
    ADD CONSTRAINT track_likes_pkey PRIMARY KEY (id);


--
-- Name: track_likes track_likes_user_id_track_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_likes
    ADD CONSTRAINT track_likes_user_id_track_slug_key UNIQUE (user_id, track_slug);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: tracks tracks_release_track_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_release_track_key UNIQUE (release_slug, track_number);


--
-- Name: tracks tracks_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_slug_key UNIQUE (slug);


--
-- Name: video_likes video_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_pkey PRIMARY KEY (id);


--
-- Name: video_likes video_likes_user_id_video_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_user_id_video_slug_key UNIQUE (user_id, video_slug);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (slug);


--
-- Name: artist_likes_artist_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX artist_likes_artist_slug_idx ON public.artist_likes USING btree (artist_slug);


--
-- Name: event_likes_event_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_likes_event_slug_idx ON public.event_likes USING btree (event_slug);


--
-- Name: playlist_likes_playlist_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX playlist_likes_playlist_slug_idx ON public.playlist_likes USING btree (playlist_slug);


--
-- Name: release_likes_release_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX release_likes_release_slug_idx ON public.release_likes USING btree (release_slug);


--
-- Name: tracks_artist_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tracks_artist_slug_idx ON public.tracks USING btree (artist_slug);


--
-- Name: tracks_release_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tracks_release_slug_idx ON public.tracks USING btree (release_slug);


--
-- Name: video_likes_video_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX video_likes_video_slug_idx ON public.video_likes USING btree (video_slug);


--
-- Name: artist_likes artist_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artist_likes
    ADD CONSTRAINT artist_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: event_likes event_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_likes
    ADD CONSTRAINT event_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: playlist_likes playlist_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_likes
    ADD CONSTRAINT playlist_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: release_likes release_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_likes
    ADD CONSTRAINT release_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: track_likes track_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_likes
    ADD CONSTRAINT track_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: video_likes video_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tracks Public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read" ON public.tracks FOR SELECT USING (true);


--
-- Name: track_likes Users can delete own track likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own track likes" ON public.track_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: track_likes Users can insert own track likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own track likes" ON public.track_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: track_likes Users can read own track likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own track likes" ON public.track_likes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: artist_likes Users delete own artist likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own artist likes" ON public.artist_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: event_likes Users delete own event likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own event likes" ON public.event_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: playlist_likes Users delete own playlist likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own playlist likes" ON public.playlist_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: release_likes Users delete own release likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own release likes" ON public.release_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: video_likes Users delete own video likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own video likes" ON public.video_likes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: artist_likes Users insert own artist likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own artist likes" ON public.artist_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: event_likes Users insert own event likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own event likes" ON public.event_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: playlist_likes Users insert own playlist likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own playlist likes" ON public.playlist_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: release_likes Users insert own release likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own release likes" ON public.release_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: video_likes Users insert own video likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own video likes" ON public.video_likes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: artist_likes Users see own artist likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own artist likes" ON public.artist_likes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: event_likes Users see own event likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own event likes" ON public.event_likes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: playlist_likes Users see own playlist likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own playlist likes" ON public.playlist_likes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: release_likes Users see own release likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own release likes" ON public.release_likes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: video_likes Users see own video likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own video likes" ON public.video_likes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: artist_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artist_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: artists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

--
-- Name: event_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: friends; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

--
-- Name: playlist_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.playlist_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: playlists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

--
-- Name: artists public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read" ON public.artists FOR SELECT USING (true);


--
-- Name: events public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read" ON public.events FOR SELECT USING (true);


--
-- Name: friends public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read" ON public.friends FOR SELECT USING (true);


--
-- Name: playlists public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read" ON public.playlists FOR SELECT USING (true);


--
-- Name: releases public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read" ON public.releases FOR SELECT USING (true);


--
-- Name: videos public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public read" ON public.videos FOR SELECT USING (true);


--
-- Name: release_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.release_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: releases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

--
-- Name: track_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.track_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: tracks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

--
-- Name: video_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: videos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict PcoZHe14uKMeL0k2YnId1GNvBfr6UWPzKYDY88lFugrUN5Ko5duMdVRa6IIoKpV

