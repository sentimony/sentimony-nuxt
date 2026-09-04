# Frontend and documentation context

Read this file when work touches landmarks, shared focus behavior, scoped CSS,
Netlify Edge Functions, SEO, sitemap, robots, artist ordering, or documentation
organization. Universal guardrails remain in `AGENTS.md`.

## Landmarks

`<main id="main" tabindex="-1">` lives in `app/layouts/default.vue` and wraps the
hero, the route swipers and `<slot/>` (the `order-*` interleaving is why the slot
alone cannot be the landmark). Pages do not add their own `<main>`; `app/error.vue` is the exception
because it renders outside `NuxtLayout` and owns its `<main>` plus `<h1>`. The
skip link is the first layout template node and targets `#main`.

`scroll-padding-top/bottom: 5rem` on `html` compensates for the sticky header and
bottom player. The four `<nav>` elements are named `Main` (Header), `Footer`,
`Mobile` (drawer) and `Profile collection` (`app/pages/profile.vue`). Swipers use
`<section :aria-label="title ?? category">` without a local `<h2>` because they
render before the page `<h1>`. Lists expose loading, empty, and
error states through `<CollectionStatus>` (formerly `ProfileCollectionStatus`).
These invariants are covered by `tests/unit/landmarks.test.ts`,
`accessibleNames.test.ts`, and `collectionStatus.test.ts`.

## Focus surfaces and scoped CSS

Surfaces that intentionally stay dark in both themes override `--ring` locally.
The Footer value is synchronized with `.dark --ring` by a test. Tailwind v4's
`transition-colors` includes `outline-color`; use explicit `transition-[...]` when
the focus outline must not animate.

`@apply` in `<style scoped>` is unsupported by Tailwind v4's isolated CSS contexts
and fails with `Cannot apply unknown utility class`. Put utilities in template
`class=""` attributes, or add `@reference "tailwindcss"` as the first line of the
scoped block. Pure CSS for transitions and animations is fine without `@apply`.

- `not-sr-only` resets `position` to `static` and can override a bare `fixed`.
  Keep skip-link positioning in the same variant: `sr-only focus:not-sr-only
  focus:fixed focus:top-2`.
- Every exit from `error.vue` calls `clearError({ redirect })`. `PrimaryButton` is
  link-only and cannot handle the action; `DefaultButton` supports `isAction`.
- A `<div>` is invalid content inside a `<button>`. When a clickable `div` becomes
  a button, change inner blocks to `<span class="block">`.

## Netlify Edge Functions

`netlify/edge-functions/` contains `blocking.ts` (403 for PHP, WordPress, and
admin scanner probes), `redirects.ts` (legacy `.htm`/`.html` and dead platform
links), `trailing-slash-add.ts`, and `trailing-slash-remove.ts`.

## Performance baselines and deployment

Use `PERF_LABEL=... npm run perf:baseline` for first-load measurements. The script
walks every page kind and asset target from `scripts/lib/routes.mjs`, repeats each
target `PERF_RUNS` times (default 5), busts the cache to separate cold from warm,
reads CDN `cache-status`, optionally pulls PSI, and writes a Markdown table.
`PERF_LABEL` is required and `BASE_URL` defaults to production.

`perf:lighthouse` (`scripts/lighthouse-baseline.mjs`) is the lab-metric counterpart.
It drives `npx lighthouse@12` over six representative routes, accepts `LH_ROUTES`
as an override, takes the median of `LH_RUNS` (default 3), and writes
`docs/audits/data/lh-<LH_LABEL>.json`. It requires a local Chrome and downloads
Lighthouse on demand.

Include `sentimony-nuxt.netlify.app` in prod-vs-stage comparisons because
`sentimony.com` resolves to a stale US Netlify load balancer while `*.netlify.app`
uses the nearest PoP. The audit [`docs/audits/2026-08-11-branch-vs-prod-perf-audit.md`](../audits/2026-08-11-branch-vs-prod-perf-audit.md)
records the host effect and the comparison method. The Cloudflare path
(`build:cf`, `deploy:cf:*`) is for the Workers evaluation described in
[`docs/initiatives/cloudflare-domain.md`](../initiatives/cloudflare-domain.md);
production still uses the Netlify preset.

## Constants and types

`app/constants/nav.ts` owns navigation items, `inHeader`, and `isNavActive()` for
section-level active state. `icons.ts` is the Iconify and custom SVG registry;
`soclinks.ts` contains social links.

Shared types live in `app/types/index.ts`. Entities extend `BaseEntity` (`slug`,
`title`, `visible`, `date`). API responses use `XxxResponse` as
`Record<string, Xxx> | Xxx[]` for both backends.

## SEO, sitemap, and robots

Every public page calls `useSeoMeta()` for full OG and Twitter tags and
`useCanonical()` (`app/composables/useCanonical.ts`), a thin wrapper over
`useAbsoluteUrl()` that renders `<link rel="canonical">`. Brand defaults live in
`app/app.config.ts`. The sitemap is disabled on `stage--` deploys.

`@nuxtjs/sitemap` reads URLs from `/api/__sitemap__/urls`
(`server/api/__sitemap__/urls.get.ts`). The endpoint uses the pure,
unit-testable `buildSitemapUrls()` (`server/utils/sitemapUrls.ts`) and reads the
local generated `sentimony-db-export.json`; it never fetches live Firebase or
Supabase data. Track URLs reuse `parseTrackParagraph()` from `firebaseCatalog.ts`
so slugs stay aligned with `/api/track/[id]`.

Auth pages (`/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/confirm`)
and `/profile/**` use `routeRules` plus `buildNoindexRouteRules()` from
`server/utils/robotsPolicy.ts` for noindex behavior. In this Nuxt 4 and
`@nuxtjs/robots` setup, `definePageMeta({ robots: false })` is ineffective;
`pageMetaRobots` remains `{}` in the compiled bundle. The route rules also exclude
these paths from the sitemap, so `sitemap.exclude` needs no separate entry.

## Artist ordering

Use `sortArtistsForCatalog()` (`app/utils/artists.ts`) everywhere, including the
artists page and artist Swiper. `/artists/all` is the exception: it uses
`/api/artists-all` and `sortArtistsByCategory()` to include hidden artists. That
endpoint has the `/api/artists` fields plus `location` and omits the `visible`
filter. Client artist-name matching (`splitTitleByArtists` for release tracklists
and event lineups) also reads `/api/artists-all`, which keeps hidden artists
linkable and provides `photo_xl` to `<RelativeItem>` thumbnails. Categories render as
`musician` -> `dj` -> `mastering` -> `designer`; within each category, sort by
ascending numeric `category_id`.

For `category_id` numbering, follow [`docs/artist-numbering.md`](../artist-numbering.md).
The root `AGENTS.md` contains the daily rule for adding an artist; the linked
document contains aliases, historical ordering, and parking-range exceptions.

## Documentation organization

The repository docs root contains `README.md` (public stack and badges),
`PRODUCT.md` (product context and register), and `DESIGN.md` (design system and
color-token frontmatter).

`docs/roadmap.md` is the single initiative index. It uses statuses `Planned`,
`Partial`, `Idea`, `Implemented`, and `Descoped`; `Ініційовано` records when an idea
was first formulated, and `Last reviewed` records the latest code cross-check.
`docs/completed.md` is the completion history. Both filenames are lowercase, as
are other files in `docs/`, except `README.md`; `docs:check` enforces the casing.
Initiative descriptions live in `docs/initiatives/`, audit entries are indexed by
`docs/audits/README.md`, and new specs and plans belong in `docs/specs/` and
`docs/plans/` with names `YYYY-MM-DD-<topic>.md`. The
`docs/superpowers/specs|plans/` directories archive historical records. Dated
design briefs belong in `docs/impeccable/`.

Initiative status lives in both `docs/roadmap.md` and the initiative's
`- Status:` field. Update both. `npm run docs:check` validates status parity,
index coverage, links in living documents, the audit index, and dated filenames.
Dated audits, specs, and plans preserve the state from their own date; their links
are intentionally left unchanged during docs-tree refactors and are not checked.
