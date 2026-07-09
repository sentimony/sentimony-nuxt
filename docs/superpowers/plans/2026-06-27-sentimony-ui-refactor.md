# Sentimony UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce repeated Vue/Tailwind markup in the existing Sentimony UI by extracting the current button, thumbnail, and badge patterns into small Sentimony-owned components without changing the site design.

**Architecture:** Add `app/components/sr/` for Sentimony-specific UI components. Keep `app/components/ui/` for shadcn-vue/Reka primitives. Convert `BtnPrimary.vue` into a compatibility wrapper around `SrLinkButton`. Refactor `Item.vue` to delegate media and badge rendering while preserving item layout and route behavior.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, Nuxt Image, Nuxt Icon, v-wave, existing `sanitizeHtml` helper, Vitest, vue-tsc.

---

## File Map

- Create `app/components/sr/SrLinkButton.vue`
- Create `app/components/sr/SrMediaThumb.vue`
- Create `app/components/sr/SrStatusBadge.vue`
- Modify `app/components/BtnPrimary.vue`
- Modify `app/components/Item.vue`
- Optionally modify tests only if existing tests need stable selectors or updated expectations
- Do not modify `app/components/ui/**`
- Do not rename `app/components/ItemContent.vue` in this implementation

### Task 1: Establish The Sentimony UI Component Folder

**Files:**
- Create: `app/components/sr/SrLinkButton.vue`
- Create: `app/components/sr/SrMediaThumb.vue`
- Create: `app/components/sr/SrStatusBadge.vue`

- [ ] Create `app/components/sr/`.
- [ ] Add empty component files with valid `<script setup lang="ts">` and `<template>` blocks.
- [ ] Do not export an index barrel unless Nuxt auto-import requires it.
- [ ] Run `npx vue-tsc --noEmit` and confirm the empty components do not affect type checking.

### Task 2: Implement SrLinkButton

**Files:**
- Modify: `app/components/sr/SrLinkButton.vue`

- [ ] Define props matching the current `BtnPrimary.vue` public contract: `to`, `iconify`, `img`, `svg`, and `title`.
- [ ] Compute trimmed `to`, `iconify`, and `title` values.
- [ ] Compute `isExternal` with the existing protocol check for `http`, `https`, `mailto`, and `tel`.
- [ ] Keep one shared class string or computed class for all rendered elements.
- [ ] Render `NuxtLink` when `to` is present and not external.
- [ ] Render `<a>` when `to` is present and external.
- [ ] Render `<button type="button">` when `to` is absent.
- [ ] Keep `v-wave` on all rendered interactive elements.
- [ ] Render `Icon` when `iconify` is present.
- [ ] Render `<img>` when `img` is present, preserving `width="19"` and `height="19"`.
- [ ] Render sanitized `svg` with `v-html="sanitizeHtml(svg)"`.
- [ ] Render `title` as plain text interpolation, not `v-html`.
- [ ] Preserve the current button classes from `BtnPrimary.vue` unless a class is technically invalid.
- [ ] Run `npx vue-tsc --noEmit`.

### Task 3: Convert BtnPrimary To A Compatibility Wrapper

**Files:**
- Modify: `app/components/BtnPrimary.vue`

- [ ] Replace duplicated internal/external markup with a wrapper around `SrLinkButton`.
- [ ] Keep the same prop names and prop optionality as before.
- [ ] Forward all props to `SrLinkButton`.
- [ ] Forward the default slot.
- [ ] Remove now-unused computed values and imports from `BtnPrimary.vue`.
- [ ] Use `rg "BtnPrimary" app` to list active call sites.
- [ ] Manually verify that no call site depends on `title` accepting arbitrary HTML.
- [ ] Run `npx vue-tsc --noEmit`.

### Task 4: Implement SrMediaThumb

**Files:**
- Modify: `app/components/sr/SrMediaThumb.vue`

- [ ] Define props: `src`, `alt`, `aspect`, `width`, and `height`.
- [ ] Default `aspect` to `square`.
- [ ] Default dimensions to `120x120`.
- [ ] Map `square`, `video`, and `poster` to the same aspect classes currently used by `Item.vue`.
- [ ] Move the thumbnail frame classes from `Item.vue` into the component.
- [ ] Render `NuxtImg` only when `src` is present.
- [ ] Preserve existing `NuxtImg` behavior: `sizes`, `densities`, `fit`, `format`, `loading`, `object-cover`, and rounded corners.
- [ ] Keep the component presentation-only. Do not add routing or item-specific logic.
- [ ] Run `npx vue-tsc --noEmit`.

### Task 5: Implement SrStatusBadge

**Files:**
- Modify: `app/components/sr/SrStatusBadge.vue`

- [ ] Define props: `label: string` and `tone?: 'green' | 'red'`.
- [ ] Default `tone` to `red`.
- [ ] Map `green` to the current `bg-green-600` style.
- [ ] Map `red` to the current `bg-red-600` style.
- [ ] Move the badge positioning, typography, shadow, padding, and rounding classes from `Item.vue` into the component.
- [ ] Render the label as plain text.
- [ ] Run `npx vue-tsc --noEmit`.

### Task 6: Refactor Item Media Selection

**Files:**
- Modify: `app/components/Item.vue`

- [ ] Make `category` required if every valid item link needs it: `category: ItemCategory`.
- [ ] Add a `mediaSrc` computed value that selects `cover_xl`, then `photo_xl`, then `flyer_a_xl`.
- [ ] Add a `mediaAlt` computed value that keeps useful alt text based on the selected media type.
- [ ] Keep the existing `aspectClass` behavior, but convert it to an `aspect` value compatible with `SrMediaThumb`.
- [ ] Keep the existing width and height computed values.
- [ ] Replace the three repeated `NuxtImg` blocks with one `SrMediaThumb`.
- [ ] Preserve the outer `NuxtLink`, frame hover surface, active state, sizing, and title markup.
- [ ] Run `npx vue-tsc --noEmit` and fix call sites where `category` was missing.

### Task 7: Refactor Item Badges

**Files:**
- Modify: `app/components/Item.vue`

- [ ] Replace inline `Coming Soon`, `Out Now`, and `category_id` badge markup with `SrStatusBadge`.
- [ ] Use mutually exclusive rendering with `v-if`, `v-else-if`, and `v-else-if`.
- [ ] Preserve badge priority: `coming_soon`, then `new`, then `category_id`.
- [ ] Convert `category_id` to a string label.
- [ ] Confirm only one badge can render per item.
- [ ] Run `npx vue-tsc --noEmit`.

### Task 8: Regression Verification

**Files:**
- Read-only verification across affected pages and tests.

- [ ] Run `npm run test:unit`.
- [ ] Run `npx vue-tsc --noEmit`.
- [ ] Run `npm run build`.
- [ ] Start the local dev server only if manual browser verification is needed.
- [ ] Check at least one page using `BtnPrimary`.
- [ ] Check list rendering for releases, artists, videos, and events.
- [ ] Check an item with `coming_soon`.
- [ ] Check an item with `new`.
- [ ] Check an item with `category_id`, if available in current data.
- [ ] Check an internal `SrLinkButton` route.
- [ ] Check an external `SrLinkButton` URL opens with `target="_blank"` and `rel="noopener"`.
- [ ] Check that no item URL renders as `/undefined/:slug`.

### Task 9: Post-Implementation Cleanup Review

**Files:**
- Inspect: `app/components/ItemContent.vue`
- Inspect: `app/components/sr/**`
- Inspect: `app/components/Item.vue`
- Inspect: `app/components/BtnPrimary.vue`

- [ ] Confirm no unused imports or computed values remain.
- [ ] Confirm `app/components/ui/**` was not modified.
- [ ] Confirm no new dependency was added.
- [ ] Confirm no `cva` variant file was created unless real variants were introduced.
- [ ] Decide whether `ItemContent.vue` still deserves a later `SrContentSurface.vue` refactor.
- [ ] Record any follow-up as a separate plan or issue instead of expanding this implementation.

