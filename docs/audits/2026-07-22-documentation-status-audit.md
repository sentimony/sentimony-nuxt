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

## Статус специфікацій

| Specification | Status | Evidence |
| --- | --- | --- |
| `2026-06-01-theme-toggle-design.md` | Реалізовано | `useTheme.ts`, `ThemeToggle.vue`, pre-paint script і theme tokens існують. |
| `2026-06-06-homepage-light-theme-design.md` | Реалізовано | `HomepageAtmosphere.vue` і чотири Playwright baselines існують; спека позначена як implemented. |
| `2026-06-25-project-hardening-design.md` | Частково | Cache policy, sanitizer, private export і test infrastructure існують; aggregated profile loading і повне visibility hardening — ні. |
| `2026-06-27-sentimony-ui-refactor-design.md` | Не реалізовано | Немає `app/components/sr/` або `Sr*` компонентів; поточна owned-UI робота має інший напрям. |
| `2026-07-01-sitemap-indexing-design.md` | Реалізовано | Sitemap endpoint, pure builder, route-rule noindex і тести існують. |
| `2026-07-02-catalog-features-design.md` | Реалізовано | Portfolio, organized events, `/artists/all`, category dividers і genre pages існують. |
| `2026-07-02-custom-audio-player-design.md` | Частково | Player component і page wiring існують, але в канонічному export немає mix fields Hagen, тому фіча не активна. |
| `2026-07-07-global-audio-player-design.md` | Реалізовано з еволюцією | Global composable і bridge існують; persistent controls еволюціонували з header row в `AudioBottomPlayer`. |
| `2026-07-13-lighthouse-lcp-design.md` | Реалізовано | Flag CSS route-scoped, forest/testimonial images мають optimized delivery; implementation commits існують. |
| `2026-07-16-lazy-media-tabs-design.md` | Реалізовано | Tab slots activation-gated, inline players не рендерять scoped controls. |
| `2026-07-18-export-sync-roadmap-2-4-7-design.md` | Реалізовано | Array-aware sync, `track_artists`, `like_counters`, count endpoints і fallbacks існують. |
| `2026-07-19-api-list-envelope-design.md` | Не реалізовано | Немає `buildListEnvelope`; list endpoints зберігають попередні response shapes. |
| `2026-07-19-auth-bundle-design.md` | Не реалізовано | Заплановані lazy auth/header/toaster boundaries відсутні. |
| `2026-07-19-brand-assets-design.md` | Не реалізовано | Немає master icon generator або розширеного PWA verification flow. |
| `2026-07-19-ci-quality-gate-design.md` | Не реалізовано | Наявний workflow не має Playwright job або Netlify-preset build gate. |
| `2026-07-19-design-system-validity-design.md` | Не реалізовано | Token migration і `designTokens.test.ts` відсутні. |
| `2026-07-19-mobile-performance-design.md` | Не реалізовано | Немає lazy hydration або capped initial Swiper DOM; результат ≥80 не зафіксовано. |
| `2026-07-19-profile-aggregation-design.md` | Не реалізовано | Немає `/api/profile/overview` або `useProfileOverview`. |
| `2026-07-19-release-artist-title-split-design.md` | Не реалізовано | Немає `releaseTitle.ts` або split-title rendering contract. |
| `2026-07-19-server-hardening-design.md` | Не реалізовано | Немає shared slug validation, rate limiter або request-log redaction implementation. |
| `2026-07-21-release-tracklist-perf-design.md` | Реалізовано | Спека фіксує before/after measurements; blocking requests і duplicate play-count fetch прибрано. |
| `2026-07-21-site-search-design.md` | Не реалізовано | Search endpoint, composable і dialog відсутні. |

Підсумок: **9 реалізовано, 2 частково, 11 не реалізовано**.

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

## Покриття аудиту від 2026-07-19

| Finding | Covered by spec/plan | Current state |
| --- | --- | --- |
| TS-1 / VITEST-3 test typecheck | Ні | Немає `tsconfig.tests.json` або `typecheck:tests`. |
| TS-2 Nuxt strictness | Ні | Base flags не підключені до Nuxt-generated configs. |
| TS-3 unused declarations | Ні | Немає cleanup/enforced unused checks plan. |
| TS-4 non-null assertions | Ні | Немає окремого remediation. |
| TS-5 lint guardrails | Ні | Немає ESLint/type-safety plan. |
| WEB-1 / VITEST-1 hidden artist | Лише старий загальний hardening plan | Дефект не виправлено: handler повертає hidden records, а unit-тест захищає цю поведінку. |
| WEB-2 footer SVG | Ні | Виправлено поза окремим планом у поточному коді. |
| WEB-3 browser E2E CI | Так | CI quality-gate spec/plan існує, але не реалізований. |
| WEB-4 `<main>` і homepage `<h1>` | Ні | Лишається відкритим. |
| WEB-5 first-paint race | Ні | Лишається відкритим. |
| WEB-6 route-smoke gaps | Ні | Лишається відкритим. |
| VITEST-2 component behavior | Ні | Source-string tests лишаються основним component contract. |
| VITEST-4 coverage | Ні | Немає provider, report або threshold. |
| VITEST-5 manual globals | Ні | Новіші плани продовжують той самий `globalThis` mock pattern. |
| VITEST-6 reset policy | Ні | Немає central policy або documented explicit-cleanup convention. |

Лише WEB-3 прямо покритий новою окремою спекою і планом, але ця робота ще не реалізована.

## Знахідки щодо roadmap

- Дата й baseline 39 files / 161 tests у старому roadmap застаріли.
- Твердження, що `typecheck` script і CI workflow не існують, хибне; прогалина
  required Playwright/Netlify gates лишається актуальною.
- Твердження, що всі detail API приховують non-public entities, хибне для artist endpoint.
- Lazy third-party media tabs уже реалізовані й належать до completed work.
- Site search, API envelope, release-title split і більшість audit remediations
  відсутні у старому roadmap.

## Поточна перевірка unit suite

Локальний прогін 2026-07-22 дав **40 test files / 168 tests**, з яких чотири
тести у `likeButtons.test.ts` впали. Причина — поточний незакомічений UI refactor
переніс icon contract у `LikeButton`, тоді як source-based assertions і далі
шукають `lucide:thumbs-up` безпосередньо у сторінках.

Це знімок dirty worktree, а не зелений baseline committed `main`, і не наслідок
документаційних змін цього аудиту.

## Висновок

Старі планові checkbox-и не придатні для обліку прогресу. Актуальний статус має
жити в `docs/roadmap/README.md`, а детальний доказ — у датованих аудитах.
Найтерміновіші відкриті напрями: catalog visibility security, mobile performance
і повний CI quality gate.
