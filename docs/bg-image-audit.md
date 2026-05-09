# Background-image audit (Task 02)

Enumeration of every inline `bg-[url(...)]` / `background-image` / `background: url(...)` occurrence in `app/`, with a target replacement strategy per case for the NuxtImg migration.

Grep command used:

```sh
grep -rnE 'bg-\[url\(|background-image|background:.*url\(' app/
```

**Result:** 3 active, 2 commented.

## Active occurrences

1. `app/error.vue:42` — `body.isError` style block uses `@apply bg-[url('https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?01')]`.
   - Replacement: drop the `@apply bg-[url(...)]` from `<style>`. Insert `<NuxtImg src="https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg" class="fixed inset-0 -z-10 object-cover w-full h-full" alt="" aria-hidden="true" />` at the top of the `<template>`. Keep `bg-green-950` fallback.
   - Note: same underlying asset as item 3 (different cache-buster `?01` vs `?02`). Once item 3 places a body-level `<NuxtImg>` in `app.vue`, item 1's only required action is removing the `body.isError` `<style>` block in `error.vue`. Do NOT add a second `<NuxtImg>` unless the design intent is a different image on the error page.

2. `app/components/Testimonials.vue:9` — wrapper div: `class="relative !bg-sage-alt overflow-hidden bg-[url('https://content.sentimony.com/assets/img/svg-images/mandala-01.svg')] bg-center bg-no-repeat bg-cover bg-fixed"`.
   - Replacement: keep wrapper as relative container with `!bg-sage-alt overflow-hidden`. Insert `<NuxtImg src="https://content.sentimony.com/assets/img/svg-images/mandala-01.svg" class="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none" alt="" aria-hidden="true" />` as first child. Inner content gets `relative z-10` to stack above.

3. `app/assets/css/tailwind.css:9` — `body` uses `@apply bg-[url('https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?02')]` plus `bg-center bg-no-repeat bg-cover bg-fixed`.
   - Replacement: remove the `bg-[url(...)]` and `bg-center bg-no-repeat bg-cover bg-fixed` from the body `@apply` chain. Render a single `<NuxtImg src="https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg" class="fixed inset-0 -z-10 object-cover w-full h-full" alt="" aria-hidden="true" />` once in `app.vue` (or default layout). Keep `bg-green-950` as fallback color.

## Commented occurrences (dead code, scheduled for removal in Task 06)

- `app/assets/css/tailwind.css:10` — commented `bg-[url('https://firebasestorage.googleapis.com/.../trees-green_v5-sm.webp...')]`
- `app/assets/css/tailwind.css:11` — commented `bg-[url('https://firebasestorage.googleapis.com/.../trees-green_v5-lg.webp...')]`

## Notes

- Both `?01` and `?02` query suffixes on the `trees-green_v5.jpg` URL are cache busters; NuxtImg can drop them and rely on its own asset pipeline / CDN cache headers.
- All replacement NuxtImg elements should be `aria-hidden="true"` with empty `alt` since they are purely decorative backgrounds.
