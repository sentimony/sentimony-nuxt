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
