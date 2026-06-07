---
name: Sentimony Records
description: JAMstack portfolio for a psychedelic music label — a nocturnal forest séance in green-black monochrome.
colors:
  forest-night: "oklch(0.16 0.02 155)"
  morning-mist: "oklch(0.97 0.01 155)"
  forest-ink: "oklch(0.18 0.02 155)"
  bone-white: "oklch(1 0 0)"
  oxblood: "#8a0202"
  spore-sage: "#b5ccb5"
  signal-red: "oklch(0.6 0.2 22)"
  coming-soon-green: "#16a34a"
  out-now-red: "#dc2626"
typography:
  display:
    fontFamily: "Julius Sans One, sans-serif"
    fontSize: "clamp(40px, 6vw, 100px)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
  body:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "clamp(12px, 1.2vw, 16px)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.2em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.bone-white}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "oklch(1 0 0 / 90%)"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.md}"
  nav-link:
    textColor: "{colors.bone-white}"
    rounded: "{rounded.xs}"
  card-thumb:
    backgroundColor: "oklch(0 0 0 / 50%)"
    rounded: "{rounded.sm}"
  badge-out-now:
    backgroundColor: "{colors.out-now-red}"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.xs}"
---

# Design System: Sentimony Records

## 1. Overview

**Creative North Star: "Forest Séance"**

Sentimony is a nocturnal psychedelic rite held in a green-black forest. The default theme is dark, and the deepest layer of the page is a photographic canopy of trees seen at dusk; everything above it floats in translucent green-tinted neutrals. The interface does not announce itself. It is quiet, atmospheric, and near-monochrome, so that the music's artwork and the artists' names are the only things that carry real color. Hierarchy is built from scale, letter-spacing, and translucency, never from loud chrome.

The type carries the ritual. Display words are set in the thin, inscriptional capitals of Julius Sans One and widen their tracking as they grow, so the largest headline reads like a slow chant. Body and UI sit in a single regular weight of Montserrat. There is no bold anywhere in the system; the whole site is drawn with one stroke weight and lets size and space do the work. The single concession to heat is oxblood, a clotted blood-red that appears only on hover-revealed micro-surfaces. It is the one drop of blood in an otherwise green-and-bone room.

This system explicitly rejects the saturated defaults of its category. It is not a neon cyber-rave (no purple-pink gradients, no glow, no glass), not a corporate streaming clone (no flat bright card walls, no neutral sterility), not a generic SaaS or AI dashboard (no cream background, no eyebrow kickers, no identical card grids), and not 2014 skeuomorphism (no deep shadows, no bevels, no gradient buttons). Color lives in the photography and the cover art; the chrome stays out of the way.

**Key Characteristics:**
- Dark-default, with the legacy nocturnal green-black canopy photograph; the homepage light theme pairs it with its own pale Morning Veil canopy (`trees-white_v1.jpg`).
- Green-tinted monochrome neutrals (every neutral carries hue 155, no true grays).
- One stroke weight (Regular 400) for both display and body; hierarchy from scale + tracking + case.
- Tonal layering by alpha, not shadow; depth comes from translucency and the background photo.
- A single rare accent (oxblood #8a0202); color otherwise belongs to artwork.

## 2. Colors

A green-tinted monochrome built on a single hue (155), where saturation is rationed and the only true accents are reserved for status and the rarest of hovers.

### Primary
- **Forest Night** (`oklch(0.16 0.02 155)`): The default canvas. A near-black green that sits beneath the photographic forest background in dark mode; the resting color of the entire site.
- **Bone White** (`oklch(1 0 0)`): The voice of the dark theme. All display capitals, body text, and active icons in dark mode are pure white; in light mode this flips to Forest Ink.

### Secondary
- **Oxblood** (`#8a0202`): The séance's single drop of blood. Used only on hover-revealed social tooltips in the footer. It is never a button, never a heading, never a surface.
- **Spore Sage** (`#b5ccb5`): A soft living green. Carries the decorative triangle divider (`SvgTriangle`) and the legacy `.Content` reading surface. Organic, botanical, low-saturation.

### Neutral
- **Morning Mist** (`oklch(0.97 0.01 155)`): The light theme canvas. A pale green-tinted off-white, never a warm cream. On the homepage it is used as a translucent atmospheric veil over the original forest photograph, not as a flat replacement for imagery.
- **Forest Ink** (`oklch(0.18 0.02 155)`): Near-black green. Body text and active icons in the light theme; the primary surface fill in light mode.
- **Tonal overlays** (`oklch(1 0 0 / 5–30%)` in dark, `oklch(0 0 0 / 5–30%)` in light): The workhorses. Cards, hovers, active states, borders, and frosted panels are all built from white-or-black alpha at low percentages, tinted by the theme's own ink.

### Tertiary (status only)
- **Coming Soon Green** (`#16a34a`): The "Coming Soon" release badge.
- **Out Now Red** (`#dc2626`): The "Out Now" release badge.
- **Signal Red** (`oklch(0.6 0.2 22)` light / `oklch(0.7 0.19 22)` dark): Destructive actions and form errors only.

### Named Rules
**The Green Monochrome Rule.** Every neutral carries hue 155 at low chroma (0.01–0.02). There are no true grays in this system. A neutral that reads as cool-blue or warm-cream is wrong; tint it back toward forest green.

**The Oxblood Rule.** Oxblood (`#8a0202`) is the only saturated hue permitted to touch chrome, and only on hover-revealed micro-surfaces. It is forbidden on buttons, headings, backgrounds, and anything visible at rest. Its rarity is the point.

**The Artwork-Owns-Color Rule.** The interface is monochrome so that release covers, artist photos, and event flyers are the only saturated objects on screen. Never add a colored UI element that competes with the art.

## 3. Typography

**Display Font:** Julius Sans One (with `sans-serif` fallback)
**Body Font:** Montserrat (with `sans-serif` fallback)

**Character:** Thin inscriptional capitals paired with a clean geometric-humanist sans. Julius Sans One is all-caps by nature — classical, airy, ceremonial; Montserrat is modern, neutral, and legible. The contrast axis is classical-display against utilitarian-body, never two competing sans.

### Hierarchy
- **Display** (400, `clamp(40px, 6vw, 100px)`, line-height 1.4, uppercase): The hero wordmark "SENTIMONY RECORDS" only. Letter-spacing scales with size, from ~2px at the smallest to 14px at full size.
- **Headline** (400, `text-2xl → text-4xl`, ~24–36px): Page titles (`<h1>` on list pages). Set in Montserrat, sentence case.
- **Body** (400, `clamp(12px, 1.2vw, 16px)`, line-height ~1.5): All reading copy, navigation, and UI labels. Center-aligned by default (`body { text-align: center }`). Cap reading measure at 65–75ch.
- **Label** (400, ~8–12px, letter-spacing 0.2em+, uppercase): Micro labels — social-icon hover captions, status badges. Reserved for ≤4-word strings.

### Named Rules
**The Single-Weight Rule.** Only Regular (400) is loaded for both families. Do not reach for bold, semibold, or medium; build all hierarchy from scale, letter-spacing, and case. Synthetic (faux) bold is forbidden — if a step needs more emphasis, make it larger or wider, not heavier.

**The Breathing Caps Rule.** Display capitals widen their tracking as they grow (≈0.05em at 40px up to 0.14em at 100px). Tight display type is forbidden; large capitals must breathe like a slow chant. Reserve uppercase for display and ≤4-word labels — never for body sentences.

## 4. Elevation

The system is flat by default and separates surfaces with tonal layering, not shadow. UI depth is built from translucent overlays (white alpha in dark mode, black alpha in light mode, 5–30%) stacked over the theme canvas. In dark mode the true depth is photographic: a fixed forest image sits at the back, and frosted `backdrop-blur` panels float above it. Only one literal drop-shadow exists in the whole system.

### Shadow Vocabulary
- **Cover lift** (`box-shadow: 0 2px 10px 0 rgba(0,0,0,0.5)`): The single sanctioned shadow. Applied under floating cover art / thumbnails and the small status badges, to lift them off the canvas. Soft, low, dark.
- **Frosted header** (`backdrop-filter: blur(4px)` over a 5% alpha fill): The sticky header is a translucent frosted bar, not an opaque surface; it reads the forest behind it.

### Named Rules
**The Tonal Layering Rule.** Surfaces separate by alpha tint, never by raised shadow. Black/white overlays at 5–30% build the entire hierarchy. The only drop-shadow permitted is the soft `0 2px 10px rgba(0,0,0,0.5)` under cover art and badges — anything darker or larger reads as 2014 skeuomorphism and is forbidden.

**The Photographic Depth Rule.** Each homepage theme owns its photograph, shown plain - no filters, no overlays on the image itself. Dark mode keeps the legacy green-black nocturnal canopy `trees-green_v5.jpg` exactly as the rest of the dark site renders it; light mode uses the purpose-made pale canopy `trees-white_v1.jpg`. Read-surface contrast comes from translucent background veils on content strips, never from grading the photo.

## 5. Components

Built on shadcn-vue (new-york) primitives over reka-ui, themed with the green-monochrome tokens. Every interactive element carries a `v-wave` ripple and an `ease-in-out` transition (200–300ms).

### Buttons
- **Shape:** Gently rounded (`rounded-md`, 6px). Default height 36px (`h-9`), sm 32px, lg 40px.
- **Primary:** Inverted ink — `bg-primary text-primary-foreground` (white fill + dark text in dark mode; dark fill + white text in light mode), padding `8px 16px`.
- **Hover / Focus:** Primary lightens to `primary/90`. Focus shows a 3px `ring-ring/50` halo, no hard outline.
- **Outline / Secondary / Ghost / Link:** Outline is a bare border on a translucent fill (`border bg-background`, `dark:bg-input/30`); ghost is fill-on-hover only (`hover:bg-accent`); link is the primary color with an underline on hover. All token-driven, all theme-aware.

### Cards / Containers
- **Thumbnail card (signature `Item`):** The universal card across every list page. A fixed-width tile (80px mobile / 180px desktop) holding a cover framed in `bg-black/50` with the Cover-lift shadow, `rounded-sm` corners. The frame's aspect ratio is category-driven: `aspect-square` for releases/artists, `aspect-video` for videos, `aspect-[440/620]` for event flyers. Hover raises a translucent backdrop behind the cover; title sits below in a 2-line clamp.
- **Status badges:** Tiny corner tags — "Coming Soon" on green-600, "Out Now" on red-600 — `rounded-tr-sm rounded-bl-sm`, with the Cover-lift shadow.
- **Auth cards (shadcn Card):** `bg-card` over an explicit `border-white/20` (no global border base layer exists, so borders are set per instance).

### Inputs / Fields
- **Style:** shadcn Input — single border (`border-input`), translucent fill, `rounded-md`. The shared `PasswordInput` adds a show/hide toggle.
- **Focus:** 3px `ring-ring/50` halo plus border shift to `ring`. No glow.
- **Autofill:** Overridden globally so Chrome's autofill text uses `var(--foreground)` and stays on-theme in both modes.
- **Error:** `aria-invalid` paints the border and ring Signal Red; server errors surface in an inline `Alert`.

### Navigation
- **Header:** A sticky, frosted, `backdrop-blur` bar with a bottom hairline. Nav links are ghost buttons (`rounded-[2px]`, `h-56px`) that frost on hover (`bg-black/10 dark:bg-white/30`) and hold a subtle fill when active. Brand glyphs and the wordmark are theme-aware: the logo SVG is `invert dark:invert-0`, icons inherit `text-foreground`. Below `lg`, center nav collapses; a mobile menu spacer holds the right edge.
- **Footer:** A self-contained black slab (`bg-black text-white/50`), intentionally dark in both themes. A bordered pill of full nav links, a social-icon row whose icons reveal Oxblood tooltips on hover, copyright, and credits.

### Signature: The Hero Wordmark
The home hero is the system's thesis statement: "SENTIMONY" stacked over a letter-spaced "R E C O R D S", set in Julius Sans One, uppercase, Forest Ink in light mode and Bone White in dark mode, over a theme-aware gradient (`from-background/70 … to-background/85` in light, `to-black/50` in dark) that grounds it against the forest. Size and tracking scale together across five breakpoints (40px/2px up to 100px/14px). This is the one place where type is the whole design.

### Theme Toggle
A sun/moon glyph that switches themes with a View Transitions circular-reveal: a `clip-path` circle expands from the click point (450ms, ease-in-out). Honors `prefers-reduced-motion` by swapping instantly.

## 6. Do's and Don'ts

### Do:
- **Do** keep every neutral on hue 155 at low chroma (0.01–0.02). Tint toward forest green, never toward cool-blue or warm-cream.
- **Do** build hierarchy from scale, letter-spacing, and case. Only Regular (400) exists — go larger or wider, never heavier.
- **Do** widen display tracking as type grows (up to 0.14em at 100px). Large capitals must breathe.
- **Do** separate surfaces with alpha overlays (5–30%), tinted by the theme's ink (`white/X` in dark, `black/X` in light). Use the `dark:` variant pattern so the dark theme stays pixel-identical when you touch the light one.
- **Do** let release covers, artist photos, and flyers be the only saturated objects on screen.
- **Do** keep the dark theme's forest photograph visible; float frosted, blurred panels over it.
- **Do** set borders per instance (e.g. `border-white/20`) — there is no global `border-border` base layer, and bare `border` utilities fall back to `currentColor`.

### Don't:
- **Don't** introduce a cream / sand / beige background. The light theme is pale green Mist (`oklch(0.97 0.01 155)`), never warm paper.
- **Don't** add neon cyber-rave chrome: no purple-pink gradients, no glow, no glassmorphism as decoration, no gradient text (`background-clip: text`).
- **Don't** build a corporate-streaming wall of flat, bright, identical cards. Cards here are quiet thumbnails framed in `black/50`, not glowing tiles.
- **Don't** ship generic SaaS / AI-dashboard scaffolding: no cream hero, no tiny uppercase eyebrow above every section, no numbered `01 / 02` section markers, no identical icon-heading-text card grids.
- **Don't** use 2014 skeuomorphism: no deep shadows, no bevels, no gradient or embossed buttons. The only shadow allowed is `0 2px 10px rgba(0,0,0,0.5)` under cover art and badges.
- **Don't** use Oxblood (`#8a0202`) anywhere it's visible at rest. It is hover-only, micro-surface-only.
- **Don't** reach for bold or synthetic-bold weights, and never set body sentences in all-caps — uppercase is for display and ≤4-word labels only.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe on cards, callouts, or list items.
