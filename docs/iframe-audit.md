# Iframe audit — 4 item pages (2026-05-09)

Total iframes today: 10 (release: 4 + artist: 2 + playlist: 3 + video: 1).

Each `<iframe>` is wrapped in a `<Tab>` component which uses `v-show` to switch between tabs, meaning every iframe is mounted and connects to its third-party origin on initial page load. After the lazy-iframe migration, only 1 iframe should be active per page on initial load.

## release/[id].vue — 4 iframes
- Line 236: **Bandcamp** — Tab has NO `v-if` (always visible, default tab); iframe gated `v-if="item.links?.bandcamp_id"`; src `bandcamp.com/EmbeddedPlayer/album=...`
- Line 258: **YouTube** — Tab `v-if="item.links?.youtube_playlist_id"`; src `youtube-nocookie.com/embed/videoseries?list=...`
- Line 276: **SoundCloud** — Tab `v-if="item.links?.soundcloud_playlist_id"`; src `w.soundcloud.com/player/?url=.../playlists/...`
- Line 294: **YouTube Music** — Tab `v-if="item.links?.youtube_music"`; src `embedYTMusic` computed (from `useYouTubeMusicPlaylist`)

## playlist/[id].vue — 3 iframes
- Line 140: **YouTube** — Tab has NO `v-if` (always visible, default tab); iframe gated `v-if="item.links?.youtube"`; src `embedYouTube` computed
- Line 162: **SoundCloud** — Tab `v-if="item.links?.soundcloud_playlist_id"`; src `w.soundcloud.com/player/?url=.../playlists/...`
- Line 178: **YouTube Music** — Tab `v-if="item.links?.youtube_music"`; src `embedYTMusic` computed

## artist/[id].vue — 2 iframes
- Line 169: **YouTube** — Tab `v-if="item.youtube_playlist_id"`; src `youtube-nocookie.com/embed/videoseries?list=...`
- Line 186: **SoundCloud** — Tab `v-if="item.soundcloud_track_id"`; src `w.soundcloud.com/player/?url=.../tracks/...` (track player)

## video/[id].vue — 1 iframe
- Line 99: **YouTube** — Tab `v-if="item.links?.youtube"`; src `embed` computed (from `useYouTube`)
