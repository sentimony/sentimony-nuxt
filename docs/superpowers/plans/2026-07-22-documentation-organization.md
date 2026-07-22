# Audit and Roadmap Documentation Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the root audit and roadmap into indexed documentation archives, split every active or future initiative into a focused roadmap file, and record an evidence-backed audit of existing specs and plans.

**Architecture:** `docs/audits/` becomes a dated historical archive, while `docs/roadmap/` becomes a living index plus one stable file per active or future initiative. Existing specs and plans remain in place and are linked rather than duplicated; a dedicated documentation-status audit records implementation evidence and gaps from the 2026-07-19 quality audit.

**Tech Stack:** Markdown, Git, `rg`, existing repository documentation conventions.

## Global Constraints

- Do not modify production code, catalog data, migrations, dependencies, or remote services.
- Do not run `sync:*`, deploy commands, browser write scenarios, or any command that writes remote state.
- Preserve the user's current unstaged and staged UI work; every commit must be path-scoped to documentation files from its own task.
- Move root `AUDIT.md` and `ROADMAP.md` completely; do not leave root pointer files.
- Keep `docs/superpowers/specs/` and `docs/superpowers/plans/` at their current paths.
- Treat dated audits as historical snapshots and roadmap files as living documents.
- Do not infer implementation from a spec, a plan, or unchecked plan checkboxes; use current code, tests, configuration, and git history as evidence.
- Roadmap documents stay concise and link to detailed specs/plans instead of copying their implementation steps.
- Documentation is Ukrainian. Git commit messages are English.
- Use `apply_patch` for content edits and `git mv` only for the content-preserving root audit move.
- Run `git diff --check` before every commit.

---

## File Map

### Audit archive

- Create `docs/audits/README.md`: archive rules and chronological index.
- Move `AUDIT.md` to `docs/audits/2026-07-19-quality-audit.md`: unchanged historical audit.
- Create `docs/audits/2026-07-22-documentation-status-audit.md`: implementation matrix, audit coverage, roadmap findings, and current verification caveat.

### Roadmap index and migrated initiatives

- Create `docs/roadmap/README.md`: canonical current index grouped by status and priority.
- Create `docs/roadmap/mobile-performance.md`.
- Create `docs/roadmap/ci-quality-gate.md`.
- Create `docs/roadmap/auth-bundle.md`.
- Create `docs/roadmap/profile-aggregation.md`.
- Create `docs/roadmap/request-logging.md`.
- Create `docs/roadmap/mutation-hardening.md`.
- Create `docs/roadmap/pwa-icons.md`.
- Create `docs/roadmap/design-system.md`.
- Create `docs/roadmap/readme-branding.md`.
- Create `docs/roadmap/play-count-sync.md`.
- Create `docs/roadmap/api-list-envelope.md`.
- Create `docs/roadmap/release-title-split.md`.
- Create `docs/roadmap/site-search.md`.

### Audit remediation initiatives

- Create `docs/roadmap/typescript-hardening.md`.
- Create `docs/roadmap/component-testing-and-coverage.md`.
- Create `docs/roadmap/catalog-visibility-security.md`.
- Create `docs/roadmap/accessibility-structure.md`.
- Create `docs/roadmap/e2e-reliability.md`.

### Future initiatives

- Create `docs/roadmap/cloudflare-domain.md`.
- Create `docs/roadmap/sentry-observability.md`.
- Create `docs/roadmap/custom-ui.md`.
- Create `docs/roadmap/custom-swiper.md`.
- Create `docs/roadmap/audio-waveform.md`.
- Create `docs/roadmap/bandcamp-code-gifts.md`.
- Create `docs/roadmap/completed.md`: concise history of implemented initiatives.

### Cross-references

- Delete `ROADMAP.md` after its active and completed content is represented in `docs/roadmap/`.
- Modify `PRODUCT.md`: replace references to root `ROADMAP.md` with the new roadmap index or a specific initiative.
- Modify historical specs/plans only where an exact path reference to root `ROADMAP.md` would otherwise become broken; do not rewrite their decisions or status.

---

### Task 1: Create the audit archive and preserve the 2026-07-19 audit

**Files:**
- Create: `docs/audits/README.md`
- Move: `AUDIT.md` → `docs/audits/2026-07-19-quality-audit.md`

**Interfaces:**
- Consumes: root `AUDIT.md` as the historical source document.
- Produces: stable audit naming convention and archive index used by Task 2 and roadmap `Related` links.

- [ ] **Step 1: Create the archive directory and move the historical audit**

Run:

```bash
mkdir -p docs/audits
git mv AUDIT.md docs/audits/2026-07-19-quality-audit.md
```

Expected: `AUDIT.md` is absent from the root and the destination file has the same blob content before later link-only maintenance.

- [ ] **Step 2: Create the audit index**

Create `docs/audits/README.md` with this content:

```markdown
# Аудити Sentimony Nuxt

Ця папка зберігає завершені аудити як датовані історичні знімки. Новий аудит
додається окремим файлом `YYYY-MM-DD-<topic>-audit.md`; попередні висновки не
переписуються через подальші зміни коду.

Якщо після завершення аудиту знайдено фактичну помилку, її можна виправити з
явною датованою приміткою. Повторна перевірка стану оформлюється новим аудитом.

## Індекс

- [2026-07-19 — аудит якості](2026-07-19-quality-audit.md): TypeScript,
  browser/web-debug і Vitest.
- [2026-07-22 — статус документації та реалізації](2026-07-22-documentation-status-audit.md):
  спеки, implementation plans, покриття аудиту та актуальність roadmap.
```

- [ ] **Step 3: Verify the move and index**

Run:

```bash
test ! -e AUDIT.md
test -f docs/audits/2026-07-19-quality-audit.md
cmp <(git show HEAD:AUDIT.md) docs/audits/2026-07-19-quality-audit.md
rg -n '^#|2026-07-19|2026-07-22' docs/audits/README.md
git diff --check -- docs/audits AUDIT.md
```

Expected: all commands pass; `cmp` prints nothing; the index contains both audit entries.

- [ ] **Step 4: Commit only the audit archive files**

```bash
git add docs/audits/README.md docs/audits/2026-07-19-quality-audit.md AUDIT.md
git commit --only docs/audits/README.md docs/audits/2026-07-19-quality-audit.md AUDIT.md \
  -m "docs: archive quality audits"
```

Expected: only the audit move and index are committed; the user's staged component rename remains staged.

---

### Task 2: Record the documentation and implementation status audit

**Files:**
- Create: `docs/audits/2026-07-22-documentation-status-audit.md`

**Interfaces:**
- Consumes: all files under `docs/superpowers/specs/`, `docs/superpowers/plans/`, current source/config/tests, git history, and the archived 2026-07-19 audit.
- Produces: the evidence source used to assign roadmap status in Tasks 3–5.

- [ ] **Step 1: Write the audit header and methodology**

Start the file with:

```markdown
# Аудит статусу документації та реалізації Sentimony Nuxt

- Дата: 2026-07-22
- Гілка: `main`
- Обсяг: `docs/superpowers/specs`, `docs/superpowers/plans`,
  `docs/audits/2026-07-19-quality-audit.md`, старий root roadmap і поточний код.

## Методика

Статус визначено за поточними файлами, тестами, конфігурацією та git history.
Порожній checkbox у плані не означає, що крок не виконаний; наявність спеки або
плану не означає, що фіча реалізована.

Статуси:

- **Реалізовано** — основний результат спеки/плану присутній і має перевірний доказ.
- **Частково** — фундамент або частина задач є, але заявлений користувацький чи
  технічний результат не завершений.
- **Не реалізовано** — цільові файли/контракти відсутні або код лишився у стані до плану.
```

- [ ] **Step 2: Add the specification matrix**

Add a table with these exact rows and conclusions:

| Specification | Status | Evidence |
| --- | --- | --- |
| `2026-06-01-theme-toggle-design.md` | Реалізовано | `useTheme.ts`, `ThemeToggle.vue`, pre-paint script and theme tokens exist. |
| `2026-06-06-homepage-light-theme-design.md` | Реалізовано | `HomepageAtmosphere.vue` and four Playwright baselines exist; the spec marks itself implemented. |
| `2026-06-25-project-hardening-design.md` | Частково | Cache policy, sanitizer, private export and test infrastructure exist; aggregated profile loading and complete visibility hardening do not. |
| `2026-06-27-sentimony-ui-refactor-design.md` | Не реалізовано | No `app/components/sr/` or `Sr*` components; current owned-UI work follows another direction. |
| `2026-07-01-sitemap-indexing-design.md` | Реалізовано | Sitemap endpoint, pure builder, route-rule noindex and tests exist. |
| `2026-07-02-catalog-features-design.md` | Реалізовано | Portfolio, organized events, `/artists/all`, category dividers and genre pages exist. |
| `2026-07-02-custom-audio-player-design.md` | Частково | Player component and page wiring exist, but Hagen has no mix fields in the canonical export, so the feature is not active. |
| `2026-07-07-global-audio-player-design.md` | Реалізовано з еволюцією | Global composable and bridge exist; persistent controls evolved from a header row into `AudioBottomPlayer`. |
| `2026-07-13-lighthouse-lcp-design.md` | Реалізовано | Flag CSS is route-scoped and forest/testimonial images use optimized delivery; implementation commits exist. |
| `2026-07-16-lazy-media-tabs-design.md` | Реалізовано | Tab slots are activation-gated and inline players omit the scoped controls. |
| `2026-07-18-export-sync-roadmap-2-4-7-design.md` | Реалізовано | Array-aware sync, `track_artists`, `like_counters`, count endpoints and fallbacks exist. |
| `2026-07-19-api-list-envelope-design.md` | Не реалізовано | No `buildListEnvelope`; list endpoints still expose the existing response shapes. |
| `2026-07-19-auth-bundle-design.md` | Не реалізовано | Planned lazy auth/header/toaster boundaries are absent. |
| `2026-07-19-brand-assets-design.md` | Не реалізовано | No master icon generator or expanded PWA verification flow. |
| `2026-07-19-ci-quality-gate-design.md` | Не реалізовано | Existing workflow has no Playwright job or Netlify-preset build gate. |
| `2026-07-19-design-system-validity-design.md` | Не реалізовано | Token migration and `designTokens.test.ts` are absent. |
| `2026-07-19-mobile-performance-design.md` | Не реалізовано | No lazy hydration or capped initial Swiper DOM; no ≥80 result is recorded. |
| `2026-07-19-profile-aggregation-design.md` | Не реалізовано | No `/api/profile/overview` or `useProfileOverview`. |
| `2026-07-19-release-artist-title-split-design.md` | Не реалізовано | No `releaseTitle.ts` or split-title rendering contract. |
| `2026-07-19-server-hardening-design.md` | Не реалізовано | No shared slug validation, rate limiter or request-log redaction implementation. |
| `2026-07-21-release-tracklist-perf-design.md` | Реалізовано | The spec records before/after measurements; blocking requests and duplicate play-count fetch were removed. |
| `2026-07-21-site-search-design.md` | Не реалізовано | Search endpoint, composable and dialog are absent. |

Conclude the section with: `Підсумок: 9 реалізовано, 2 частково, 11 не реалізовано.`

- [ ] **Step 3: Add the implementation-plan matrix**

Use these exact status groups, with one evidence sentence per item:

```markdown
## Статус implementation plans

### Реалізовано — 9

1. `2026-06-06-homepage-light-theme.md`.
2. `2026-07-02-catalog-features.md`.
3. `2026-07-02-review-fixes.md`.
4. `2026-07-06-tracks-first-class-migration.md`.
5. `2026-07-07-global-audio-player.md` — із подальшою заміною header mini-player на bottom player.
6. `2026-07-13-lighthouse-lcp.md`.
7. `2026-07-16-lazy-media-tabs.md`.
8. `2026-07-18-export-sync-roadmap-2-4-7.md`.
9. `2026-07-21-release-tracklist-perf.md`.

### Частково — 2

1. `2026-06-25-project-hardening.md` — profile aggregation і частина security/test-depth лишилися відкритими.
2. `2026-07-02-custom-audio-player.md` — Task 1–3 присутні, але Hagen data/infrastructure activation не завершена.

### Не реалізовано — 11

1. `2026-06-27-sentimony-ui-refactor.md`.
2. `2026-07-19-api-list-envelope.md`.
3. `2026-07-19-auth-bundle.md`.
4. `2026-07-19-brand-assets.md`.
5. `2026-07-19-ci-quality-gate.md`.
6. `2026-07-19-design-system-validity.md`.
7. `2026-07-19-mobile-performance.md`.
8. `2026-07-19-profile-aggregation.md`.
9. `2026-07-19-release-artist-title-split.md`.
10. `2026-07-19-server-hardening.md`.
11. `2026-07-21-site-search.md`.

Усі plan checkboxes лишилися порожніми, тому використовувати їх як status tracker не можна.
```

- [ ] **Step 4: Add the 2026-07-19 audit coverage table**

Record every finding with these outcomes:

| Finding | Covered by spec/plan | Current state |
| --- | --- | --- |
| TS-1 / VITEST-3 test typecheck | Ні | No `tsconfig.tests.json` or `typecheck:tests`. |
| TS-2 Nuxt strictness | Ні | Base flags are not wired into Nuxt-generated configs. |
| TS-3 unused declarations | Ні | No cleanup/enforced unused checks plan. |
| TS-4 non-null assertions | Ні | No dedicated remediation. |
| TS-5 lint guardrails | Ні | No ESLint/type-safety plan. |
| WEB-1 / VITEST-1 hidden artist | Лише старий загальний hardening plan | Still unfixed; handler returns hidden records and the unit test protects that behavior. |
| WEB-2 footer SVG | Ні | Fixed incidentally in current code; no dedicated plan. |
| WEB-3 browser E2E CI | Так | CI quality-gate spec/plan exists but is not implemented. |
| WEB-4 `<main>` and homepage `<h1>` | Ні | Still open. |
| WEB-5 first-paint race | Ні | Still open. |
| WEB-6 route-smoke gaps | Ні | Still open. |
| VITEST-2 component behavior | Ні | Source-string tests remain the dominant component contract. |
| VITEST-4 coverage | Ні | No provider, report or threshold. |
| VITEST-5 manual globals | Ні | Newer plans continue the same `globalThis` mock pattern. |
| VITEST-6 reset policy | Ні | No central policy or documented explicit-cleanup convention. |

Conclude: only WEB-3 is directly covered by a new dedicated spec/plan, and it remains unimplemented.

- [ ] **Step 5: Add roadmap and verification findings**

Include these exact points:

- The old roadmap date and 39/161 baseline are stale.
- Its claim that `typecheck` and CI do not exist is false; its concern about missing required Playwright/Netlify gates is still valid.
- Its claim that all detail APIs hide non-public entities is false for the artist endpoint.
- Lazy third-party media tabs are implemented and belong in completed work.
- Site search, API envelope, release-title split and most audit remediations are missing from the old roadmap.
- A local run on 2026-07-22 produced 40 test files / 168 tests, with 4 failures in `likeButtons.test.ts` because current uncommitted UI refactoring moved the icon contract into `LikeButton`; this is a worktree snapshot, not a clean committed baseline.

- [ ] **Step 6: Verify completeness and commit**

Run:

```bash
rg -n '^\| `2026-.*design\.md`' docs/audits/2026-07-22-documentation-status-audit.md
rg -n '^\d+\. `2026-.*\.md`' docs/audits/2026-07-22-documentation-status-audit.md
rg -n 'TS-1|TS-2|TS-3|TS-4|TS-5|WEB-1|WEB-2|WEB-3|WEB-4|WEB-5|WEB-6|VITEST-1|VITEST-2|VITEST-3|VITEST-4|VITEST-5|VITEST-6' docs/audits/2026-07-22-documentation-status-audit.md
git diff --check -- docs/audits/2026-07-22-documentation-status-audit.md
```

Expected: 22 spec rows, 22 plan list items across status groups, every audit identifier present, no whitespace errors.

Commit:

```bash
git add docs/audits/2026-07-22-documentation-status-audit.md
git commit --only docs/audits/2026-07-22-documentation-status-audit.md \
  -m "docs: audit specification and plan status"
```

---

### Task 3: Split the current active roadmap into initiative files

**Files:**
- Create: `docs/roadmap/mobile-performance.md`
- Create: `docs/roadmap/ci-quality-gate.md`
- Create: `docs/roadmap/auth-bundle.md`
- Create: `docs/roadmap/profile-aggregation.md`
- Create: `docs/roadmap/request-logging.md`
- Create: `docs/roadmap/mutation-hardening.md`
- Create: `docs/roadmap/pwa-icons.md`
- Create: `docs/roadmap/design-system.md`
- Create: `docs/roadmap/readme-branding.md`
- Create: `docs/roadmap/play-count-sync.md`
- Create: `docs/roadmap/api-list-envelope.md`
- Create: `docs/roadmap/release-title-split.md`
- Create: `docs/roadmap/site-search.md`

**Interfaces:**
- Consumes: active items in root `ROADMAP.md`, existing specs/plans, and Task 2 status conclusions.
- Produces: concise living initiative files linked by the canonical index in Task 6.

- [ ] **Step 1: Create the roadmap directory and use the shared document contract**

Every file in this task must use this exact section order:

```markdown
# <Title>

- Status: Planned
- Priority: <P0-P3>
- Last reviewed: 2026-07-22
- Related: <relative links>

## Навіщо

<Current verified problem.>

## Очікуваний результат

<One outcome paragraph.>

## Обсяг

- <Bounded deliverable.>

## Залежності

- <Dependency or `Немає.`>

## Критерії завершення

- <Observable acceptance criterion.>

## Наступний крок

<The next design, implementation or measurement action.>
```

Use relative links from `docs/roadmap/`, for example
`../superpowers/specs/2026-07-19-mobile-performance-design.md`.

- [ ] **Step 2: Create P0 and P1 initiative files**

Use the following exact metadata and content requirements:

| File | Title | Priority | Related | Required outcome and completion criteria |
| --- | --- | --- | --- | --- |
| `mobile-performance.md` | Mobile performance | P0 | Mobile performance spec + plan | Reach warmed-stage Lighthouse mobile Performance ≥80, TBT <300 ms and tap targets 100%; measure before/after lazy hydration, Swiper DOM cap and listener changes. |
| `ci-quality-gate.md` | CI quality gate | P0 | CI spec + plan + quality audit | Add Netlify-preset build and functional Playwright job, document `sync:*` prohibition, and require checks in branch protection; both CI jobs must be green. |
| `auth-bundle.md` | Auth and Supabase client bundle | P1 | Auth bundle spec + plan | Measure and reduce public-route initial JS without breaking session/auth/likes; record before/after chunks and auth-flow verification. |
| `api-list-envelope.md` | API list envelope | P1 | API envelope spec + plan | Migrate list endpoints to `{ info, results }`, update `toArray` and direct consumers, and verify both catalog backends. |

- [ ] **Step 3: Create P2 initiative files**

| File | Title | Priority | Related | Required outcome and completion criteria |
| --- | --- | --- | --- | --- |
| `profile-aggregation.md` | Profile aggregation | P2 | Profile aggregation spec + plan | One private overview request returns counts plus initial collection data without changing pagination/no-store behavior. |
| `request-logging.md` | Production request logging | P2 | Server hardening spec + plan | Redact query/referrer/IP-sensitive values and disable or sample verbose production logs; tests prove secrets and raw query values are absent. |
| `mutation-hardening.md` | Mutation validation and rate limiting | P2 | Server hardening spec + plan | Shared slug validation, public-entity existence checks and rate limits protect likes/plays while keeping happy-path response contracts. |

- [ ] **Step 4: Create P3 initiative files**

| File | Title | Priority | Related | Required outcome and completion criteria |
| --- | --- | --- | --- | --- |
| `pwa-icons.md` | PWA icons | P3 | Brand assets spec + plan | Generate master-derived regular/maskable icons, extend `verify:pwa`, and manually verify macOS/Android installation. |
| `design-system.md` | Design system | P3 | Design-system validity spec + plan | Define token conventions, migrate hardcoded light/dark pairs, add regression inventory, preserve Accessibility 100. |
| `readme-branding.md` | README branding | P3 | Brand assets spec + plan | Add restrained AgileCharts-inspired badges/icons without duplicating operational docs. |
| `play-count-sync.md` | Optimistic play-count synchronization | P3 | Release performance spec | Share optimistic count state between player and tracklist with `Math.max` merge semantics and no reload requirement. |
| `release-title-split.md` | Release artist/title split | P3 | Release-title spec + plan | Render artist and release title separately in cards/detail while retaining canonical title for SEO and fallback strings. |
| `site-search.md` | Site search | P3 | Site search spec + plan | Add cached cross-entity search index and accessible ⌘K dialog with local diacritics-normalized filtering. |

- [ ] **Step 5: Verify all migrated initiative files**

Run:

```bash
for f in docs/roadmap/{mobile-performance,ci-quality-gate,auth-bundle,profile-aggregation,request-logging,mutation-hardening,pwa-icons,design-system,readme-branding,play-count-sync,api-list-envelope,release-title-split,site-search}.md; do
  test -f "$f"
  rg -q '^- Status: Planned$' "$f"
  rg -q '^- Priority: P[0-3]$' "$f"
  rg -q '^## Критерії завершення$' "$f"
  rg -q '^## Наступний крок$' "$f"
done
git diff --check -- docs/roadmap
```

Expected: every command succeeds and every initiative follows the shared contract.

- [ ] **Step 6: Commit the migrated active roadmap files**

```bash
git add docs/roadmap/mobile-performance.md docs/roadmap/ci-quality-gate.md \
  docs/roadmap/auth-bundle.md docs/roadmap/profile-aggregation.md \
  docs/roadmap/request-logging.md docs/roadmap/mutation-hardening.md \
  docs/roadmap/pwa-icons.md docs/roadmap/design-system.md \
  docs/roadmap/readme-branding.md docs/roadmap/play-count-sync.md \
  docs/roadmap/api-list-envelope.md docs/roadmap/release-title-split.md \
  docs/roadmap/site-search.md
git commit --only docs/roadmap/mobile-performance.md docs/roadmap/ci-quality-gate.md \
  docs/roadmap/auth-bundle.md docs/roadmap/profile-aggregation.md \
  docs/roadmap/request-logging.md docs/roadmap/mutation-hardening.md \
  docs/roadmap/pwa-icons.md docs/roadmap/design-system.md \
  docs/roadmap/readme-branding.md docs/roadmap/play-count-sync.md \
  docs/roadmap/api-list-envelope.md docs/roadmap/release-title-split.md \
  docs/roadmap/site-search.md -m "docs: split active roadmap initiatives"
```

---

### Task 4: Add roadmap initiatives for uncovered audit findings

**Files:**
- Create: `docs/roadmap/typescript-hardening.md`
- Create: `docs/roadmap/component-testing-and-coverage.md`
- Create: `docs/roadmap/catalog-visibility-security.md`
- Create: `docs/roadmap/accessibility-structure.md`
- Create: `docs/roadmap/e2e-reliability.md`

**Interfaces:**
- Consumes: finding IDs and current-state evidence from Task 2.
- Produces: one accountable roadmap home for every unresolved audit cluster.

- [ ] **Step 1: Create the five audit-remediation files using the shared contract**

Use `Status: Planned`, `Last reviewed: 2026-07-22`, a `Related` link to
`../audits/2026-07-19-quality-audit.md`, and these exact boundaries:

| File | Priority | Findings | Scope and completion criteria |
| --- | --- | --- | --- |
| `catalog-visibility-security.md` | P0 | WEB-1, VITEST-1 | Apply one public-entity guard to artist detail for Firebase/Supabase; replace the hidden-success unit contract with dual-backend 404 tests; security E2E passes in both catalog modes. |
| `typescript-hardening.md` | P1 | TS-1–TS-5, VITEST-3 | Add test typecheck, wire green Nuxt strictness flags, clean unused declarations, stage exact-optional migration, reduce assertions and add lint guardrails. Each compiler/lint command is green in CI. |
| `component-testing-and-coverage.md` | P1 | VITEST-2, VITEST-4–VITEST-6 | Add a Nuxt/Vue component-test project, coverage baseline, risk-based branch thresholds and a documented mock cleanup policy; migrate likes/audio/auth/tabs away from source-string-only assertions. |
| `e2e-reliability.md` | P1 | WEB-3, WEB-5, WEB-6 | Stabilize first-paint timing, cover track/auth routes and run functional browser tests in CI for both catalog modes; repeated CI runs are stable. |
| `accessibility-structure.md` | P2 | WEB-4 | Add a public `<main>` landmark and one meaningful homepage `<h1>` without visual regressions; browser assertions and Accessibility 100 pass. |

- [ ] **Step 2: Verify every audit identifier is assigned**

Run:

```bash
rg -n 'TS-1|TS-2|TS-3|TS-4|TS-5|WEB-1|WEB-3|WEB-4|WEB-5|WEB-6|VITEST-1|VITEST-2|VITEST-3|VITEST-4|VITEST-5|VITEST-6' docs/roadmap/{typescript-hardening,component-testing-and-coverage,catalog-visibility-security,accessibility-structure,e2e-reliability}.md
git diff --check -- docs/roadmap
```

Expected: every unresolved identifier is present. WEB-2 is intentionally absent because the footer asset is already fixed and will be recorded in `completed.md`.

- [ ] **Step 3: Commit the audit remediation roadmap files**

```bash
git add docs/roadmap/typescript-hardening.md \
  docs/roadmap/component-testing-and-coverage.md \
  docs/roadmap/catalog-visibility-security.md \
  docs/roadmap/accessibility-structure.md docs/roadmap/e2e-reliability.md
git commit --only docs/roadmap/typescript-hardening.md \
  docs/roadmap/component-testing-and-coverage.md \
  docs/roadmap/catalog-visibility-security.md \
  docs/roadmap/accessibility-structure.md docs/roadmap/e2e-reliability.md \
  -m "docs: add quality audit roadmap initiatives"
```

---

### Task 5: Add the future feature backlog

**Files:**
- Create: `docs/roadmap/cloudflare-domain.md`
- Create: `docs/roadmap/sentry-observability.md`
- Create: `docs/roadmap/custom-ui.md`
- Create: `docs/roadmap/custom-swiper.md`
- Create: `docs/roadmap/audio-waveform.md`
- Create: `docs/roadmap/bandcamp-code-gifts.md`

**Interfaces:**
- Consumes: approved design decisions from the documentation organization spec.
- Produces: bounded discovery documents that can later enter the spec → plan → implementation workflow independently.

- [ ] **Step 1: Create the six future files using the roadmap contract**

Use `Status: Idea`, `Priority: Future`, `Last reviewed: 2026-07-22`, and these
exact scopes:

| File | Title | Scope | Dependencies and completion criteria |
| --- | --- | --- | --- |
| `cloudflare-domain.md` | Cloudflare domain and platform migration | Phase 1 evaluates registrar/DNS/proxy/CDN with Netlify runtime unchanged; Phase 2 separately evaluates Pages/Workers runtime migration, Nitro support, image pipeline, redirects, edge functions, preview deploys and rollback. | Inventory current DNS/Netlify dependencies first. Discovery is complete when a phased decision record, rollback plan and zero-downtime checklist exist. |
| `sentry-observability.md` | Sentry observability | Client/server exceptions, source maps, releases, stage/prod environments, privacy scrubbing, sampling, alerts and ownership. | Depends on privacy/secrets decisions and deployment integration. Complete when a test error resolves to readable source in both environments without leaking user data. |
| `custom-ui.md` | Sentimony-owned UI | Build owned presentation components incrementally while retaining accessible Reka primitives where valuable; start from buttons, likes, media, status and links, not a wholesale rewrite. | Depends on design-system contracts. Complete when agreed high-reuse surfaces use documented owned components and obsolete wrappers are removed. |
| `custom-swiper.md` | Custom catalog swiper | Inventory navigation, touch, free mode, breakpoints, section dividers, keyboard/a11y, lazy rendering and SSR needs; compare a small native scroll-snap prototype with Swiper. | Depends on mobile-performance measurements. Complete when a benchmark-backed keep/replace decision exists; replacement itself requires a later spec. |
| `audio-waveform.md` | Audio waveform visualization | Compare precomputed peak data with runtime Web Audio analysis; cover R2/CORS, SSR, mobile cost, responsive rendering, seeking and keyboard/screen-reader access. | Depends on stable global player state. Complete when one approach meets performance/accessibility budgets on track and release pages. |
| `bandcamp-code-gifts.md` | Bandcamp-code gifts | Define eligibility, secure code import/storage, one-time idempotent claim, audit trail, exhaustion behavior, user disclosure and admin operations. | Depends on auth/profile and mutation hardening. Complete when concurrent claims cannot duplicate a code and raw unused codes never reach public/client responses. |

- [ ] **Step 2: Add explicit next steps**

Use these final `## Наступний крок` paragraphs:

- Cloudflare: inventory current DNS records, Netlify context behavior, edge functions, image provider and rollback requirements.
- Sentry: write a privacy/data-flow design before installing an SDK.
- Custom UI: finish the design-system inventory and choose the first bounded component cluster.
- Custom Swiper: capture current feature use and mobile performance baseline before prototyping.
- Waveform: audit audio asset CORS/range behavior and decide whether peak data can be generated during catalog sync.
- Bandcamp: document eligibility and operational ownership of code imports before schema design.

- [ ] **Step 3: Verify the future backlog and commit**

Run:

```bash
for f in docs/roadmap/{cloudflare-domain,sentry-observability,custom-ui,custom-swiper,audio-waveform,bandcamp-code-gifts}.md; do
  test -f "$f"
  rg -q '^- Status: Idea$' "$f"
  rg -q '^- Priority: Future$' "$f"
  rg -q '^## Наступний крок$' "$f"
done
git diff --check -- docs/roadmap
```

Commit:

```bash
git add docs/roadmap/cloudflare-domain.md docs/roadmap/sentry-observability.md \
  docs/roadmap/custom-ui.md docs/roadmap/custom-swiper.md \
  docs/roadmap/audio-waveform.md docs/roadmap/bandcamp-code-gifts.md
git commit --only docs/roadmap/cloudflare-domain.md docs/roadmap/sentry-observability.md \
  docs/roadmap/custom-ui.md docs/roadmap/custom-swiper.md \
  docs/roadmap/audio-waveform.md docs/roadmap/bandcamp-code-gifts.md \
  -m "docs: add future product initiatives"
```

---

### Task 6: Build the canonical roadmap index, preserve completed history, and remove the root roadmap

**Files:**
- Create: `docs/roadmap/README.md`
- Create: `docs/roadmap/completed.md`
- Delete: `ROADMAP.md`
- Modify: `PRODUCT.md`
- Modify: exact stale root-path references in `docs/superpowers/specs/*.md` and `docs/superpowers/plans/*.md`
- Modify: `docs/audits/2026-07-19-quality-audit.md` only if needed to turn a broken root-path reference into a valid relative link without changing its conclusion.

**Interfaces:**
- Consumes: every roadmap file created in Tasks 3–5 and the completed list from root `ROADMAP.md`.
- Produces: the only current roadmap entry point and zero broken root-document references.

- [ ] **Step 1: Create `completed.md`**

Use this structure:

```markdown
# Завершені ініціативи

- Status: Implemented
- Last reviewed: 2026-07-22

Це стислий історичний індекс. Детальні рішення та кроки залишаються у
відповідних спеках і планах.

## Документовані реалізації

- Theme toggle і homepage light theme.
- Sitemap та indexing policy.
- Catalog features: portfolio, organized events, `/artists/all`, category dividers і genre pages.
- Review fixes від 2026-07-02.
- First-class tracks migration.
- Global audio player; persistent UI згодом еволюціонував у bottom player.
- Lighthouse LCP optimization.
- Lazy media tabs та спрощені inline players.
- Array export sync, `track_artists` і `like_counters`.
- Release tracklist performance optimization.

## Закрито з попередніх аудитів

<Move every bullet from the old root `## Закрито з попередніх аудитів` section,
preserving facts but converting relevant spec/plan names to relative links.>

## Уточнення

- Footer SVG із WEB-2 виправлений у поточному коді без окремої implementation spec.
- Custom audio player foundation exists, but Hagen mix activation remains incomplete
  because the canonical export has no mix fields; it is not counted as a completed feature.
```

- [ ] **Step 2: Create the canonical roadmap index**

Create `docs/roadmap/README.md` with:

```markdown
# Sentimony Nuxt Roadmap

- Last reviewed: 2026-07-22

Кожна активна або майбутня ініціатива має окремий файл. Цей індекс є єдиною
актуальною точкою входу; детальний дизайн і implementation steps зберігаються у
`docs/superpowers/specs` та `docs/superpowers/plans`.

Статуси: `Planned` — є визначений результат або готові spec/plan; `Idea` — потрібен
окремий discovery/design; `Implemented` — результат перевірено в коді.

## P0

- [Catalog visibility security](catalog-visibility-security.md) — закрити hidden artist exposure для обох catalog backends.
- [Mobile performance](mobile-performance.md) — досягти Lighthouse mobile Performance ≥80.
- [CI quality gate](ci-quality-gate.md) — додати Playwright і Netlify-preset required checks.

## P1

- [TypeScript hardening](typescript-hardening.md) — test typecheck, Nuxt strictness і lint guardrails.
- [Component testing and coverage](component-testing-and-coverage.md) — поведінкові component tests та risk-based coverage.
- [E2E reliability](e2e-reliability.md) — стабільний first-paint test і ширше browser coverage.
- [Auth bundle](auth-bundle.md) — зменшити public-route auth/Supabase JS.
- [API list envelope](api-list-envelope.md) — уніфікувати list responses як `{ info, results }`.

## P2

- [Profile aggregation](profile-aggregation.md) — один overview request із початковими колекціями.
- [Production request logging](request-logging.md) — sampling і privacy redaction.
- [Mutation hardening](mutation-hardening.md) — validation, existence checks і rate limiting.
- [Accessibility structure](accessibility-structure.md) — `<main>` і homepage `<h1>`.

## P3

- [PWA icons](pwa-icons.md).
- [Design system](design-system.md).
- [README branding](readme-branding.md).
- [Play-count synchronization](play-count-sync.md).
- [Release artist/title split](release-title-split.md).
- [Site search](site-search.md).

## Future ideas

- [Cloudflare domain and platform migration](cloudflare-domain.md).
- [Sentry observability](sentry-observability.md).
- [Sentimony-owned UI](custom-ui.md).
- [Custom catalog swiper](custom-swiper.md).
- [Audio waveform visualization](audio-waveform.md).
- [Bandcamp-code gifts](bandcamp-code-gifts.md).

## Completed

- [Завершені ініціативи](completed.md).

## Аудити

- [Індекс аудитів](../audits/README.md).
- [Статус спеки/плани та реалізації](../audits/2026-07-22-documentation-status-audit.md).
```

- [ ] **Step 3: Remove the old root roadmap after content parity check**

Before deletion, compare every old heading with its destination:

```bash
rg -n '^###|^## Закрито' ROADMAP.md
```

Expected mapping:

- #1 → `mobile-performance.md`
- #3 → `ci-quality-gate.md`
- #5 → `completed.md`
- #6 → `auth-bundle.md`
- #8 → `profile-aggregation.md`
- #9 → `request-logging.md`
- #10 → `mutation-hardening.md`
- #11 → `pwa-icons.md`
- #12 → `design-system.md`
- #13 → `readme-branding.md`
- #14 → `play-count-sync.md`
- closed section → `completed.md`

Delete `ROADMAP.md` with `apply_patch` only after all mappings are present.

- [ ] **Step 4: Update live and historical path references**

In `PRODUCT.md`, replace the generic root reference with:

```markdown
Numbers and current priority/status live in `docs/roadmap/README.md`; each
initiative links to its detailed spec and implementation plan where available.
```

Find other exact root references:

```bash
rg -n '(^|[^/])`?(AUDIT|ROADMAP)\.md`?|\]\((AUDIT|ROADMAP)\.md\)' \
  --glob '*.md' .
```

For every live navigation reference, use a valid relative Markdown link. For
historical prose such as “ROADMAP item 4”, preserve the wording but change an
explicit path from `ROADMAP.md` to `docs/roadmap/README.md`; do not rewrite
the historical decision.

- [ ] **Step 5: Verify index coverage and links**

Run:

```bash
test ! -e ROADMAP.md
for f in docs/roadmap/*.md; do test -s "$f"; done
for f in docs/roadmap/*.md; do
  base=$(basename "$f")
  if [ "$base" != README.md ]; then
    count=$(rg -o "\($base\)" docs/roadmap/README.md | wc -l | tr -d ' ')
    test "$count" = 1
  fi
done
rg -n '(^|[^/])`?(AUDIT|ROADMAP)\.md`?|\]\((AUDIT|ROADMAP)\.md\)' \
  --glob '*.md' . && exit 1 || true
git diff --check -- docs PRODUCT.md ROADMAP.md
```

Expected: root files are absent, every roadmap child is linked exactly once,
no stale root-path reference remains, and whitespace validation passes.

- [ ] **Step 6: Commit only the index, completed history, deletion and link updates**

First inspect the exact changed documentation paths:

```bash
git status --short -- docs PRODUCT.md ROADMAP.md
git diff -- docs PRODUCT.md ROADMAP.md
```

Then stage those exact paths and commit with `--only`; do not use `git add -A`:

```bash
git add docs/roadmap/README.md docs/roadmap/completed.md PRODUCT.md ROADMAP.md
git add docs/superpowers/specs docs/superpowers/plans docs/audits/2026-07-19-quality-audit.md
git commit --only docs/roadmap/README.md docs/roadmap/completed.md PRODUCT.md ROADMAP.md \
  docs/superpowers/specs docs/superpowers/plans \
  docs/audits/2026-07-19-quality-audit.md \
  -m "docs: publish indexed project roadmap"
```

Expected: documentation organization changes are committed; unrelated staged/unstaged UI work remains untouched.

---

### Task 7: Final documentation verification

**Files:**
- Verify: `docs/audits/**/*.md`
- Verify: `docs/roadmap/**/*.md`
- Verify: `docs/superpowers/specs/**/*.md`
- Verify: `docs/superpowers/plans/**/*.md`
- Verify: `PRODUCT.md`

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: evidence that the new documentation structure is complete, navigable and isolated from user code changes.

- [ ] **Step 1: Verify the filesystem contract**

Run:

```bash
test ! -e AUDIT.md
test ! -e ROADMAP.md
test -f docs/audits/README.md
test -f docs/audits/2026-07-19-quality-audit.md
test -f docs/audits/2026-07-22-documentation-status-audit.md
test -f docs/roadmap/README.md
test -f docs/roadmap/completed.md
find docs/audits docs/roadmap -maxdepth 1 -type f -print | sort
```

Expected: two root files are absent, three audit files and 26 roadmap files are present.

- [ ] **Step 2: Validate the documentation-status counts**

Run a small read-only Node script:

```bash
node - <<'NODE'
const fs = require('node:fs')
const audit = fs.readFileSync('docs/audits/2026-07-22-documentation-status-audit.md', 'utf8')
const specRows = [...audit.matchAll(/^\| `2026-.*-design\.md` \|/gm)].length
const implemented = [...audit.matchAll(/^\d+\. `2026-.*\.md`(?: —.*)?\.$/gm)]
if (specRows !== 22) throw new Error(`Expected 22 spec rows, got ${specRows}`)
if (implemented.length !== 22) throw new Error(`Expected 22 plan items, got ${implemented.length}`)
console.log({ specRows, planItems: implemented.length })
NODE
```

Expected: `{ specRows: 22, planItems: 22 }`.

- [ ] **Step 3: Validate relative Markdown links in the new directories**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs')
const path = require('node:path')
const roots = ['docs/audits', 'docs/roadmap']
const failures = []
for (const root of roots) {
  for (const name of fs.readdirSync(root).filter(name => name.endsWith('.md'))) {
    const file = path.join(root, name)
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)) {
      const target = match[1]
      if (/^[a-z]+:/i.test(target)) continue
      const resolved = path.resolve(path.dirname(file), target)
      if (!fs.existsSync(resolved)) failures.push(`${file} -> ${target}`)
    }
  }
}
if (failures.length) throw new Error(`Broken links:\n${failures.join('\n')}`)
console.log('All relative documentation links resolve')
NODE
```

Expected: `All relative documentation links resolve`.

- [ ] **Step 4: Verify no unrelated changes were included in documentation commits**

Run:

```bash
git log --name-only --pretty='commit %h %s' -6
git status --short
git diff --check
```

Expected: recent documentation commits contain only intended docs/`PRODUCT.md`
paths. The user's pre-existing component, data, package and test changes may still
appear in `git status`, but none were committed by this plan. `git diff --check`
must pass for the whole worktree; if it reports whitespace in a pre-existing user
file, report the exact path without modifying it.

- [ ] **Step 5: Record final handoff**

Report:

- the new audit and roadmap entry points;
- counts of spec/plan statuses (`9 / 2 / 11` for both);
- unresolved P0 initiatives;
- the unit-suite worktree caveat without claiming the documentation caused it;
- confirmation that no production code, remote data, sync or deploy operation was touched.

No additional commit is needed when all checks pass and Task 6 already committed the final documentation changes.

---

## Self-Review

- **Spec coverage:** Audit archive → Tasks 1–2; current roadmap split → Task 3;
  uncovered audit findings → Task 4; six approved future ideas → Task 5;
  completed history/root removal/cross-links → Task 6; filesystem, counts, links
  and isolation verification → Task 7.
- **Scope:** One documentation subsystem; no production implementation is included.
- **Historical integrity:** The 2026-07-19 audit is moved unchanged except an
  optional path-only link correction; its conclusions remain dated.
- **Status integrity:** The plan uses evidence-derived `9 implemented / 2 partial /
  11 not implemented` counts and never derives status from checkboxes.
- **Placeholder scan:** No `TBD`, `TODO`, “similar to”, or undefined implementation
  step remains. The angle-bracket values are confined to explicit reusable Markdown
  templates whose exact per-file data is supplied in adjacent tables.
- **Dirty-worktree safety:** Every commit uses explicit paths and `git commit --only`;
  no broad staging or destructive command is present.
