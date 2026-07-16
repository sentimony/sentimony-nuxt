# Lighthouse LCP Optimization — Design Spec

**Date:** 2026-07-13
**Branch:** `lighthouse-improve`
**Scope:** Performance category only (per user). Homepage LCP is the single serious problem.

## Problem

Clean production baseline (`NITRO_PRESET=node-server` build, served via
`node .output/server/index.mjs`, Lighthouse desktop preset):

| Metric | Value | Score |
| --- | --- | --- |
| Performance | **68** | — |
| First Contentful Paint | 1.7 s | 0.43 |
| Largest Contentful Paint | **5.7 s** | **0.05** |
| Total Blocking Time | 0 ms | 1.0 |
| Cumulative Layout Shift | 0.002 | 1.0 |
| Speed Index | 1.7 s | 0.74 |

JS execution (TBT=0) and layout stability (CLS≈0) are already excellent. The **only**
serious problem is LCP 5.7 s, of which **98 % is Render Delay (5591 ms)**. The LCP
element is the text "SENTIMONY" (`div.font-julius`), not an image — so the fix is
unblocking first render, not image loading of the LCP node itself.

> Measurement note: an earlier baseline of 50 was invalid — a stale `nuxt dev` server
> was listening on the same port and Lighthouse hit it (`@fs/` paths, source maps, no
> compression). All numbers here are from a verified prod build with 0 dev artifacts.
> `uses-text-compression` savings reported locally are an artifact of the local
> node-server not gzipping; Netlify's CDN compresses in production, so that audit is
> **out of scope**.

## Root causes (evidence-backed)

1. **`flag-icons` CSS bloats the render-blocking entry.** `entry.css` is **447 KB**,
   containing **542 `.fi-xx` country classes** (data-URI SVG flags for every country).
   It is registered **globally** in `nuxt.config.ts` (`css: [...]`, line 61) but used
   on exactly **one** page — `app/pages/artists/all.vue`. It render-blocks first paint
   by ~1.2 s on every route.

2. **`trees-origin_v1.jpg` (382 KB waste) — global forest background.** Set via CSS
   `background-image: url(...)` in `app/assets/css/tailwind.css:118` (also referenced in
   `app/components/HomepageAtmosphere.vue:24`). Served as JPG, not a modern format;
   `<NuxtImg>` never touches it because it is a CSS background.

3. **`irukanji-01_xl.jpg` (510 KB waste) — homepage image flagged by
   `uses-responsive-images` and `modern-image-formats`.** Note: `HomepageAtmosphere.vue`
   itself uses the same `trees-origin_v1.jpg` as (2); this `irukanji` asset comes from a
   different homepage element. The plan must locate its exact source (a `<NuxtImg>` in
   the artist swiper / hero vs. a raw background) before choosing the transform.

## Goal

| Metric | Baseline | Target |
| --- | --- | --- |
| Performance (desktop) | 68 | ≥ 85 |
| LCP (homepage) | 5.7 s | < 2.5 s |
| `entry.css` (render-blocking) | 447 KB | < 20 KB |
| Flags on `/artists/all` | work | still work |
| Backgrounds in dev **and** prod | work | still work |

Explicitly **not** touched: Supabase bundle (TBT=0, not worth the risk),
`uses-text-compression` (local-server artifact), `unused-javascript` (secondary once
flag-icons is gone).

## Design

### 1. Scope `flag-icons` to its only consumer

- Remove `'flag-icons/css/flag-icons.min.css'` from the global `css: [...]` array in
  `nuxt.config.ts` (line 61).
- Add a local, **non-scoped** import inside `app/pages/artists/all.vue`:
  ```vue
  <style>
  @import 'flag-icons/css/flag-icons.min.css';
  </style>
  ```
  Non-scoped because the `.fi-*` classes are applied via `:class="`fi fi-${...}`"`, not
  inside the component's style scope. Vite emits this as a per-page CSS chunk loaded only
  on `/artists/all`.

**Effect:** 447 KB of CSS leaves `entry.css` on every route except `/artists/all`.
Render-blocking entry CSS drops from ~448 KB to ~1 KB → homepage LCP expected 5.7 s →
~1.5–2 s. `/artists/all` loads the flag CSS as its own chunk, where flags are needed.

**Risk:** minimal. Verify: flags still render on `/artists/all`.

### 2. Serve CSS background images through Netlify Image CDN (WebP + resize)

Both CSS backgrounds point at `content.sentimony.com` (already in
`nuxt.config.ts` `image.domains`). The images physically live in the `sentimony-images`
repo/CDN, so this spec does **not** modify them there; it routes the existing originals
through Netlify's on-the-fly image transform.

- Replace the raw `url('https://content.sentimony.com/.../trees-origin_v1.jpg')` in
  `app/assets/css/tailwind.css:118` and `app/components/HomepageAtmosphere.vue:24` with a
  Netlify Image CDN URL:
  ```
  /.netlify/images?url=https%3A%2F%2Fcontent.sentimony.com%2Fassets%2Fimg%2Fbackgrounds%2Ftrees-origin_v1.jpg&fm=webp&w=1920&q=60
  ```
  - `fm=webp` → clears `modern-image-formats` for this asset (382 KB).
  - `w=1920`, `q=60` → the background is decorative (opacity ≤ 0.33), so reduced
    resolution/quality is imperceptible while cutting weight substantially.
- Apply the same transform to the `irukanji-01_xl.jpg` homepage source; the plan will
  pin down its exact location and whether it is `<NuxtImg>` (add `format`/`sizes`) or a
  raw background (CDN URL).

**Dev fallback (required):** `/.netlify/images` exists only on Netlify. Under
`npm run dev` (the `ipx` provider) it 404s. The plan must choose one clean mechanism so
local dev still shows the backgrounds — either an `import.meta.dev` conditional that
falls back to the original URL, or routing through Nuxt Image's `$img()` helper so the
active provider is selected automatically. Backgrounds must render in **both** dev and
prod.

**Risk:** medium — a wrong CDN URL or missing dev fallback makes the background vanish
locally. Verified in both prod build and `npm run dev`.

## Verification

**Measurement discipline (avoid the dev/prod trap):**
- Only measure a clean prod build: `NITRO_PRESET=node-server npm run build` →
  `node .output/server/index.mjs` on a dedicated port, after confirming no dev server is
  on that port (`curl … | grep -c '@fs/\|@vite/client'` must be 0).
- Lighthouse: `npx lighthouse@12 --only-categories=performance --preset=desktop
  --output=json`.
- Measure **before and after each change**; compare LCP, Render Delay, Performance score,
  and `entry.css` size.

**Functional verification (not just numbers):**
- flag-icons: `/artists/all` renders flags after scoping (screenshot via web-debug).
- backgrounds: `trees` and homepage hero visible in the prod build **and** in
  `npm run dev`.

## Out of scope (YAGNI)

- Supabase / auth bundle refactor (TBT already 0).
- `uses-text-compression` (local-server artifact; Netlify compresses in prod).
- `unused-javascript` (revisit only if the score target is missed after 1 and 2).
