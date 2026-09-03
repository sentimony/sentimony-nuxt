# Sentimony Nuxt Roadmap

- Last reviewed: 2026-07-27

Кожна активна або майбутня ініціатива має окремий файл. Цей індекс є єдиною
актуальною точкою входу; детальний дизайн і implementation steps зберігаються у
`docs/specs` та `docs/plans` (`docs/superpowers/*` — архів).

Статуси: `Planned` — є визначений результат або готові spec/plan; `Partial` —
частина результату вже в коді; `Idea` — потрібен окремий discovery/design;
`Implemented` — результат перевірено в коді; `Descoped` — передумова більше не
відповідає прийнятому рішенню або архітектурі.

Поле `Ініційовано` — дата, коли ідею вперше сформульовано (у кореневому
`ROADMAP.md` до міграції, в аудиті або в спеці); `Last reviewed` — дата
останньої перевірки фактичного стану.

Фактичний стан кожного пункту перевірено в
[аудиті від 2026-07-25](audits/2026-07-25-implementation-status-audit.md).

## P0

- [Mobile performance](initiatives/mobile-performance.md) — досягти Lighthouse mobile Performance ≥80. `Planned`
- [CI quality gate](initiatives/ci-quality-gate.md) — додати Playwright і Netlify-preset required checks. `Partial`

## P1

- [TypeScript hardening](initiatives/typescript-hardening.md) — test typecheck, Nuxt strictness і lint guardrails. `Partial`
- [Component testing and coverage](initiatives/component-testing-and-coverage.md) — поведінкові component tests та risk-based coverage. `Planned`
- [E2E reliability](initiatives/e2e-reliability.md) — стабільний first-paint test і ширше browser coverage. `Planned`
- [Auth bundle](initiatives/auth-bundle.md) — зменшити public-route auth/Supabase JS. `Planned`
- [API list envelope](initiatives/api-list-envelope.md) — уніфікувати list responses як `{ info, results }`. `Planned`
- [Profile surface](initiatives/profile-surface.md) — полагоджені лайкнуті треки, помилки колекцій відділені від порожнього стану, profile використовує outline-focus і два текстові тири. `Implemented`
- [Origin response time](initiatives/origin-response-time.md) — Durable Cache і cache key HTML, нечутливий до query-міток. `Implemented`
- [Accessibility structure](initiatives/accessibility-structure.md) — лендмарки, скіп-лінка, видимий фокус на кнопках, доступні імена і стани списків. `Implemented`
- [Catalog semantics](initiatives/catalog-semantics.md) — списки, alt/title, стани решти списків, `color-scheme`, токени і контраст на Read-шарі каталогу. `Planned`
- [Function invocation budget](initiatives/function-invocation-budget.md) — тримати виклики функцій під лімітом Netlify, бо перевищення паузить усі сайти команди. `Idea`

## P2

- [Production request logging](initiatives/request-logging.md) — sampling і privacy redaction. `Planned`
- [Profile aggregation](initiatives/profile-aggregation.md) — один overview request із початковими колекціями. `Planned`
- [Mutation hardening](initiatives/mutation-hardening.md) — validation, existence checks і rate limiting. `Planned`
- [Auth contrast and focus states](initiatives/auth-contrast-focus.md) — focus-індикатори і AA-контраст auth-сторінок у двох темах. `Implemented`
- [Cloudflare migration](initiatives/cloudflare-domain.md) — поетапний переїзд DNS і runtime із замірами до/після. `Planned`

## P3

- [PWA icons](initiatives/pwa-icons.md) — `Partial`, лишається master artwork pipeline.
- [Design system](initiatives/design-system.md) — `Planned`.
- [README branding](initiatives/readme-branding.md) — `Partial`, лишаються badge row і section icons.
- [Release artist/title split](initiatives/release-title-split.md) — `Planned`.
- [Site search](initiatives/site-search.md) — `Planned`.

## Future ideas

- [Sentry observability](initiatives/sentry-observability.md).
- [Sentimony-owned UI](initiatives/custom-ui.md).
- [Custom catalog swiper](initiatives/custom-swiper.md).
- [Audio waveform visualization](initiatives/audio-waveform.md).
- [Bandcamp-code gifts](initiatives/bandcamp-code-gifts.md).

## Знято з обсягу

- [Catalog visibility security](initiatives/catalog-visibility-security.md) — `visible` є
  прапорцем видимості в каталозі, а не access control; hidden detail pages
  відкриті навмисно.
- [Play-count synchronization](initiatives/play-count-sync.md) — розділений state зник разом
  з `AudioTrackPlaylist`.

## Completed

- [Завершені ініціативи](completed.md).

## Аудити

- [Індекс аудитів](audits/README.md).
- [Статус спеки/плани та реалізації](audits/2026-07-22-documentation-status-audit.md).
- [Стан реалізації roadmap](audits/2026-07-25-implementation-status-audit.md).
