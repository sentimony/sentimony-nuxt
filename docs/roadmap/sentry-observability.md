# Sentry observability

- Status: Idea
- Priority: Future
- Last reviewed: 2026-07-22
- Related: [request logging](request-logging.md), [CI quality gate](ci-quality-gate.md)

## Навіщо

Поточні function logs і локальні browser checks не дають повного production
error trail, readable stack traces або release/environment correlation.

## Очікуваний результат

Client і server exceptions у stage/prod мають actionable stack traces, release
context і alerts без витоку персональних або catalog-secret даних.

## Обсяг

- Визначити client/server SDK boundaries.
- Налаштувати source maps, releases і stage/prod environments.
- Спроєктувати privacy scrubbing, sampling, alert rules і ownership.
- Перевірити SSR, Nitro/Netlify та browser errors окремими controlled events.

## Залежності

- Privacy/data-flow рішення та [production request logging](request-logging.md).
- Secret management і deploy integration.

## Критерії завершення

- Controlled client і server errors з'являються у правильному environment/release.
- Stack traces резолвляться до читабельного source.
- Events не містять raw tokens, cookies, sensitive query або profile data.
- Alert routing і sampling мають явних власників та budgets.

## Наступний крок

Написати privacy/data-flow design до встановлення будь-якого Sentry SDK.
