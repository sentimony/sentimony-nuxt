---
title: sentimony-nuxt — lazy iframe + persisted tab state
date: 2026-05-09
scope: 4 item-pages (release, artist, playlist, video) load only the active iframe; remember user choice
out_of_scope: [SSR pre-rendering of iframes, pre-fetching adjacent tabs, accessibility focus management beyond basics]
---

# sentimony-nuxt: lazy iframe + persisted tab state

## Problem

Currently each item-page (`release/[id]`, `artist/[id]`, `playlist/[id]`, `video/[id]`) eagerly mounts up to 4 `<iframe>` elements (YouTube, SoundCloud, Spotify, YouTube Music). Each iframe pulls hundreds of KB of HTML/JS/CSS at page load, even if user only watches one platform. This:
- Wastes bandwidth on first paint
- Triggers third-party trackers from all platforms regardless of choice
- Slows TTI (time to interactive)

## Goal

Render only ONE iframe at a time — the one matching the active tab. Remember user's last platform choice via `localStorage`. Other tabs show a lightweight placeholder until clicked.

## Decisions (locked)

| Topic | Decision |
|---|---|
| Pages affected | `release/[id]`, `artist/[id]`, `playlist/[id]`, `video/[id]` (4 pages) |
| Iframe count audit | release: 4, artist: 2, playlist: 3, video: 1 (often duplicated for desktop+mobile layouts — count actual) |
| Lazy strategy | `v-if="isActive"` — iframe is destroyed/recreated on tab change. Trade-off: re-loads on switch, but guarantees no hidden iframes burning resources |
| State persistence | `localStorage` key per page-type: `sentimony-tab-release`, `sentimony-tab-artist`, etc. |
| Default tab when no localStorage entry | `'youtube'` (most common platform) |
| Existing infrastructure | Reuse `Tab.vue` and `Tabs.vue` (provide/inject pattern) where they exist; add `useTabState` composable |
| `useTabState` API | `const { activeTab, setActiveTab } = useTabState('release', 'youtube')` |
| Component | `LazyIframe.vue` — wraps iframe; renders only if `active` prop is true; otherwise renders a play-button placeholder |
| Placeholder behavior | Click → emits `request-activate` → parent flips active tab → iframe mounts |
| Accessibility | Tab buttons have `role="tab"`, iframes `title="..."` (already present), placeholder button has `aria-label="Load <platform> player"` |

## Definition of Done (run is `pass` only if ALL true)

1. `pnpm test` exits 0
2. `pnpm typecheck` exits 0
3. `pnpm build` exits 0
4. On initial load, each of the 4 pages contains EXACTLY ONE rendered `<iframe>` element (verified via build output grep or component test)
5. Clicking a tab swaps the active iframe (old unmounted, new mounted)
6. `localStorage` is written when tab changes (`sentimony-tab-<page>` key)
7. On page reload, last-active tab is restored from `localStorage`
8. If `localStorage` lacks the entry, default tab is `'youtube'`
9. All commits pushed to variant branch
10. Claude explicitly signals "task complete"

## Tasks (TDD: failing test → impl → green → commit)

### Task 01 — Audit iframe usage per page

**Goal:** record exact iframe count and platform mapping for each of 4 pages.

**Steps:**
1. For each of `release/[id].vue`, `artist/[id].vue`, `playlist/[id].vue`, `video/[id].vue`:
   - Count `<iframe>` occurrences
   - For each, record platform (YouTube / SoundCloud / Spotify / YouTube Music) and any conditional logic (`v-if`, `v-show`)
2. Write findings to `docs/iframe-audit.md` (this file is part of the commit)

**Test:** `tests/audit.test.ts` — read `docs/iframe-audit.md`, assert it lists all 4 pages with iframe counts.

**Commit:** `chore: audit iframe usage across 4 item pages`

---

### Task 02 — `useTabState` composable

**Goal:** read/write active tab from localStorage with fallback to default.

**Steps:**
1. Create `app/composables/useTabState.ts`:
   ```ts
   export function useTabState(page: string, defaultTab: string) {
     const key = `sentimony-tab-${page}`
     const activeTab = ref<string>(import.meta.client
       ? localStorage.getItem(key) ?? defaultTab
       : defaultTab)
     watch(activeTab, v => {
       if (import.meta.client) localStorage.setItem(key, v)
     })
     function setActiveTab(t: string) { activeTab.value = t }
     return { activeTab, setActiveTab }
   }
   ```
2. Handle SSR: do not touch `localStorage` on server.

**Test:** `tests/composables/useTabState.test.ts` — mock localStorage, instantiate, assert default fallback; write a value, assert localStorage is updated; instantiate fresh, assert read from localStorage.

**Commit:** `feat: useTabState composable (localStorage-backed)`

---

### Task 03 — `LazyIframe` component

**Goal:** wrap iframe; render only when `active` prop true.

**Steps:**
1. Create `app/components/LazyIframe.vue`:
   ```vue
   <template>
     <iframe
       v-if="active"
       :src="src"
       :title="title"
       loading="lazy"
       allow="autoplay; encrypted-media"
       class="w-full h-full"
     />
     <button
       v-else
       type="button"
       class="..."
       :aria-label="`Load ${title} player`"
       @click="$emit('request-activate')"
     >
       <PlayIcon /> {{ title }}
     </button>
   </template>
   <script setup lang="ts">
   defineProps<{ active: boolean; src: string; title: string }>()
   defineEmits<{ 'request-activate': [] }>()
   </script>
   ```

**Test:** `tests/components/LazyIframe.test.ts` —
- mount with `active=false`: assert NO `<iframe>` rendered, button present
- mount with `active=true`: assert `<iframe>` rendered with correct `src`
- click button when `active=false`: assert `request-activate` emitted

**Commit:** `feat: LazyIframe component (renders iframe only when active)`

---

### Task 04 — Refactor `video/[id].vue`

**Goal:** smallest of the 4 (1 iframe per layout, may have desktop+mobile dupe).

**Steps:**
1. Replace direct `<iframe>` with `<LazyIframe :active="activeTab === 'youtube'" :src="embed" :title="..." @request-activate="setActiveTab('youtube')" />`
2. Use `useTabState('video', 'youtube')`
3. Remove eager iframe mount

**Test:** `tests/pages/video.test.ts` — mount the page with mock item, assert exactly 1 iframe in initial render (when active=youtube). Click another tab, assert only 1 iframe still.

**Commit:** `feat(video): lazy iframe + persisted tab state`

---

### Task 05 — Refactor `playlist/[id].vue`

**Goal:** 3 iframes (YouTube, SoundCloud, Spotify) → only 1 active at a time.

**Steps:**
1. Identify 3 platforms used in this page
2. Wrap each in `<LazyIframe :active="activeTab === 'spotify'"... />` etc.
3. Wire `useTabState('playlist', 'youtube')`
4. Tab switcher buttons emit `setActiveTab(...)`

**Test:** `tests/pages/playlist.test.ts` — assert exactly 1 iframe on initial render. Switch tabs in test (click button), assert old iframe unmounted, new mounted.

**Commit:** `feat(playlist): lazy iframe + persisted tab state (3 platforms)`

---

### Task 06 — Refactor `release/[id].vue`

**Goal:** 4 iframes — same pattern.

**Steps:**
1. Identify 4 platforms
2. Apply LazyIframe wrap pattern
3. Wire `useTabState('release', 'youtube')`

**Test:** `tests/pages/release.test.ts` — assert exactly 1 iframe on initial render; verify localStorage write on tab switch.

**Commit:** `feat(release): lazy iframe + persisted tab state (4 platforms)`

---

### Task 07 — Refactor `artist/[id].vue`

**Goal:** 2 iframes — same pattern.

**Steps:**
1. Identify 2 platforms
2. Apply LazyIframe wrap pattern
3. Wire `useTabState('artist', 'youtube')`

**Test:** `tests/pages/artist.test.ts` — assert exactly 1 iframe on initial render.

**Commit:** `feat(artist): lazy iframe + persisted tab state (2 platforms)`

---

### Task 08 — Cross-page integration test

**Goal:** verify tab choices persist independently per page-type.

**Steps:**
1. `tests/integration/tab-state-isolation.test.ts`:
   - Set `sentimony-tab-release = 'spotify'`
   - Set `sentimony-tab-artist = 'soundcloud'`
   - Mount release page, assert spotify active
   - Mount artist page, assert soundcloud active
   - Verify the two keys do NOT collide

**Commit:** `test(integration): tab state isolation across pages`

---

### Task 09 — Verify and bump

**Goal:** final sanity + version bump.

**Steps:**
1. `pnpm test && pnpm typecheck && pnpm build` — all green
2. Sample a built page HTML — assert exactly 1 `<iframe>` tag in render
3. Bump `package.json` minor version

**Test:** `tests/no-multi-iframe.test.ts` — for each of 4 pages, assert `built-output-html.match(/<iframe/g).length === 1`.

**Commit:** `chore: verify single-iframe-per-page + bump minor version`

---

## Post-migration sanity (manual)

- [ ] `pnpm dev` → open `/release/<id>`. DevTools Network: only one iframe-source request fires. Click another tab — old iframe network closes, new opens.
- [ ] Repeat on `/artist/`, `/playlist/`, `/video/`
- [ ] DevTools Application → Local Storage → confirm 4 distinct keys (`sentimony-tab-release` etc.) populated correctly
- [ ] Hard reload — verify last-selected tab restored
- [ ] No console errors

## Out of scope

- SSR pre-rendering of the active iframe (would require server-side localStorage shim — complex)
- Adjacent-tab prefetching (e.g., loading SoundCloud iframe in background after user picks YouTube)
- Animated transitions between tabs
- Accessibility focus management for screen readers beyond ARIA labels (could be a follow-up audit)
