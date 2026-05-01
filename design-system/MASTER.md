# Design System: Sentimony Records (MASTER)

> **Source of truth for AI agents and contributors.** Use this when building any page or component.
> Hierarchical retrieval: first check `design-system/pages/<page>.md` for overrides; if absent — use this Master file exclusively.
> Human-readable rationale and component anatomy lives in `/DESIGN.md` at the repo root. This file is the machine-friendly contract.

**Project:** Sentimony Records — psychedelic music label
**Stack:** Nuxt 4 (SSR/ISR via Netlify) · Tailwind CSS · Vue 3 SFC · `@nuxt/icon` (Iconify) · `v-wave`
**Mode:** Dark only (no light theme)

---

## Pattern

- **Name:** Content-First Portfolio Grid (immersive)
- **Conversion focus:** Visuals first — covers, photos, video stills carry the brand. Content (releases / artists / videos / playlists / events) is browsed via swiper rows on home and grid pages on listings. Detail pages route through `/release/[id]`, `/artist/[id]` etc.
- **CTA placement:** Listen-on-platform buttons (`BtnPrimary`) on detail pages; social links in header + footer; login/profile in header.
- **Color strategy:** Photo background (forest) carries mood. UI surfaces are translucent white-on-photo. No accent palette beyond semantic green/red badges.
- **Sections per page:**
  1. Sticky Header (logo + nav + social + profile)
  2. Hero (home only) — `Julius Sans One` brand moment over fractal layer
  3. Content rows (`Swiper`) or grids of `Item` cards
  4. Long-form text on `.Content` light slab (release/artist body)
  5. `Testimonials`
  6. Footer (full nav + social + credits, `bg-black`)

---

## Style

- **Name:** Forest Psychedelic (Dark Photo Surface + Translucent Skim)
- **Mode support:** Light ✗ No · Dark ✓ Only
- **Keywords:** psychedelic, immersive, forest, ritual, content-first, photo background, translucent skim, opacity-scale, brand-display typography
- **Best for:** Music label portfolio, artist showcases, release archives, event listings, video collections
- **Performance:** ⚡ Good (single fixed background image, ISR-cached, no heavy blur stacks)
- **Accessibility:** ⚠ Photo background → white text contrast must be defended via opacity floor and `.Content` slab for read-heavy text
- **Anti-mood:** corporate, flat-minimal, neon cyberpunk, glamour, generic SaaS landing

---

## Colors

The brand does NOT use traditional `primary/secondary/accent` HEX tokens. It lives on an **opacity scale of white** layered over a fixed forest photo background. New components must respect this rule.

| Role | Tailwind / Value | Where it applies |
|------|------------------|------------------|
| Page bg (base, fallback under photo) | `bg-green-950` (`#052e16`) | `body` |
| Page bg (photo, fixed cover) | `url('https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?02')` | `body` |
| Footer bg | `bg-black` | `Footer.vue` |
| Surface — skim | `bg-white/5` + `backdrop-blur-sm` | Header, sticky bars |
| Surface — hover | `bg-white/30` | Buttons, nav items |
| Surface — active | `bg-white/20` | Active nav item, active card |
| Surface — pressed | `bg-white/10` (transient via `v-wave`) | All clickable |
| Border (header) | `border-white/30` | Header bottom border |
| Border (footer nav) | `border-white/10` | Footer nav group |
| Text — primary | `text-white` | Headings, body on dark |
| Text — muted (3 tiers) | `opacity-60` / `opacity-50` / `opacity-40` | Descriptors, captions, footnotes |
| Text — link on light slab | `text-blue-700` | `.Content a` |
| Light content slab | `bg-[#b5ccb5] text-black` | `.Content` (long-form release/artist body) |
| Status — Coming Soon | `bg-green-600` | `Item.vue` badge |
| Status — Out Now | `bg-red-600` | `Item.vue` badge |
| Tooltip (footer social) | `bg-[#8a0202]` | Hover tooltip under social icons |
| Shadow | `shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]` | Cards, buttons, media |

**Rules:**
- Never introduce new HEX values in components. Reach for the opacity scale `white/5 → white/10 → white/20 → white/30` first.
- Semantic states use the existing palette: success → `green-600`, danger → `red-600`. Do not invent additional tones.
- Long-form text MUST be set on the `.Content` slab — white-on-photo fails contrast for paragraphs.
- Body text white must not drop below `opacity-70` for meaningful copy. `40/50/60` are reserved for decorative descriptors.
- Photo background contrast varies pixel-by-pixel — always provide a `bg-white/5` skim or shadow when stacking text on raw photo.

---

## Light Surfaces (exceptions to dark-only)

The site is dark-only, but **intentional local light surfaces** exist for cases where white-on-photo fails (long prose, form inputs, modals with body copy). This is **not** light mode — these are legible islands inside a dark page, with their own contract.

| Surface | Bg | Text | Link | Border | Use case |
|---------|----|----|------|--------|----------|
| `.Content` (in use) | `bg-[#b5ccb5]` | `text-black` | `text-blue-700` | `border-black/30` | Long prose: release info, artist bio, tracklist, credits |
| Form input (TBD) | `bg-white/95` | `text-black` | — | `border-black/20` | Login / contact text inputs — white-on-photo unusable |
| Modal body (TBD) | `bg-[#b5ccb5]` | `text-black` | `text-blue-700` | `border-black/30` | Dialogs with prose. Quick toasts stay dark. |

**Rules for introducing a new light surface:**

1. **Trigger:** prose >2 paragraphs, OR a form input, OR legibility independent of photo background is required. Otherwise stay dark.
2. **Palette:** use one of the tokens above. **No new HEX.** Muted text `text-black/60`, divider `border-black/30`, link `text-blue-700`.
3. **Seam:** every light surface meets the dark page through an explicit boundary — `border-t border-white/30` or a wrapping padded container. A light slab must never look like a "broken theme".
4. **Brand UI stays dark.** Never apply light tokens to: Header, Footer, `Item`, `BtnPrimary`, `Tabs`, `Hero`.
5. **Buttons on light surfaces:** `border-black/30 text-black/60` (matches the existing track-like button on release-page light slab).

**Anti-patterns inside Light Surfaces:**

- ❌ Light cards inside a dark grid (`bg-white text-black` release card — no).
- ❌ Light header / footer.
- ❌ Light CTAs on dark background (`BtnPrimary` stays translucent-white).
- ❌ Per-page dark↔light toggle.
- ❌ Light section abutting dark nav without `border-t border-white/30` seam.

---

## Typography

Two Google Fonts. No third family.

| Font | Tailwind class | Use |
|------|----------------|-----|
| **Montserrat** | `font-montserrat` (default) | Body, navigation, cards, buttons, badges |
| **Julius Sans One** | `font-julius` | Hero, monumental brand headings only |

**Scale (responsive):**

| Use | Size |
|-----|------|
| Body | `text-xs md:text-sm lg:text-base` (12 → 14 → 16px) |
| Hero (`font-julius`) | `text-[40px]` mobile → `text-[100px]` xl, tracking `2px → 14px` |
| Hero subtitle | `12px / 4px tracking` → `20px / 20px tracking` |
| Card title | inherits body, `line-clamp-2` |
| Badge | `text-[8px] md:text-[10px]` |
| Header logo | title `16px` · subtitle `12px` |

**Rules:**
- `font-julius` is reserved for brand moments (Hero, section headings on home/landing). Do NOT use it inside UI controls.
- Display headings: UPPERCASE + wide letter-spacing only when paired with `font-julius`.
- Long-form body text: line length 60–75 chars → enforce via `.Content` slab `max-width`.
- Minimum body 12px on mobile. Smaller (`8/10px`) is allowed only for badges/tooltips with adjacent context.
- Variety comes from weight / tracking / case of Montserrat — never another font.

---

## Spacing & Layout

- **Rhythm unit:** 4px (Tailwind default). Most-used scale: `2 / 3 / 4 / 6 / 8 / 10 / 24`.
- **Container:** `container max-w-7xl` (header) · `container` (footer). Content pages: `max-w-[777px]` for prose, `max-w-7xl` for grids.
- **Min viewport:** `min-w-[320px]`. Below that — unsupported.
- **Sticky header:** `h-[75px]`. Inner touch targets `h-[56px]`.
- **Item card:** mobile `70×70` / desktop `140×140`; inner cover `60×60` / `120×120`.
- **Radius default:** `rounded-sm` (2px). Buttons may use `rounded-md`. Tooltips `rounded-sm`.
- **Vertical rhythm:** sections — `py-24` (footer); Hero — `py-[7.5em]…py-[11.5em]` for dramatic silence.
- **Breakpoints:** Tailwind defaults — `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.
- **Mobile-first:** every responsive utility scales UP (`sm: md: lg: xl:`), never down.
- **Image dimensions:** every `<img>` requires explicit `width/height` or `aspect-ratio` to prevent CLS.
- **Horizontal scroll:** forbidden on mobile EXCEPT the deliberate `<Swiper>` rows.

---

## Z-index Scale

| Layer | z-index |
|-------|---------|
| Fractal decorative bg | `z-[1]` |
| Page content | `z-[2]` |
| Sticky header | `z-20` |
| Social tooltip | `z-30` |
| Footer (above sticky when needed) | `z-100` |
| Future modal/sheet | `z-[60]` |
| Future overlay/backdrop | `z-[200]` |

---

## Key Effects

| Effect | Token / Value |
|--------|---------------|
| Backdrop blur | `backdrop-blur-sm` (header, primary buttons) |
| Shadow | `shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]` |
| Hover transition | `transition-[background-color] ease-in-out duration-300` |
| Card hover transition | `duration-200` |
| Press feedback | `v-wave` directive (mandatory on every clickable) |
| Decorative motion | `<Fractal />` background layer · `spin2` / `spin2rev` keyframes |
| Tooltip micro-anim | letter-spacing + opacity + translate-y (header social — preserve as brand signature) |

**Rules:**
- `v-wave` is required on every new clickable: `NuxtLink`, button, social icon, card.
- Hover changes `bg-white/{20|30}` via `transition-[background-color]`. Do NOT use `transform: scale` for nav/header hover.
- Animate only `transform`, `opacity`, `background-color`. Never `width / height / top / left`.
- Micro-interaction duration 200–300ms. Exit ~70% of enter duration.
- Respect `prefers-reduced-motion: reduce` — `<Fractal />` and any autoplay must collapse to a static frame.

---

## Iconography

- **Source:** Iconify via `@nuxt/icon` (`<Icon name="heroicons:user" size="22" />`)
- **Default pack:** Heroicons. Custom SVGs live at `https://content.sentimony.com/assets/img/svg-icons/...` and are registered in `app/constants/icons.ts`.
- **Default size:** `size="22"` for header / footer / social.
- **Touch zone:** icons must sit inside a ≥44×44pt parent (`h-[40px]` social, `h-[56px]` header).
- ❌ **Forbidden:** emoji as structural icons (nav, status, toolbar). Always SVG/Iconify.
- Brand-specific platforms (Bandcamp, Beatport, Spotify…) — pull official monochrome SVG from `content.sentimony.com`.

---

## Component Library (existing)

Re-use before creating new:

| Component | Purpose |
|-----------|---------|
| `Header.vue` | Sticky 75px nav + logo + social + profile |
| `Hero.vue` | Home-only brand statement (`font-julius`) |
| `Item.vue` | Universal card for releases / artists / videos / playlists / events |
| `Swiper.vue` | Horizontal row of `Item` with category title |
| `BtnPrimary.vue` | Primary action button with icon + title + external-link logic |
| `Tabs.vue` + `Tab.vue` | Tabbed switcher on detail pages |
| `Footer.vue` | `bg-black` full-nav footer with social + credits |
| `Fractal.vue` | Decorative animated background layer |
| `OpenImage.vue` | Image preview/lightbox |
| `OpenSidebar.vue` | Mobile drawer trigger |
| `Testimonials.vue` | Section above footer |
| `RelativeItem.vue` | Related-content card on detail pages |
| `SvgTriangle.vue` | Decorative SVG |

When the brief fits any of these — extend it, don't fork.

---

## Avoid (Anti-patterns)

- ❌ Global light theme — no `prefers-color-scheme: light`, no theme switcher, no Tailwind `dark:` utilities, no full-page surface inversion.
- ❌ Light tokens on brand UI surfaces (Header, Footer, `Item`, `BtnPrimary`, `Tabs`, `Hero`). These stay dark.
- ✅ **Allowed:** intentional local light surfaces for legibility — `.Content` slab (long prose), form inputs, modal bodies. See **Light Surfaces** section below.
- ❌ Emoji as icons.
- ❌ New HEX values in components beyond the documented palette (`green-950`, `white/X`, `green-600`, `red-600`, `#8a0202`, `#b5ccb5`).
- ❌ Fonts other than Montserrat / Julius Sans One.
- ❌ `rounded-full` on UI blocks (avatar is the only exception).
- ❌ Animating `width` / `height` / `top` / `left`.
- ❌ Modals without `Esc` close + backdrop click close.
- ❌ `position: fixed` over the sticky header without correct z-index and safe-area.
- ❌ Hover-only interactions — every hover state must have a tap/keyboard equivalent.
- ❌ Removing `:focus-visible` ring without an alternative indicator.
- ❌ White text below `opacity-70` for meaningful copy.
- ❌ Long-form text on raw photo background (must use `.Content` slab).

---

## Pre-Delivery Checklist

**Visual**
- [ ] No emoji icons — Heroicons / Iconify / `content.sentimony.com` SVG only
- [ ] Surfaces use `bg-white/{5,10,20,30}` — no new HEX
- [ ] Shadows match `shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]`
- [ ] `font-julius` only for brand moments; rest is `font-montserrat`
- [ ] Long-form text wrapped in `.Content` slab
- [ ] Radius `rounded-sm` default; `rounded-md` allowed for buttons; no `rounded-full` outside avatars

**Interaction**
- [ ] `v-wave` on every clickable element
- [ ] Hover changes `bg-white/{20|30}` via `transition-[background-color] duration-300`
- [ ] Touch targets ≥ 44×44pt
- [ ] Disabled state visually + semantically distinct
- [ ] External links: `target="_blank" rel="noopener"`
- [ ] Animate only `transform / opacity / background-color`
- [ ] Exit duration ≈ 70% of enter

**Performance**
- [ ] `<img>` has explicit `width / height` (or `aspect-ratio`) and `loading="lazy"` below the fold
- [ ] No CLS on hydration (reserve space for async content)
- [ ] Third-party scripts `async`/`defer`
- [ ] Verified on 375 / 768 / 1024 / 1440

**Accessibility**
- [ ] Body text contrast ≥ 4.5:1 (use `.Content` slab when on raw photo)
- [ ] `alt` on every meaningful `<img>`
- [ ] `aria-label` on every icon-only button
- [ ] `prefers-reduced-motion` respected (incl. `<Fractal />`)
- [ ] Focus ring visible on keyboard nav
- [ ] Tab order matches visual order
- [ ] Status conveyed by both color AND text (badges already do this — keep it)

**SEO / Meta**
- [ ] `useSeoMeta()` with `title / description / ogImage / twitterCard`
- [ ] Canonical URL correct on detail pages
- [ ] Sitemap suppressed on `stage--` (already handled at config level — don't re-emit)

---

## Hierarchical Retrieval Protocol (for AI agents)

When asked to build or modify a specific page:

1. Check whether `design-system/pages/<page-name>.md` exists.
2. If it exists, **its rules override this Master file** for that page only.
3. If not, use this Master file exclusively.
4. Never silently invent tokens. If a needed token is missing, propose adding it here first.

When introducing a new pattern category (modal, form, audio player, dashboard tile) that isn't yet covered:
1. Implement against the rules above.
2. Add a new section to this file documenting the pattern + tokens.
3. Update `/DESIGN.md` with the human-readable narrative.

---

_Last sync: 2026-04-30. Source code of truth: `app/components/`, `app/assets/css/tailwind.css`, `tailwind.config.js`, `app/app.config.ts`. If any of those drift from this file, code wins — update the Master file._
