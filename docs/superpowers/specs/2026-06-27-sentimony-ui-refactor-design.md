# Sentimony UI Refactor Design

**Date:** 2026-06-27
**Status:** Proposed
**Surface:** Shared Vue components used by catalog, profile, and link surfaces.

## Goal

Reduce repeated HTML in the current Nuxt UI without adding another component
library or introducing a broad design-system rewrite.

The first implementation should extract only the patterns already duplicated in
the codebase:

- Link/button rendering in `BtnPrimary.vue`.
- Thumbnail rendering in `Item.vue`.
- Small status badges in `Item.vue`.
- Incorrect optional handling around `Item` category links.

The result should preserve the existing visual language documented in
`DESIGN.md`, keep current routes and content unchanged, and make future UI work
less repetitive.

## Non-Goals

- Do not add a new UI framework.
- Do not create a shadcn-vue registry.
- Do not introduce an `entity/` component layer in the first pass.
- Do not rewrite page layouts.
- Do not redesign spacing, typography, color, or hover behavior.
- Do not convert every Tailwind class into `cva` variants.
- Do not rename `ItemContent.vue` in the first implementation.

## Architecture

Keep `app/components/ui/` reserved for shadcn-vue and Reka-backed low-level
components.

Add a small Sentimony-owned component layer under:

```txt
app/components/sr/
  SrLinkButton.vue
  SrMediaThumb.vue
  SrStatusBadge.vue
```

These components are not a complete design system. They are extracted UI
patterns with Sentimony-specific styling.

`BtnPrimary.vue` becomes a compatibility wrapper around `SrLinkButton` so
existing call sites can keep working during the migration.

`Item.vue` continues to own catalog-item composition, routing, and category
logic. It delegates repeated rendering details to `SrMediaThumb` and
`SrStatusBadge`.

`cva` remains available but is not used until a component has real variants.
The first pass should prefer inline Tailwind classes inside the extracted
components.

## Component Contracts

### SrLinkButton

`SrLinkButton` renders the correct interactive element:

- `NuxtLink` for internal routes.
- `<a>` for external `http`, `https`, `mailto`, and `tel` links.
- `<button type="button">` when no `to` is provided.

It supports the existing `BtnPrimary` inputs:

- `to?: string`
- `iconify?: string`
- `img?: string`
- `svg?: string`
- `title?: string`

`title` must render as plain text. `svg` remains the only HTML escape hatch and
must keep the existing sanitizer behavior.

The component keeps the current button appearance, including height, border,
hover surface, backdrop blur, spacing, `v-wave`, and icon sizing.

### SrMediaThumb

`SrMediaThumb` owns thumbnail frame and `NuxtImg` rendering.

Props:

- `src?: string`
- `alt: string`
- `aspect?: 'square' | 'video' | 'poster'`
- `width?: number`
- `height?: number`

Aspect mapping:

- `square` -> `aspect-square`
- `video` -> `aspect-video`
- `poster` -> `aspect-[440/620]`

The component keeps the existing thumbnail surface:

- `w-15 md:w-30`
- `rounded-sm`
- `bg-black/50`
- `overflow-hidden`
- `shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]`
- `NuxtImg` with existing sizes, densities, fit, format, and lazy loading.

### SrStatusBadge

`SrStatusBadge` owns the small absolute corner badge style.

Props:

- `label: string`
- `tone?: 'green' | 'red'`

The component keeps the current visual treatment:

- white text
- tiny mobile and desktop type sizes
- upper-right absolute positioning
- cover-lift shadow
- `rounded-tr-sm rounded-bl-sm`

`tone="green"` maps to the existing coming-soon green. `tone="red"` maps to the
existing out-now/category red.

## Item Behavior

`Item.vue` should render one thumbnail image, selected by priority:

1. `cover_xl`
2. `photo_xl`
3. `flyer_a_xl`

If multiple media fields exist on one entity, only the first available source is
rendered.

`category` should become required if every valid item link needs a category.
This prevents accidental `/undefined/:slug` URLs.

Badges should be mutually exclusive:

1. `coming_soon` -> `Coming Soon`, green.
2. `new` -> `Out Now`, red.
3. `category_id` -> category label, red.

Only one badge may render for a single item.

## Constraints

- Preserve the existing visual output unless a change is explicitly required to
  remove overlap or invalid routing.
- Keep comments in code English if comments are needed.
- Do not touch unrelated dirty worktree changes.
- Do not add new dependencies.
- Do not modify shadcn-vue generated components.
- Keep dark-theme behavior visually stable.
- Keep public component names explicit and short.

## Testing

Use type checking and focused regression checks rather than broad visual
rewrites.

Required checks:

- `npx vue-tsc --noEmit`
- `npm run test:unit`
- `npm run build`

Manual or Playwright-backed checks should cover:

- A page using `BtnPrimary`.
- Releases, artists, videos, and events list items.
- An item with `coming_soon`.
- An item with `new`.
- An item with `category_id`.
- Internal and external link button behavior.

## Future Work

After this refactor lands, evaluate whether `ItemContent.vue` should become
`SrContentSurface.vue`.

Only add `app/lib/ui/variants.ts` and `cva` button variants if at least two
real button variants or sizes exist in active call sites.

