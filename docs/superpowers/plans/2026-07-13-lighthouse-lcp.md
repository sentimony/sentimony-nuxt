# Lighthouse LCP Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut homepage LCP from 5.7 s to < 2.5 s by removing 447 KB of render-blocking `flag-icons` CSS from the global entry and serving the two heavy background/avatar images as resized WebP.

**Architecture:** Three independent, independently-testable changes. (1) Move the global `flag-icons` CSS import into its only consumer page so it stops bloating `entry.css`. (2) Replace the raw `<img>` avatar in `Testimonials.vue` with `<NuxtImg>` so the image pipeline resizes it (72px) and emits WebP. (3) Route the global CSS forest background through Nuxt Image's `useImage()` so it becomes resized WebP in prod and stays working in dev — exposed to CSS via a `--forest-bg` custom property set SSR-side.

**Tech Stack:** Nuxt 4, `@nuxt/image` (netlify provider in prod, ipx in dev), Tailwind v4, Vite. Lighthouse 12 for measurement.

## Global Constraints

- Measure only against a clean prod build: `NITRO_PRESET=node-server npm run build` → `node .output/server/index.mjs` on a dedicated port; confirm no dev server on that port with `curl -s http://localhost:PORT/ | grep -c '@fs/\|@vite/client'` (must print `0`) before trusting any Lighthouse number.
- Lighthouse command: `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx -y lighthouse@12 http://localhost:PORT/ --only-categories=performance --preset=desktop --output=json --output-path=<abs>.report.json --chrome-flags="--headless=new --no-sandbox" --quiet`.
- Backgrounds and the avatar MUST render in **both** `npm run dev` and the prod build — a change that breaks either is a failure.
- No `@apply` inside `<style scoped>` (Tailwind v4 constraint). The `flag-icons` import in Task 1 is a plain global `<style>`, not scoped, and contains no `@apply`.
- Commit after each task. Branch is `lighthouse-improve` (not main) — commit directly.
- Comments in code: English only. Avoid comments unless necessary (project style).

---

## File Structure

- `nuxt.config.ts` — remove `flag-icons` from the global `css: [...]` array (Task 1).
- `app/pages/artists/all.vue` — gains a local `flag-icons` import (Task 1).
- `app/components/Testimonials.vue` — raw `<img>` → `<NuxtImg>` (Task 2).
- `app/app.vue` — set `--forest-bg` custom property SSR-side via `useImage()` + `useHead` (Task 3).
- `app/assets/css/tailwind.css` — `html::before` background uses `var(--forest-bg)` (Task 3).

---

## Task 1: Scope flag-icons CSS to /artists/all

**Files:**
- Modify: `nuxt.config.ts` (the `css: [...]` array, currently lines ~59–62)
- Modify: `app/pages/artists/all.vue` (add a global `<style>` block)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks. This task is independent.

- [ ] **Step 1: Baseline measurement (record before changing anything)**

Build and serve a clean prod build, then measure. From repo root:

```bash
NITRO_PRESET=node-server npm run build
# serve on a dedicated port in the background:
PORT=3100 node .output/server/index.mjs &
# confirm it is prod, not a stray dev server:
curl -s http://localhost:3100/ | grep -c '@fs/\|@vite/client'   # must print 0
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npx -y lighthouse@12 http://localhost:3100/ --only-categories=performance \
  --preset=desktop --output=json --output-path=/tmp/lh-before.report.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
node -e 'const r=require("/tmp/lh-before.report.json");console.log("PERF",Math.round(r.categories.performance.score*100),"LCP",r.audits["largest-contentful-paint"].displayValue)'
```

Expected (baseline): `PERF 68 LCP 5.7 s`. Record the actual `entry.css` size too:
```bash
ls -la .output/public/_nuxt/entry.*.css   # expect ~447 KB
```

- [ ] **Step 2: Remove the global flag-icons import**

In `nuxt.config.ts`, change the `css` array from:

```ts
  css: [
    '~/assets/css/tailwind.css',
    'flag-icons/css/flag-icons.min.css',
  ],
```

to:

```ts
  css: [
    '~/assets/css/tailwind.css',
  ],
```

- [ ] **Step 3: Add the local import to the only consumer**

`app/pages/artists/all.vue` is the only file using `.fi-*` classes (via `:class="`fi fi-${flagCodes[artist.slug]} ...`"`). Add a **non-scoped** global style block at the end of the file (or alongside an existing `<style>` if one exists):

```vue
<style>
@import 'flag-icons/css/flag-icons.min.css';
</style>
```

Non-scoped is required because the classes are applied dynamically via `:class`, not authored inside this component's scope. Vite emits this as a per-page CSS chunk loaded only on `/artists/all`.

- [ ] **Step 4: Rebuild and verify entry.css shrank**

```bash
NITRO_PRESET=node-server npm run build
ls -la .output/public/_nuxt/entry.*.css
```

Expected: `entry.*.css` is now well under 20 KB (the 447 KB of flag classes moved to a separate `all.*.css` chunk). Confirm a separate chunk containing flags exists:
```bash
grep -rl '\.fi-' .output/public/_nuxt/*.css | grep -v entry
```
Expected: prints a non-entry CSS file path.

- [ ] **Step 5: Verify flags still render on /artists/all (functional)**

```bash
# kill any old server, restart clean prod:
lsof -tiTCP:3100 -sTCP:LISTEN | xargs -r kill; sleep 1
PORT=3100 node .output/server/index.mjs &
sleep 2
# assert flag markup is present on the page:
curl -s http://localhost:3100/artists/all | grep -oE 'class="fi fi-[a-z]{2}' | head
```
Expected: prints several `class="fi fi-xx` matches (e.g. `fi fi-ua`). If empty, the page renders flags client-side only — in that case verify visually with web-debug: `npm run web-debug` pointed at `/artists/all`, or open the page and screenshot.

- [ ] **Step 6: Measure homepage LCP after the change**

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npx -y lighthouse@12 http://localhost:3100/ --only-categories=performance \
  --preset=desktop --output=json --output-path=/tmp/lh-after1.report.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
node -e 'const r=require("/tmp/lh-after1.report.json");console.log("PERF",Math.round(r.categories.performance.score*100),"LCP",r.audits["largest-contentful-paint"].displayValue,"RenderDelay-check via render-blocking:",r.audits["render-blocking-resources"].displayValue)'
```
Expected: LCP drops substantially (target trajectory toward < 2.5 s); `render-blocking-resources` no longer lists a ~448 KB `entry.css`.

- [ ] **Step 7: Commit**

```bash
git add nuxt.config.ts app/pages/artists/all.vue
git commit -m "perf: scope flag-icons CSS to /artists/all to unblock render"
```

---

## Task 2: Serve the Testimonials avatar as resized WebP

**Files:**
- Modify: `app/components/Testimonials.vue:13-18` (the raw `<img>`)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing. Independent of Task 1 and Task 3.

Context: the avatar renders at 72×72 px but loads `irukanji-01_xl.jpg` (~510 KB full-size JPG). `<NuxtImg>` will request a 72px (×2 for retina) WebP through the active provider — `/.netlify/images?...&fm=webp` in prod, ipx in dev — so no manual URL and no dev-only breakage.

- [ ] **Step 1: Replace the raw `<img>` with `<NuxtImg>`**

In `app/components/Testimonials.vue`, replace:

```vue
        <img
          src="https://content.sentimony.com/assets/img/artists/irukanji-01_xl.jpg"
          alt="Irukanji avatar"
          width="72" height="72"
          class="size-18 rounded-full object-cover ring-1 ring-black/20 dark:ring-white/20"
        >
```

with:

```vue
        <NuxtImg
          src="https://content.sentimony.com/assets/img/artists/irukanji-01_xl.jpg"
          alt="Irukanji avatar"
          width="72" height="72"
          sizes="72px"
          densities="1x 2x"
          fit="cover"
          format="webp"
          loading="lazy"
          class="size-18 rounded-full object-cover ring-1 ring-black/20 dark:ring-white/20"
        />
```

(`<NuxtImg>` is auto-imported project-wide — no import statement needed; matches the existing usage in `app/components/Item.vue`.)

- [ ] **Step 2: Verify dev renders the avatar (ipx provider)**

```bash
# in a separate shell, with dev server running (TMPDIR=/tmp npm run dev):
curl -s http://localhost:3000/ | grep -oE 'src="[^"]*irukanji[^"]*"' | head
```
Expected: a transformed ipx URL (contains `/_ipx/` or a `?...` transform), NOT the raw `...irukanji-01_xl.jpg`. Confirm the avatar is visible on the homepage in the browser.

- [ ] **Step 3: Rebuild and verify prod emits a Netlify-CDN WebP URL**

```bash
NITRO_PRESET=node-server npm run build
lsof -tiTCP:3100 -sTCP:LISTEN | xargs -r kill; sleep 1
PORT=3100 node .output/server/index.mjs &
sleep 2
curl -s http://localhost:3100/ | grep -oE '/\.netlify/images[^"]*irukanji[^"]*' | head
```
Expected: prints a `/.netlify/images?w=72...&fm=webp...&url=...irukanji-01_xl.jpg` URL (possibly a `srcset` with `w=72` and `w=144`).

- [ ] **Step 4: Commit**

```bash
git add app/components/Testimonials.vue
git commit -m "perf: serve Testimonials avatar as 72px WebP via NuxtImg"
```

---

## Task 3: Route the global forest background through the image pipeline

**Files:**
- Modify: `app/app.vue` (add `useImage()` + `useHead` inline style setting `--forest-bg`)
- Modify: `app/assets/css/tailwind.css:114-123` (`html::before` uses `var(--forest-bg)`)

**Interfaces:**
- Consumes: nothing.
- Produces: a CSS custom property `--forest-bg` on `:root`, set SSR-side, holding a provider-transformed WebP URL for `trees-origin_v1.jpg`.

Context: the forest background is a global `html::before` CSS `background-image` (opacity ≤ 0.33), so `<NuxtImg>` cannot own it. `useImage()` generates the correct provider URL (netlify in prod, ipx in dev). Setting it as a CSS variable via `useHead` renders it into the SSR `<head>`, so the background is correct on first paint (no FOUC/CLS) and works in both environments.

- [ ] **Step 1: Generate the transformed URL and expose it as a CSS variable in app.vue**

In `app/app.vue`, update `<script setup>`:

```ts
<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '~/components/ui/sonner'

const img = useImage()
const forestBg = img(
  'https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg',
  { format: 'webp', width: 1920, quality: 60 },
)

useHead({
  htmlAttrs: { lang: 'en' },
  style: [
    { children: `:root{--forest-bg:url("${forestBg}")}` },
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  ],
})
</script>
```

(`useImage` is auto-imported by `@nuxt/image`. The `img(src, modifiers)` call returns a plain string URL for the active provider.)

- [ ] **Step 2: Point the CSS background at the variable**

In `app/assets/css/tailwind.css`, change the `html::before` rule:

```css
html::before {
  content: '';
  @apply fixed inset-0;
  z-index: -11;
  background-image: url('https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.33;
}
```

to:

```css
html::before {
  content: '';
  @apply fixed inset-0;
  z-index: -11;
  background-image: var(--forest-bg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.33;
}
```

(Leave the `@apply fixed inset-0` as-is — it already exists in this non-scoped global stylesheet and compiles fine; do not introduce new `@apply` elsewhere.)

- [ ] **Step 3: Verify the SSR HTML carries the variable in dev**

```bash
# with dev server running (TMPDIR=/tmp npm run dev):
curl -s http://localhost:3000/ | grep -oE '\-\-forest-bg:url\([^)]*\)' | head
```
Expected: prints `--forest-bg:url(...)` with an ipx/transformed URL. Confirm the forest background is visible on any route in the browser.

- [ ] **Step 4: Rebuild and verify prod uses a Netlify-CDN WebP background**

```bash
NITRO_PRESET=node-server npm run build
lsof -tiTCP:3100 -sTCP:LISTEN | xargs -r kill; sleep 1
PORT=3100 node .output/server/index.mjs &
sleep 2
curl -s http://localhost:3100/ | grep -oE '\-\-forest-bg:url\([^)]*\)' | head
```
Expected: prints `--forest-bg:url(/.netlify/images?...fm=webp...w=1920...trees-origin_v1.jpg...)`. Confirm the background renders visually (open `http://localhost:3100/`).

- [ ] **Step 5: Final Lighthouse measurement (all three changes)**

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npx -y lighthouse@12 http://localhost:3100/ --only-categories=performance \
  --preset=desktop --output=json --output-path=/tmp/lh-final.report.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
node -e 'const r=require("/tmp/lh-final.report.json");const a=r.audits;console.log("PERF",Math.round(r.categories.performance.score*100));for(const k of ["largest-contentful-paint","first-contentful-paint","total-blocking-time","cumulative-layout-shift"])console.log(" ",k,a[k].displayValue);for(const id of ["modern-image-formats","uses-responsive-images"]){const x=a[id];console.log(" ",id,"score",x.score)}'
```
Expected (success criteria): `PERF ≥ 85`, `largest-contentful-paint < 2.5 s`, `modern-image-formats` and `uses-responsive-images` scores improved (the `trees` + `irukanji` items resolved). If PERF < 85 or LCP ≥ 2.5 s, inspect `render-blocking-resources` and `unused-javascript` in `/tmp/lh-final.report.json` before declaring done.

- [ ] **Step 6: Commit**

```bash
git add app/app.vue app/assets/css/tailwind.css
git commit -m "perf: serve forest background as resized WebP via image pipeline"
```

---

## Self-Review notes (author)

- **Spec coverage:** flag-icons scoping → Task 1; `trees-origin_v1.jpg` background → Task 3; `irukanji-01_xl.jpg` → located as the raw `<img>` avatar in `Testimonials.vue` → Task 2. Verification discipline (dev/prod trap, clean-port check) → Global Constraints + per-task Lighthouse steps. Success criteria (Perf ≥ 85, LCP < 2.5 s, entry.css < 20 KB, flags work, backgrounds work in dev+prod) → Task 1 Step 4/5, Task 2 Steps 2–3, Task 3 Steps 3–5.
- **Out of scope confirmed unaddressed:** Supabase bundle, `uses-text-compression`, `unused-javascript` — none introduced as tasks, matching the spec.
- **Dev fallback:** solved by using the image pipeline (`<NuxtImg>` / `useImage()`) rather than hand-written `/.netlify/images` URLs, so the provider auto-selects ipx in dev — no `import.meta.dev` branching needed.
