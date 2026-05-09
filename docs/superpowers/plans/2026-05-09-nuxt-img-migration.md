---
title: sentimony-nuxt — `<img>` → `<NuxtImg>` migration
date: 2026-05-09
scope: minimal — replace all `<img>` tags with `<NuxtImg>`; convert inline background-image URLs to positioned `<NuxtImg>`
out_of_scope: [responsive sizes refinement, breakpoint-specific srcset tuning, AVIF-only paths]
---

# sentimony-nuxt: `<img>` → `<NuxtImg>` migration

## Decisions (locked)

| Topic | Decision |
|---|---|
| Provider | `@nuxt/image` `provider: 'netlifyImageCdn'` (built-in v2.x). Sites both on Netlify → free server-side resize for remote images |
| Remote domain | `content.sentimony.com` registered in `image.domains` and in `netlify.toml` `[images] remote_images` |
| Background-image (5 inline `bg-[url(...)]`) | Convert to absolute-positioned `<NuxtImg class="absolute inset-0 -z-10 object-cover ...">`. CSS background dropped. |
| `<img>` tags | All 17 occurrences in 9 files replaced with `<NuxtImg>` |
| Existing module install | `@nuxt/image@^2.0.0` already in `package.json`; no new install needed |
| Lazy loading | Default `loading="lazy"` (browser native). NuxtImg adds it automatically. |
| Width/height attrs | Preserved when present (CLS-safe). When absent (background swaps) — set explicit `width`+`height` from source meta or use `fill` mode |
| Tests | Component tests via Vitest + Vue Test Utils; integration grep test "no `<img ` left in `app/`" |

## Definition of Done (run is `pass` only if ALL true)

1. `pnpm test` exits 0
2. `pnpm typecheck` (or `vue-tsc --noEmit`) exits 0
3. `pnpm build` exits 0
4. `grep -rE '<img\\s' app/` returns empty (no remaining raw img tags)
5. `nuxt.config.ts` has `image.provider: 'netlifyImageCdn'` and `image.domains: ['content.sentimony.com']`
6. `netlify.toml` has `[images] remote_images = ["https://content\\.sentimony\\.com/.*"]` (regex)
7. Build output `<picture>` or `<img>` rendered by NuxtImg points to `/.netlify/images?url=...` URL pattern (sample one page)
8. All commits pushed to variant branch (`task3/A` or `task3/B`)
9. Claude explicitly signals "task complete"

## Glossary

| Term | Meaning |
|---|---|
| **section** | One of 6 content areas mentioned by user: relizes, artists, events, playlists, videos, background images |
| **NuxtImg** | The `<NuxtImg>` component from `@nuxt/image`; auto-resizes via configured provider |
| **bg-[url(...)]** | Tailwind arbitrary-value background-image utility, used inline on 5 elements |

## Files in scope

**`<img>` tags (9 files):**
- `app/pages/index.vue`
- `app/pages/news.vue`
- `app/pages/events.vue`
- `app/components/RelativeItem.vue`
- `app/components/OpenSidebar.vue`
- `app/components/Footer.vue`
- `app/components/Testimonials.vue`
- `app/components/Header.vue`
- `app/components/BtnPrimary.vue`

**Background-image inline (5 occurrences):** identified via `grep -rE 'bg-\\[url\\(|background-image|background:.*url\\(' app/`. Confirm exact files in Task 02.

---

## Tasks (TDD: failing test → impl → green → commit)

### Task 01 — Configure `@nuxt/image` provider

**Goal:** wire NetlifyImage CDN provider, register remote domain.

**Steps:**
1. Add `'@nuxt/image'` to `nuxt.config.ts` `modules` array if not already there
2. Add config block:
   ```ts
   image: {
     provider: 'netlifyImageCdn',
     domains: ['content.sentimony.com'],
     netlifyImageCdn: { baseURL: '/.netlify/images' }
   }
   ```
3. Add `netlify.toml` block:
   ```toml
   [images]
   remote_images = ["https://content\\.sentimony\\.com/.*"]
   ```

**Test:** `tests/image-config.test.ts` — load `nuxt.config.ts` (or import via dynamic import in test), assert `image.provider === 'netlifyImageCdn'` and `domains` contains `content.sentimony.com`. Read `netlify.toml` as text, assert it contains the regex string.

**Commit:** `feat(image): configure @nuxt/image with netlifyImageCdn provider`

---

### Task 02 — Audit and document inline background-image usage

**Goal:** enumerate every `bg-[url(...)]` and decide replacement strategy per case.

**Steps:**
1. Run `grep -rnE 'bg-\\[url\\(|background-image|background:.*url\\(' app/ > /tmp/bg-audit.txt`
2. For each match, document in commit message body: file, line, current URL, target replacement (NuxtImg with absolute positioning + size hints)
3. No code changes in this task — audit only

**Test:** none (audit-only). Commit message lists all 5 occurrences.

**Commit:** `chore: audit inline background-image URLs (5 found)`

---

### Task 03 — Replace `<img>` in `RelativeItem.vue`

**Goal:** first component conversion. Smallest pattern (single `:src="i.cover_th"`).

**Steps:**
1. Replace `<img v-if="i.cover_th" :src="i.cover_th" class="..." />` with `<NuxtImg v-if="i.cover_th" :src="i.cover_th" class="..." width="24" height="24" />`
2. Use `provider="netlifyImageCdn"` if not auto-detected (default config takes care of this)

**Test:** `tests/components/RelativeItem.test.ts` — mount with prop `i = { cover_th: 'https://content.sentimony.com/img/foo.jpg' }`, assert no `<img>` tag in render, presence of `<nuxt-img>` (or stub) with correct `src`.

**Commit:** `feat(image): RelativeItem uses NuxtImg`

---

### Task 04 — Replace `<img>` in remaining components (atomic per file)

**Goal:** convert 5 remaining components: `OpenSidebar`, `Footer`, `Testimonials`, `Header`, `BtnPrimary`.

**Strategy:** one atomic commit per file. Each commit:
1. Edit `<img>` → `<NuxtImg>` keeping all attrs (`class`, `:src`, `:alt`, `width`, `height`)
2. Add component test asserting NuxtImg replaces img

**Tests (per file):** `tests/components/<Name>.test.ts` — mount, assert `<nuxt-img>` (or stub) is rendered.

**Commits:**
- `feat(image): OpenSidebar uses NuxtImg`
- `feat(image): Footer uses NuxtImg`
- `feat(image): Testimonials uses NuxtImg`
- `feat(image): Header uses NuxtImg`
- `feat(image): BtnPrimary uses NuxtImg`

---

### Task 05 — Replace `<img>` in pages (atomic per file)

**Goal:** convert 3 page files: `index.vue`, `news.vue`, `events.vue`.

**Strategy:** one atomic commit per file.

**Tests:** for each page — mount-friendly snapshot or grep test on rendered output asserting no `<img>` tag.

**Commits:**
- `feat(image): index page uses NuxtImg`
- `feat(image): news page uses NuxtImg`
- `feat(image): events page uses NuxtImg`

---

### Task 06 — Replace inline background-image with positioned `<NuxtImg>`

**Goal:** drop the 5 `bg-[url(...)]` Tailwind utilities; replace with absolute-positioned `<NuxtImg>`.

**Pattern:**
```vue
<!-- before -->
<div class="relative bg-[url('https://content.sentimony.com/.../mandala-01.svg')] bg-center bg-no-repeat bg-cover bg-fixed">
  ...
</div>
<!-- after -->
<div class="relative">
  <NuxtImg
    src="https://content.sentimony.com/.../mandala-01.svg"
    class="absolute inset-0 -z-10 object-cover w-full h-full"
    alt=""
  />
  ...
</div>
```

**Test:** `tests/background-images.test.ts` — grep `app/` for `bg-\\[url\\(` and assert 0 matches.

**Commit:** `feat(image): convert 5 inline background-image to NuxtImg`

---

### Task 07 — Verification: no `<img>` left, build sane

**Goal:** comprehensive sanity check.

**Steps:**
1. `grep -rE '<img\\s' app/` — must return 0 matches (test asserts this)
2. `pnpm build` — must succeed
3. Sample one built page, check that NuxtImg renders to URL containing `/.netlify/images?url=...` (assert via `grep` on `.output/public/` index files)
4. Bump `package.json` minor version (semver: feature)

**Test:** `tests/no-raw-img.test.ts` — runs grep over `app/`, asserts no `<img\\s` matches.

**Commit:** `chore: verify no raw <img> tags + bump minor version`

---

## Post-migration sanity (manual)

- [ ] `pnpm dev` → open `http://localhost:3000/`, verify all sections (relizes, artists, events, playlists, videos, background) display images
- [ ] DevTools Network: image requests go to `/.netlify/images?url=...` (Netlify Image CDN proxy)
- [ ] No console errors related to image loading
- [ ] Visual regression: 6 sections look identical to pre-migration baseline (manual eyeball)

## Out of scope (future iteration)

- Tuning `sizes` attribute per breakpoint for true responsive images (currently NuxtImg uses default sizes)
- AVIF-first format negotiation
- LQIP/blurhash placeholders
- Migrating remaining content from `content.sentimony.com` repo into the Nuxt image pipeline
