# Sitemap and Indexing Design

## Goal

Make public Sentimony catalog pages discoverable through a complete sitemap generated from the local canonical export, while keeping auth/profile utility pages out of indexing.

## Decisions

- Source of truth: `server/data/sentimony-db-export.json`.
- Sitemap integration: use `@nuxtjs/sitemap` user source endpoint, not live Firebase/Supabase.
- Runtime endpoint: `/api/__sitemap__/urls` returns sitemap URL objects for the module.
- No remote sync scripts are involved.

## Sitemap Scope

The sitemap must include visible public entities:

- `/release/{slug}` from `releases`
- `/artist/{slug}` from `artists`
- `/track/{slug}` derived from visible release `tracklistCompact`
- `/video/{slug}` from `videos`
- `/playlist/{slug}` from `playlists`
- `/event/{slug}` from `events`
- `/friend/{slug}` from `friends`

The sitemap should also keep normal public static pages discovered by Nuxt where appropriate, such as `/`, `/news`, `/releases`, `/artists`, `/tracks`, `/videos`, `/playlists`, `/events`, `/friends`, and `/contacts`.

Excluded routes:

- `/signin`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/confirm`
- `/profile`
- `/profile/**`

## URL Shape

Each sitemap entry should use:

- `loc`: route path only, for example `/release/irukanji`
- `lastmod`: date from catalog item where reliable; omit when unavailable
- `changefreq`: stable catalog pages can use `monthly`
- `priority`: higher for list/static pages, medium for details

Track entries should use the same generated slug logic already used by `server/utils/firebaseCatalog.ts` so sitemap URLs match `server/api/track/[id].get.ts` fallback behavior.

## Indexing Metadata

Auth/profile utility pages must explicitly render noindex metadata. Public pages should render a canonical URL using the existing `useAbsoluteUrl()` pattern or a small shared helper if that reduces repetition.

The change must not add visible UI copy.

## Testing

Add focused Vitest coverage for the sitemap URL builder:

- includes visible release/artist/track/video/playlist/event/friend detail URLs;
- excludes `visible: false` entities;
- excludes auth/profile utility routes;
- derives track URLs from visible releases and `tracklistCompact`;
- produces deterministic output without reading Firebase/Supabase.

Add endpoint/config tests where practical:

- `/api/__sitemap__/urls` returns the helper output shape;
- `nuxt.config.ts` wires `sitemap.sources` to `/api/__sitemap__/urls`;
- noindex pages expose expected route/page metadata through testable helper constants if direct page-meta tests are brittle.

## Verification

Run:

- `npm run test:unit`
- targeted sitemap endpoint check through dev/build server if practical
- `npm run build` if sitemap module behavior needs integration confirmation

## Non-Goals

- Do not migrate catalog source away from Firebase/Supabase.
- Do not run `sync:firebase` or `sync:supabase`.
- Do not implement multilingual alternates.
- Do not add image/video sitemap extensions in this pass.
