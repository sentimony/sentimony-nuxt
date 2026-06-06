# Homepage Light Theme Design

**Date:** 2026-06-06
**Status:** Implemented
**Implemented:** 2026-06-06
**Surface:** `/`

## Goal

Refine the existing homepage so its light theme preserves the same organic,
psychedelic forest atmosphere as the dark theme. Keep the current page
structure, content, navigation, and interaction hierarchy unchanged.

The result must be production-ready on mobile and desktop, maintain WCAG 2.2 AA
contrast, and continue to support the existing circular theme transition.

## Approved Direction

The selected visual direction is **Morning Veil**.

The physical scene is diffuse morning light over a damp conifer forest, quiet
after a nocturnal ritual. The light theme should feel brighter and calmer than
the dark theme without becoming sterile, cheerful, or detached from the
Sentimony Records identity.

Visual anchors:

- Morning fog in the Carpathian Mountains.
- A botanical photographic print with muted green pigment.
- Natural marble patterns and organic material textures.

The color strategy is **Committed**: the forest remains the dominant surface,
while interface chrome and overlays stay restrained.

## Source Image

Use one source photograph for both themes:

`https://content.sentimony.com/assets/img/backgrounds/trees-origin_v1.jpg`

Do not maintain separate exported light and dark background images. Theme
variation should come from CSS filters, color overlays, and gradients so both
states remain visibly connected to the same source.

### Light Treatment

- Reduce contrast enough to prevent dark forest gaps from overpowering text.
- Moderately reduce saturation while retaining the green identity.
- Increase brightness without clipping the light tree crowns.
- Apply a pale green mist overlay with a brighter radial area near the visual
  center.
- Use a subtle vertical veil to stabilize contrast from the hero through the
  description section.
- Do not add decorative shapes in the first implementation.

### Dark Treatment

- Replace the current processed background with the same original photograph.
- Lower brightness and deepen the forest-green cast.
- Preserve enough tonal separation to keep the radial tree composition visible.
- Retain restrained color so the page remains nocturnal rather than becoming
  vivid green.
- Keep white hero text readable without relying on a heavy opaque panel.

## Layering Model

Use a consistent layer order:

1. Original forest photograph.
2. Theme-specific image filtering.
3. Theme-specific color and mist overlays.
4. Existing hero and homepage content.
5. Local reading-surface tint only where contrast requires it.

The overlays should be implemented as CSS pseudo-elements or dedicated page
layers. They must not intercept pointer events.

## Existing Structure

Do not change:

- Hero copy, typography, spacing model, or overall composition.
- Homepage description content.
- Header, footer, route structure, or authentication placement.
- Theme toggle behavior or persistence.
- The current content order.

This iteration is a visual treatment of the current homepage, not the broader
homepage restructuring implied by the product hierarchy in `PRODUCT.md`.

## Typography And Contrast

- Preserve Julius Sans One for the hero and Montserrat for body and interface
  text.
- Preserve the existing single-weight typography system.
- Use dark forest ink for light-theme text and white for dark-theme text.
- Hero, tagline, body copy, links, controls, and focus indicators must meet
  WCAG 2.2 AA contrast in their actual rendered positions.
- A local translucent reading surface is allowed where image variation makes
  contrast unstable, but it must remain tonal and quiet.

## Motion

Keep the existing View Transitions circular reveal.

- Theme-specific image filters and overlays must be present in the captured
  transition state so the new theme reveals as one coherent scene.
- Do not add independent entrance or ambient animations.
- When `prefers-reduced-motion: reduce` is active, switch themes immediately.

## Responsive Behavior

- Keep the forest's radial center visible across common mobile, tablet, and
  desktop aspect ratios.
- Define explicit background positions if one universal `center` crop does not
  preserve the composition.
- Prevent hero text overflow at the 320px minimum viewport.
- Avoid fixed visual effects that cause mobile repaint or scrolling problems.

## Accessibility

- Target WCAG 2.2 AA.
- Preserve keyboard access and visible focus states.
- Do not encode theme or state through color alone.
- Ensure the result remains legible with the background image unavailable.
- Respect reduced-motion preferences.

## Performance

- Reuse one optimized image request across both themes.
- Avoid additional raster textures and decorative assets.
- Prefer composited opacity and color layers over expensive blur filters.
- If `filter` on the full viewport causes measurable scrolling or transition
  cost, precompute only the necessary tonal adjustment while retaining the
  single source asset requirement.

## Verification

Verify the homepage at minimum in:

- Light and dark themes.
- 320px mobile, a common tablet width, and wide desktop.
- Default and reduced-motion modes.
- Initial load with the saved light theme and saved dark theme.
- Theme transitions in a View Transitions-capable browser.
- A browser without View Transitions support.

Capture screenshots for both themes at mobile and desktop sizes. Check computed
contrast for hero text, body copy, navigation, links, controls, and focus
indicators against the rendered image treatment.

## Implementation Guidance

The most relevant `impeccable` disciplines are:

- `colorize` for theme-specific image and overlay tuning.
- `adapt` for crop and contrast stability across viewports.
- `polish` for final surface treatment.
- `audit` for accessibility, performance, and responsive verification.
