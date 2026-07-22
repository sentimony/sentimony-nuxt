# Product

Updated: 2026-07-19.

## Register

brand

## Users

Sentimony Records serves listeners and collectors of psychill and darkprog
psytrance. They arrive to experience the label's atmosphere, discover the
newest release, and move quickly to a trusted service where they can listen to
or purchase the music. Returning visitors also browse the wider catalog and may
sign in to use account features.

## Product Purpose

Sentimony Records is the digital home of an independent psychedelic music
label from Kyiv. The site presents the label as a distinct cultural and sonic
world while making current releases and the back catalog easy to discover.

The primary hierarchy is:

1. Establish the brand atmosphere.
2. Present the newest release.
3. Provide direct paths to listen or purchase.
4. Support exploration of the catalog.
5. Keep authentication available without competing with discovery.

Success means visitors recognize the label's character, understand what is new,
and can reach a listening or purchasing destination without friction.

## Brand Personality

Ritual, psychedelic, restrained and mysterious, organic. The experience should
feel like entering a living nocturnal environment shaped around the music, not
opening a generic streaming product.

## Anti-references

- Neon festival and cyber-rave aesthetics, including purple-pink gradients,
  indiscriminate glow, and synthetic visual noise.
- Spotify, Beatport, or other corporate streaming clones whose interface
  overwhelms the label's identity.
- Generic SaaS landing-page structures, repeated icon cards, and dashboard
  conventions.
- Recognizable AI-generated styling: template card grids, decorative gradient
  text, excessive rounding, arbitrary glassmorphism, repeated eyebrow labels,
  and pseudo-editorial typography without a content reason.

## Design Principles

1. Atmosphere comes first. Every major surface should establish Sentimony's
   organic psychedelic world before asking the visitor to act.
2. The newest release is the focal content. Give current music a clear visual
   and navigational advantage over the archive.
3. Artwork owns the color. Interface chrome stays restrained so cover art,
   artist imagery, and event graphics remain the most vivid elements.
4. Listening and purchasing are direct. Use clear service-specific actions and
   avoid extra navigation steps between discovery and playback or purchase.
5. Authentication stays secondary. Account controls remain findable but never
   compete with the brand, release, or catalog hierarchy.

## Accessibility & Inclusion

Target WCAG 2.2 AA. All core navigation and actions must work from the keyboard
with visible focus states. Text and controls must maintain AA contrast in both
light and dark themes. Motion must honor `prefers-reduced-motion`, with an
equivalent instant or reduced-motion experience. Meaning and state must never
depend on color alone.

## Current Capabilities

- **Catalog.** Releases, artists, tracks (first-class entities with their own
  pages and audio), videos, events, playlists, and friends, served from a
  switchable backend (Supabase in production; Firebase supported).
- **Listening.** Per-track audio (R2-hosted) with a global player, plus embedded
  Bandcamp / YouTube / SoundCloud players and direct purchase links.
- **Appreciation.** Anonymous accumulate-style likes ("claps") on every entity;
  no sign-in required, public totals hydrated from cached count endpoints.
- **Accounts.** Optional Supabase auth with profile, avatar, and a liked-items
  collection across all entity types.
- **Presentation.** Dark-first theming with light mode, atmospheric global
  background, PWA install/offline support, full SEO (canonical, OG, sitemap).

## Active Initiatives

Current priority and status live in [`docs/roadmap/README.md`](docs/roadmap/README.md).
Each initiative links to its detailed spec and implementation plan where available.

1. **Release artist/title split.** Render the release artist and the release
   name as separate lines across cards, related items, and the release page,
   derived from the canonical `Artist «Name»` title.
   Roadmap: [`release-title-split.md`](docs/roadmap/release-title-split.md).
2. **Public API list envelope.** Unify all public catalog list endpoints on a
   `{ info: { count, pages, next, prev }, results }` envelope with optional
   pagination, one shape for both backends.
   Roadmap: [`api-list-envelope.md`](docs/roadmap/api-list-envelope.md).
3. **[Mobile performance](docs/roadmap/mobile-performance.md).** Raise Lighthouse mobile Performance
   from 68 by cutting main-thread work, unused JS, and DOM size; passive
   listeners; larger footer tap targets.
4. **[CI quality gate](docs/roadmap/ci-quality-gate.md).** Close the gaps in the existing
   `web-debug.yml` pipeline (typecheck + unit + build already run): add e2e,
   build the production `netlify` preset, and make the checks required before
   deploy; sync scripts stay manual-only.
5. **Lazy third-party players.** Implemented: tabs mount
   Bandcamp/YouTube/SoundCloud iframes only once their tab is activated
   (`app/components/Tabs.vue` + `Tab.vue`).
   History: [`completed.md`](docs/roadmap/completed.md).
6. **[Lighter auth/session bundle](docs/roadmap/auth-bundle.md).** Keep Supabase/auth code out
   of the global layout path; lazy-load it for auth, profile, and like
   interactions.
7. **[Profile aggregation](docs/roadmap/profile-aggregation.md).** Serve profile summary plus the
   first page of each collection in one private request.
8. **Server hardening.** Slug validation, entity existence
   checks, and rate limiting for like mutations; redacted, sampled production
   request logging. Roadmap: [`mutation-hardening.md`](docs/roadmap/mutation-hardening.md)
   and [`request-logging.md`](docs/roadmap/request-logging.md).
9. **Brand assets refresh.** PWA icon set with the logo
   breaking out of the safe area; README with AgileCharts-style badges.
   Roadmap: [`pwa-icons.md`](docs/roadmap/pwa-icons.md) and
   [`readme-branding.md`](docs/roadmap/readme-branding.md).
10. **[Design system validity](docs/roadmap/design-system.md).** Audit theme tokens versus
    per-component hardcoded colors so the light theme is component-polished,
    not token-only.
