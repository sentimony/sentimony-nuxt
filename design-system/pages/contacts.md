# Page Override: Contacts (`/contacts`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Contacts page.
> Source: derived from a UX audit of `app/pages/contacts.vue` (36 lines today — bare `<p>` with one mailto link; no structure, no socials, no inquiry differentiation).
> Distinct from all other pages: this is the **outbound channel**. Quality of routing matters more than visual richness — labels routinely receive demos, bookings, press, partnerships, and general questions, all of which deserve clear-but-distinct paths.

## Pattern

- **Page role:** Single-screen surface that routes incoming inquiries to the right destination — by purpose, not by impressing visually.
- **Composition:** `Title block` → `Inquiry-type cards (4)` → `Social links row` → `Address (when public)` → `(optional) Boilerplate disclaimer`.
- **Why diverge from a single mailto:** different inquiry types deserve different framing. A demo submission has different etiquette from a press request. Differentiating the surface upfront sets the right expectation and reduces noise on the receiving inbox.

## Layout (top → bottom)

```
container max-w-3xl   ← article-shape, like news-detail and friend-detail
│
├── <PageTitle>Contacts</PageTitle>
│
├── INTRO COPY  (one paragraph — orientation, not marketing)
│   ┌────────────────────────────────────────────────────┐
│   │ <p class="text-white/70 text-sm md:text-base mb-8">│
│   │   Pick the inquiry type that fits your message.    │
│   │   We reply to relevant requests — quality over     │
│   │   quantity.                                        │
│   │ </p>                                               │
│   └────────────────────────────────────────────────────┘
│
├── INQUIRY CARDS  (grid of 4)
│   ┌────────────────────────────────────────────────────┐
│   │ grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12        │
│   │                                                    │
│   │ ┌─────────────────────────────────────────────┐    │
│   │ │ DEMOS                                       │    │
│   │ │ Send your music for label consideration.    │    │
│   │ │ Include 1–2 unmastered tracks, links to     │    │
│   │ │ existing releases, a short bio.             │    │
│   │ │                                             │    │
│   │ │ <BtnPrimary> Send a demo                    │    │
│   │ │   mailto:demo@... ?subject=Demo: <bio>      │    │
│   │ └─────────────────────────────────────────────┘    │
│   │                                                    │
│   │ ┌─────────────────────────────────────────────┐    │
│   │ │ BOOKINGS                                    │    │
│   │ │ Live performances, DJ sets, festival        │    │
│   │ │ slots. Include date, venue, location, fee   │    │
│   │ │ range.                                      │    │
│   │ │                                             │    │
│   │ │ <BtnPrimary> Booking inquiry                │    │
│   │ └─────────────────────────────────────────────┘    │
│   │                                                    │
│   │ ┌─────────────────────────────────────────────┐    │
│   │ │ PRESS / LICENSING                           │    │
│   │ │ Music licensing, interviews, press          │    │
│   │ │ releases, sync placements.                  │    │
│   │ │                                             │    │
│   │ │ <BtnPrimary> Press contact                  │    │
│   │ └─────────────────────────────────────────────┘    │
│   │                                                    │
│   │ ┌─────────────────────────────────────────────┐    │
│   │ │ GENERAL                                     │    │
│   │ │ Anything else — partnerships,                │    │
│   │ │ collaborations, friendly hellos.            │    │
│   │ │                                             │    │
│   │ │ <BtnPrimary> Say hello                      │    │
│   │ └─────────────────────────────────────────────┘    │
│   └────────────────────────────────────────────────────┘
│   - Each card: bg-white/5 border border-white/10 rounded-md p-5
│     hover:bg-white/10 transition-colors duration-300
│   - Card heading: font-mono text-xs uppercase tracking-widest text-white/60 mb-2
│   - Card body: text-sm text-white/70 mb-4
│   - CTA: <BtnPrimary> with mailto link, pre-filled subject and body
│
├── SOCIAL ROW  (centered)
│   ┌────────────────────────────────────────────────────┐
│   │ Or find us on:                                     │
│   │                                                    │
│   │ [bandcamp] [soundcloud] [instagram] [facebook]     │
│   │ [discogs] [youtube] [tiktok] [...]                 │
│   │                                                    │
│   │ - reuse Footer's social icon row (24px size,       │
│   │   same icons sourced from app/constants/soclinks)  │
│   │ - flex justify-center gap-4 my-12                  │
│   └────────────────────────────────────────────────────┘
│
├── ADDRESS  (only when label has a public mailing address)
│   ┌────────────────────────────────────────────────────┐
│   │ Mailing address                  [h3]              │
│   │ Sentimony Records                                  │
│   │ Kyiv, Ukraine                                      │
│   │                                                    │
│   │ - text-white/60 text-sm                            │
│   │ - hidden when no public address; do not place      │
│   │   personal address here                            │
│   └────────────────────────────────────────────────────┘
│
└── BOILERPLATE  (small print, optional)
    ┌────────────────────────────────────────────────────┐
    │ Reply times vary; we read everything but only      │
    │ reply to messages that fit the label's focus.      │
    │                                                    │
    │ - text-xs text-white/40 mt-12                      │
    └────────────────────────────────────────────────────┘
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container | `container max-w-3xl` (was default — now article-shape) | page wrapper |
| Intro copy | `text-white/70 text-sm md:text-base mb-8` | orientation paragraph |
| Inquiry grid | `grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12` | 4-card layout |
| Inquiry card | `bg-white/5 border border-white/10 rounded-md p-5 hover:bg-white/10 transition-colors duration-300` | each card |
| Inquiry card heading | `font-mono text-xs uppercase tracking-widest text-white/60 mb-2` | card label |
| Inquiry card body | `text-sm text-white/70 mb-4` | card description |
| Inquiry CTA | reuse `<BtnPrimary>` | mailto trigger |
| Social row container | `flex justify-center gap-4 my-12` | socials |
| Social row caption | `text-xs text-white/50 text-center mb-2` | "Or find us on:" |
| Address h3 | `text-xs uppercase tracking-widest text-white/50 mt-12 mb-2` | mailing label |
| Address body | `text-white/60 text-sm` | address lines |
| Boilerplate | `text-xs text-white/40 mt-12` | small print |

## Components

**Reuse:**
- `<BtnPrimary>` for inquiry CTAs
- Footer's social icon row pattern (sourced from `app/constants/soclinks.ts`)
- `<PageTitle>` once shipped (#13)
- `<Icon>` Heroicons (e.g. `heroicons:envelope`)

**Do not introduce:**
- ❌ A web contact form. Requires backend handling, spam protection, GDPR considerations. Mailto is the correct affordance for v1.
- ❌ A live chat widget. Same scope reasons + privacy.
- ❌ A captcha. Mailto avoids it.
- ❌ A "FAQ" block. Different page; could become `/faq` if questions accumulate.

## Data

**Schema additions (config-level, no DB changes):**

Add a new constants file:

```ts
// app/constants/contacts.ts
export const CONTACTS = {
  demo: {
    label: 'Demos',
    description: 'Send your music for label consideration. Include 1–2 unmastered tracks, links to existing releases, a short bio.',
    email: 'demo@sentimony.com',  // or label's general inbox if no separate alias
    subject: 'Demo: <your name>',
  },
  booking: {
    label: 'Bookings',
    description: 'Live performances, DJ sets, festival slots. Include date, venue, location, fee range.',
    email: 'booking@sentimony.com',  // or general
    subject: 'Booking inquiry: <event>',
  },
  press: {
    label: 'Press / Licensing',
    description: 'Music licensing, interviews, press releases, sync placements.',
    email: 'press@sentimony.com',  // or general
    subject: 'Press inquiry: <topic>',
  },
  general: {
    label: 'General',
    description: 'Anything else — partnerships, collaborations, friendly hellos.',
    email: 'sentimony@gmail.com',  // existing email
    subject: 'Hello, Sentimony Records',
  },
} as const

// Helper to build mailto URL
export function buildMailto(c: typeof CONTACTS[keyof typeof CONTACTS]): string {
  const params = new URLSearchParams({ subject: c.subject })
  return `mailto:${c.email}?${params.toString()}`
}
```

**v1 simplification:** if separate email aliases (demo@, booking@, press@) don't exist yet, all CTAs point to the existing `sentimony@gmail.com` with **different subject lines**. The differentiated subject is what helps the recipient route — the alias is optional polish.

## Interactions specific to this page

- **Inquiry CTAs:** `<BtnPrimary>` with `to="mailto:..."` triggers the user's mail client. `BtnPrimary` already detects mailto schema (`isExternal` regex includes `mailto:`) and renders `<a>` with `target="_blank" rel="noopener"`. Keep `target="_blank"` for mailto since some users have webmail tabs.
- **Social row:** identical behaviour to footer socials. External links in new tabs.
- **Address:** plain text, no interaction. Optional `<a href="https://maps.google.com/?q=...">` if a city-level link is desired (not for personal addresses).
- **Boilerplate:** non-interactive disclaimer.
- **No form submission, no captcha, no AJAX.**

## Accessibility specific to this page

- Heading hierarchy: `<h1>Contacts</h1>` → 4× `<h2>` (one per inquiry card heading) → optional `<h3>Mailing address</h3>`. Linear, no skips.
- Card heading is real `<h2>` despite small visual weight — semantic correctness over font-size mapping.
- Inquiry cards are NOT single click-targets (the card has descriptive copy + a CTA button; making the whole card clickable creates ambiguity with text-selection). Only the CTA inside is the action.
- Social icons each carry `aria-label` (consistent with footer pattern).
- Mailto links open the system mail composer; this is well-known UX. No additional ARIA needed.

## Anti-patterns specific to this page

- ❌ **Do not use a single generic mailto link as the only contact path.** Inquiry differentiation IS the value of this page over a footer link.
- ❌ **Do not introduce a web form** without backend / spam / GDPR plumbing. Mailto is correct for v1.
- ❌ **Do not show personal addresses** (Ihor's home / private studio). Either a public mailing address or none at all.
- ❌ **Do not add a captcha to mailto links.** Captcha applies to forms; mailto inherits the user's mail client.
- ❌ **Do not use `<Item>` for inquiry cards.** They are content frames, not portfolio cards; structure is fundamentally different.
- ❌ **Do not promise a reply SLA** ("we reply in 24 hours") — labels are small teams; under-promise.
- ❌ **Do not show all socials twice** (footer + here). Reuse the footer pattern but keep the row visually distinct from the footer (different gap, caption above).
- ❌ **Do not embed a Google Maps iframe** for the address. External `<a>` only (consistent with event-detail map link policy).
- ❌ **Do not autoselect / autofocus the demo CTA.** All four are equally valid entry points.

## Pre-delivery checklist (page-specific, in addition to MASTER)

- [ ] Container `max-w-3xl` (article-shape, narrower than catalog pages)
- [ ] Intro copy renders (one orientation paragraph)
- [ ] 4 inquiry cards: Demos / Bookings / Press / General
- [ ] Each card has uppercase mono heading + body description + BtnPrimary CTA
- [ ] CTAs use mailto with pre-filled subject (alias OR shared inbox per CONTACTS const)
- [ ] Cards layout: 1-column mobile, 2-column sm+
- [ ] Social row reuses footer icon set (no divergence)
- [ ] Mailing address rendered only when public address exists; else hidden
- [ ] Boilerplate small-print at the bottom
- [ ] Heading hierarchy: h1 → 4× h2 → (optional h3 address)
- [ ] All `v-wave` on CTAs
- [ ] All `:focus-visible` rings present
- [ ] Verified at 375 / 768 / 1024 / 1440

## SEO upgrade (out of design-system scope, recommended)

```ts
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Sentimony Records',
      url: 'https://sentimony.com',
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'A&R / Demos',  email: 'demo@sentimony.com' },
        { '@type': 'ContactPoint', contactType: 'Bookings',     email: 'booking@sentimony.com' },
        { '@type': 'ContactPoint', contactType: 'Press',        email: 'press@sentimony.com' },
        { '@type': 'ContactPoint', contactType: 'General',      email: 'sentimony@gmail.com' },
      ].filter(c => c.email),
    }),
  }],
})
```

## Out of scope (deferred / open questions)

- **Web contact form** — backend + anti-spam + GDPR; defer.
- **Live chat / Calendly / scheduling** — not how labels operate at this scale.
- **Multi-language inquiry routing** — i18n out of scope until label commits.
- **Address with map embed** — anti-pattern (same as events-detail).
- **Phone number** — labels rarely operate by phone; skip unless explicitly required.

## Cross-references

- Refactor backlog #2: `useDefaultSeo`. Use here once shipped.
- Refactor backlog #13: `<PageTitle>`. Use here.
- `app/constants/soclinks.ts`: source of truth for social icon row.
- Footer component: existing visual pattern for social icons; reuse styling.
- `pages/event-detail.md`: same anti-pattern policy on map embeds.
