# Page Override: Profile (`/profile`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Profile page.
> Source: derived from `app/pages/profile.vue` (146 lines today — auth-protected; shows email + sign-out + 6 sections of liked content with pagination via `usePaginatedLikes`).
> Distinct from all other detail pages: this is the **personal surface** — about the user, not about content. Content shown here is filtered through "what you've liked".

## Pattern

- **Page role:** Logged-in user's home: account info, sign-out, and a self-curated dashboard of liked content (releases / tracks / artists / playlists / events / videos).
- **Composition:** `Account card (email + sign-out)` → `6 liked-content sections, each paginated independently` → `(out of scope) account settings`.
- **Why distinct:** other detail pages are about catalog entities; this is about the user. Content is presented through the lens of personal action, not catalog browsing.

## Layout (top → bottom)

```
container max-w-5xl mx-auto px-4 py-16
│
├── <PageTitle>Profile</PageTitle>
│   (Montserrat, text-2xl my-4 md:my-6 text-center — drop the
│    current `font-['Julius_Sans_One']`. See Issues below.)
│
├── ACCOUNT CARD  (max-w-sm mx-auto)
│   ┌────────────────────────────────────────────────┐
│   │ <div class="bg-white/5 backdrop-blur-sm        │
│   │   border border-white/20 rounded-lg p-6        │
│   │   flex flex-col gap-4 mb-12">                  │
│   │                                                │
│   │   <div class="flex flex-col gap-1">            │
│   │     <span class="text-xs text-white/50          │
│   │       tracking-widest uppercase">Email</span>  │
│   │     <span class="text-white/80">              │
│   │       {{ user.email }}                         │
│   │     </span>                                    │
│   │   </div>                                       │
│   │                                                │
│   │   (Optional v2:                                │
│   │    Display name field — editable inline,       │
│   │    Avatar — uploaded to Supabase Storage)      │
│   │                                                │
│   │   <button @click="signOut"                     │
│   │     class="border border-white/30 rounded      │
│   │     px-4 py-2 hover:bg-white/20                │
│   │     focus-visible:bg-white/20 transition-      │
│   │     colors duration-300 text-sm mt-2"          │
│   │     v-wave>                                    │
│   │     Sign Out                                   │
│   │   </button>                                    │
│   │                                                │
│   │   (Optional v2:                                │
│   │    "Change password" link → /change-password,  │
│   │    "Delete account" link → /delete-account     │
│   │    with confirmation flow)                     │
│   │ </div>                                         │
│   └────────────────────────────────────────────────┘
│
├── 6 LIKED-CONTENT SECTIONS  (each a separate <section>)
│   ┌────────────────────────────────────────────────┐
│   │ Liked Releases                          [h2]   │
│   │ <Item category="release"> × N                  │
│   │ "Show more 5 (X left)"                         │
│   ├────────────────────────────────────────────────┤
│   │ Liked Tracks                            [h2]   │
│   │ <li> × N (track row, see Track row design     │
│   │   below — matching pages/playlist-detail.md   │
│   │   tracklist row pattern)                       │
│   │ "Show more 20 (X left)"                       │
│   ├────────────────────────────────────────────────┤
│   │ Liked Artists                           [h2]   │
│   │ <Item category="artist"> × N                   │
│   ├────────────────────────────────────────────────┤
│   │ Liked Playlists                         [h2]   │
│   │ <Item category="playlist"> × N                 │
│   ├────────────────────────────────────────────────┤
│   │ Liked Events                            [h2]   │
│   │ <Item category="event"> × N                    │
│   ├────────────────────────────────────────────────┤
│   │ Liked Videos                            [h2]   │
│   │ <Item category="video"> × N                    │
│   └────────────────────────────────────────────────┘
│   - h2: text-2xl my-6 (Montserrat, NOT Julius)
│   - count appended: text-white/40 ml-2 tabular-nums
│     (e.g. "Liked Releases · 12")
│   - Empty section (count=0 AND not loading): hide
│     entirely (no h2, no grid, no Show more)
│   - "Show more" button: text-sm text-white/50
│     hover:text-white/80 disabled:opacity-40
│     (existing token preserved)
│
└── (FUTURE) ACCOUNT SETTINGS / DANGER ZONE
    See Out of scope.
```

### Liked Tracks row (replaces the current text-only line)

The current implementation renders Liked Tracks as a stark text line: `<b>{{ artist }}</b> - {{ title }} <small>({{ bpm }}bpm)</small>` linking to the parent **release** (not the track itself). This is inconsistent with the rest of the project's tracklist patterns and loses the track's own detail page.

Replace with the row pattern from `pages/playlist-detail.md`:

```
<li class="flex items-center gap-3 py-2 hover:bg-white/5 rounded-sm transition-colors duration-200">
  <span class="text-white/40 tabular-nums w-8 text-right">{{ index + 1 }}</span>
  <img v-if="t.cover_th" :src="t.cover_th" class="size-10 rounded-sm shrink-0 ring-1 ring-white/10" :alt="t.title">
  <div class="flex-1 min-w-0">
    <NuxtLink :to="`/track/${t.slug}`" class="font-medium hover:underline">{{ t.title }}</NuxtLink>
    <div class="text-xs text-white/60">
      <NuxtLink :to="`/artist/${t.artist_slug}`" v-if="t.artist_slug" class="hover:underline">{{ t.artist_name }}</NuxtLink>
      <span v-else>{{ t.artist_name }}</span>
      <span> · </span>
      <NuxtLink :to="`/release/${t.release_slug}`" class="hover:underline">{{ t.release_title }}</NuxtLink>
    </div>
  </div>
  <span v-if="t.bpm" class="text-xs text-white/50 tabular-nums shrink-0">{{ t.bpm }}bpm</span>
</li>
```

This requires the `LikedTrack` payload to include `cover_th`, `release_title`, and optionally `artist_slug` (server-side join — already mostly trivial since track-likes API has access to release / artist data).

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Page wrapper | `container max-w-5xl mx-auto px-4 py-16` | unchanged |
| Page heading | `text-2xl text-center mb-8` (Montserrat — drop Julius) | h1 |
| Account card | `bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6 flex flex-col gap-4 mb-12 max-w-sm mx-auto` | account block |
| Account label | `text-xs text-white/50 tracking-widest uppercase` | "Email" / etc |
| Account value | `text-white/80` | email value |
| Sign-out button | `border border-white/30 rounded px-4 py-2 hover:bg-white/20 focus-visible:bg-white/20 transition-colors duration-300 text-sm mt-2` | action |
| Section h2 | `text-2xl my-6` (Montserrat — drop Julius) + count `text-white/40 ml-2 tabular-nums` | each liked section |
| Section grid | `flex flex-wrap` | unchanged |
| Show more button | `mt-4 text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-40` | unchanged |
| Tracks row | matches `pages/playlist-detail.md` tracklist row token | replacement for current text-only line |

## Components

**Reuse:**
- `<Item category="release|artist|playlist|event|video">` — existing
- `<NuxtLink>` for track row title / artist / release navigations
- `<PageTitle>` once shipped (#13)
- `usePaginatedLikes` composable — existing, no changes
- `useAuth` composable (`signOut`, `user`) once extracted per `pages/login.md`

**Do not introduce:**
- ❌ A user-customisable dashboard (drag-and-drop sections). Out of scope.
- ❌ Notification preferences UI. Out of scope.

## Data

**Schema additions for `LikedTrack` (server-side join):**

```ts
type LikedTrack = {
  slug: string
  title: string
  artist_name: string
  artist_slug?: string   // NEW — when liked artist exists in catalog
  release_slug: string
  release_title: string  // NEW — for inline display
  cover_th?: string      // NEW — release cover; same image as release.cover_th
  track_number: number
  bpm: number | null
}
```

**`/api/track-likes/tracks` endpoint** updates to return these joined fields. Cache CDN per existing pattern.

**No other API changes** required for v1.

## Issues to fix during implementation

### `font-['Julius_Sans_One']` violation (multiple)

Profile uses `font-['Julius_Sans_One']` directly:
- Page h1 (line 30 in profile.vue)
- Each liked-section h2 (lines 47, 62, 84, 99, 114, 129)

Per MASTER §Typography, **Julius is reserved for brand moments**. Profile is a utility surface; the headings are functional, not brand statements.

**Fix:** replace all `font-['Julius_Sans_One']` with Montserrat default. Keep visual hierarchy via `text-2xl` (h1) and `text-2xl my-6` (h2). Year-anchor decoration (where `font-julius opacity-30` IS allowed) does not apply here.

### Tracks navigation goes to wrong destination

`<NuxtLink :to="\`/release/${t.release_slug}\`">` for liked tracks navigates to the parent release, not the track itself. This is inconsistent: a user liked a **track**, but clicking it takes them to the **release**. Replace with `/track/${t.slug}` per the row design above.

### Missing section counts

Current sections show items but no count (12 left isn't a count — it's pagination remainder). Add explicit count `· N total` next to each section heading so the user can see at a glance how many tracks they've liked overall.

### No consistent loading skeleton

Current logic: `v-if="releases.items.value.length || releases.loading.value"` shows the section when loading OR has items. The loading state then has no content — just an empty grid. Add a small skeleton (or simple "Loading…" caption) so the section isn't visually empty during fetch.

## Interactions specific to this page

### Account card

- **Email:** read-only display.
- **Sign Out:** calls `signOut()`, navigates to `/login`. No confirmation prompt at v1 (sign-out is reversible; bias to action).

### Liked-content sections

- **Show more:** loads next chunk via `usePaginatedLikes.loadMore()`. Disabled during loading.
- **Item card click:** navigates to detail page (existing behaviour).
- **Track row clicks:** title → `/track/[slug]` (NEW); artist → `/artist/[slug]` (NEW); release → `/release/[slug]`.
- **Empty section:** completely hidden (no h2, no grid).

### Auth

- **Auth-protected** via `definePageMeta({ middleware: 'auth' })` — already in place.
- **Token expired** during page lifetime: middleware redirects to `/login` on next protected fetch.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Profile</h1>` → 6× `<h2>` (one per liked-content section). Linear, no skips.
- Account card: each label-value pair structurally represents metadata. `<dl>` would be more semantic, but the existing visual is a bare flex-col; either implementation is acceptable provided labels are visually associated with values.
- Sign Out button: explicit `aria-label="Sign out of your account"` (button text "Sign Out" is sufficient on its own; aria-label is optional refinement).
- Track row: title link is the primary destination; artist and release are independent secondary links. All three siblings, none nested.
- "Show more" button: `aria-busy` during loading, visual `disabled` state.
- Focus order: page heading → account email → sign out → liked-section content → next liked-section content → ... → footer.
- All `:focus-visible` rings; all `v-wave` on item cards (existing) and sign-out button.

## Anti-patterns specific to this page

- ❌ **Do not use `font-['Julius_Sans_One']`** for utility headings. Brand moments only per MASTER §Typography.
- ❌ **Do not navigate liked tracks to the parent release.** They are tracks; route to `/track/[slug]`.
- ❌ **Do not show empty sections** (h2 + empty grid + Show more disabled). Hide entirely when count is 0 and not loading.
- ❌ **Do not require email confirmation again** to access this page (already auth-protected).
- ❌ **Do not duplicate the email** in multiple places (account card is the single source of truth).
- ❌ **Do not auto-load all sections eagerly.** Existing `usePaginatedLikes` chunks correctly; preserve the chunked behaviour.
- ❌ **Do not add a "Likes activity" timeline** at v1. Activity feeds are a separate product surface.
- ❌ **Do not show liked items publicly** by default. The profile is private; sharing-out is a v2 feature.
- ❌ **Do not redirect to `/profile` after signin** if the user came from a different protected page. Honor the original destination via query param `?redirect=` (Supabase Nuxt integration supports this; verify on implementation).

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] `<h1>Profile</h1>` Montserrat (NOT Julius)
- [ ] All 6 section `<h2>` Montserrat (NOT Julius)
- [ ] Section counts displayed as inline `text-white/40 tabular-nums` after heading
- [ ] Empty sections hidden entirely
- [ ] Liked Tracks rendered with proper row pattern (cover + title-link → /track/, artist-link → /artist/, release-link → /release/)
- [ ] Account card uses existing skim + border tokens
- [ ] Sign Out button has explicit accessible name
- [ ] Heading hierarchy: h1 → 6× h2

### Behaviour

- [ ] `usePaginatedLikes` chunked loading preserved per section
- [ ] "Show more" disabled during fetch with `aria-busy`
- [ ] Sign Out clears session and navigates to `/login`
- [ ] Track click goes to `/track/[slug]` (not /release/)
- [ ] Artist click within track row goes to `/artist/[slug]` (when artist_slug resolves)
- [ ] All `v-wave` on cards and sign-out
- [ ] All `:focus-visible` rings present

### Data

- [ ] `LikedTrack` payload extended with `cover_th`, `release_title`, optional `artist_slug`
- [ ] `useAuth` composable used (consistent with login/signup)
- [ ] No extra fetches for content already paginated by `usePaginatedLikes`

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Track row wraps cleanly on mobile (cover + title/artist stacked, BPM second line)
- [ ] All liked sections share the same h2 styling
- [ ] Loading state has skeleton or caption (no empty sections)

## Out of scope (deferred / open questions)

- **Display name + avatar** — separate edit flow; needs Supabase Storage and avatar component.
- **Change password** — `/change-password` flow + email confirmation.
- **Delete account** — confirmation modal + Supabase delete + data purge of likes.
- **Notification preferences** — depends on email/push integration.
- **Public profile page** (`/u/[username]`) — opt-in, privacy implications.
- **Liked items export** (CSV / JSON) — niche; defer until requested.
- **"Currently listening"** — requires player state surface; same family as the deferred sticky play-bar.
- **Recommendations** — algorithmic; out of scope.
- **Email change** — Supabase supports it; needs verification flow.
- **2FA settings** — defer until 2FA enabled at signup.

## Cross-references

- `pages/login.md`: shared `useAuth` composable; sign-out destination on logout.
- `pages/signup.md`: signup destination after creating account; `useAuth.signUp` shares the auth API.
- `pages/playlist-detail.md`: track row pattern reused here for Liked Tracks — visual + structural consistency.
- `pages/track-detail.md`: destination for clicked Liked Tracks.
- `pages/release-detail.md`, `pages/artist-detail.md`, `pages/event-detail.md`, `pages/video-detail.md`: destinations from each section.
- Refactor backlog #1: factory for `useLikes` composables — applies to the multiple `usePaginatedLikes` calls here. After refactor, `usePaginatedLikes` could be unified across entity types.
- Refactor backlog #13: `<PageTitle>`. Use here once shipped.
- MASTER §Typography: Julius reserved for brand — explicit fix here.
- MASTER §Components: `<Item>` reused unchanged.
