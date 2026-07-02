# Custom Audio Player Design

## Goal

Replace the third-party SoundCloud iframe embed on artist pages with a self-hosted, self-built audio player, scoped first to `/artist/hagen` playing his "Tempo Syndicate" DJ mix. Avoid a project-wide rework: keep the existing YouTube/SoundCloud iframe tabs working for the three other artists that still use `soundcloud_track_id`.

## Assumptions (unconfirmed — flag for review)

Clarifying questions during design timed out with no user response, so these defaults were chosen by best judgment and need confirmation before implementation starts:

- The mixed audio file for Hagen's "Tempo Syndicate" set does not exist yet locally; obtaining/uploading it is a manual prerequisite outside this spec's code changes.
- Storage: Cloudflare R2, not the existing Netlify-hosted `content.sentimony.com`.
- Player scope: simple transport controls (play/pause/seek/volume) plus a static, non-clickable tracklist. No per-track cue-point seeking (would require manually timestamping all 12 tracks — out of scope).

## Decisions

- **Storage:** Cloudflare R2 (S3-compatible object storage), not Cloudflare Stream. R2 has zero egress fees, native HTTP Range request support (required for `<audio>` seeking without downloading the whole file), and a plain public URL — no proprietary embed/player forced on us, unlike Cloudflare Stream.
- **New domain:** a new Cloudflare-managed public custom domain (e.g. `audio.sentimony.com`) pointed at the R2 bucket. Kept separate from `content.sentimony.com`, which is a Netlify-hosted site, not Cloudflare.
- **No new npm dependency.** Native HTML5 `<audio>` element wrapped in custom Tailwind-styled controls, consistent with "don't rework the whole project."
- **Data source of truth stays `sentimony-db-export.json`**, same as every other catalog field.

## Infrastructure Setup (manual, one-time)

Requires the Cloudflare account owner; not scriptable from this repo:

1. Create an R2 bucket (e.g. `sentimony-audio`).
2. Enable public access and connect a custom domain (e.g. `audio.sentimony.com`) to the bucket via Cloudflare dashboard.
3. Upload the mix file to `mixes/hagen-tempo-syndicate.mp3` (or `.m4a`) in the bucket.
4. Confirm the public URL serves with `Accept-Ranges: bytes` (R2 does this by default) — required for seek-to-position to work without a full re-download.

## Data Model

Add to `Artist` (`app/types/index.ts`):

```ts
mix_audio_url?: string
mix_title?: string
mix_release_slug?: string
```

Populate only the `hagen` entry in `server/data/server/sentimony-db-export.json`:

```json
"mix_audio_url": "https://audio.sentimony.com/mixes/hagen-tempo-syndicate.mp3",
"mix_title": "Tempo Syndicate DJ Mix",
"mix_release_slug": "va-tempo-syndicate"
```

No other artist gets these fields in this pass.

**Catalog source note:** the project defaults to `CATALOG_SOURCE=firebase` (`nuxt.config.ts:9`). Firebase Realtime DB is schemaless, so these new fields work as soon as `sync:firebase` runs — no migration needed. If the project is ever run against Supabase, the `artists` table needs a migration adding `mix_audio_url`/`mix_title`/`mix_release_slug` columns before `sync:supabase` will carry them through. That migration is a follow-up, not part of this pass, since Firebase is the default runtime source.

## Component: `AudioMixPlayer.vue`

New component in `app/components/`, following existing naming (PascalCase, flat, auto-imported):

- Props: `src: string`, `title?: string`, `tracklist?: CompactParagraph[]` (same shape as `Release.tracklistCompact`).
- Native `<audio ref>` element (not rendered visibly — `class="hidden"` or `sr-only`), driven by custom controls:
  - Play/pause button — `<Icon name="lucide:play" />` / `<Icon name="lucide:pause" />`, toggled off `audio.paused`.
  - Seek bar — range input bound to `audio.currentTime` / `audio.duration`, updated on `timeupdate`.
  - Elapsed / total duration — `mm:ss` formatting, rendered with `font-mono` (project convention for technical/time data).
  - Volume control — range input bound to `audio.volume`.
- If `tracklist` is passed, render it below the transport controls as a static (non-clickable) informational list — no per-track timestamps exist to seek to.
- No Web Audio API, no waveform rendering — keeps the component small and dependency-free.

## Integration Point

`app/pages/artist/[id].vue` already has a `<Tabs>` block with conditional `<Tab>` entries for YouTube (`item.youtube_playlist_id`) and SoundCloud (`item.soundcloud_track_id`) iframes. Those stay untouched — 3 other artists still rely on the SoundCloud iframe tab.

Add a new tab, gated on the new field, positioned before the existing tabs so it's the default-selected tab when present:

```vue
<Tab
  v-if="item.mix_audio_url"
  icon="lucide:music"
  title="Mix"
>
  <AudioMixPlayer
    :src="item.mix_audio_url"
    :title="item.mix_title"
    :tracklist="mixRelease?.tracklistCompact"
  />
</Tab>
```

`mixRelease` is a new computed on the page: `releasesSortedByDate.value.find(r => r.slug === item.value?.mix_release_slug)`. A generic "find the release whose credits mention this artist as DJ mixer" lookup would be over-engineering for a single artist right now — a direct slug reference (`mix_release_slug`) is simpler and equally explicit.

## Testing

- Vitest unit test for the `mm:ss` duration formatter (edge cases: 0s, sub-minute, over an hour since the mix is ~80 minutes).
- Vitest component test for `AudioMixPlayer.vue`: renders controls, toggles play/pause icon state, seek bar reflects `currentTime`.
- Manual verification in dev: confirm `/artist/hagen` shows the Mix tab, playback starts, seeking works, and the tab is absent for artists without `mix_audio_url`.

## Verification

- `npm run test:unit`
- `npx nuxi typecheck`
- Manual playback check against the real R2-hosted file once uploaded (seek near the end of an 80-minute file to confirm Range requests work, not just the first buffered chunk).

## Non-Goals

- No rework of the SoundCloud/YouTube iframe tabs for other artists.
- No per-track cue-point seeking / clickable tracklist.
- No waveform visualization.
- No new npm audio library (Howler, wavesurfer, Plyr, etc.).
- No Supabase migration in this pass (Firebase is the active default catalog source).
- Sourcing/producing the actual mix audio file is out of scope — treated as an external prerequisite.
