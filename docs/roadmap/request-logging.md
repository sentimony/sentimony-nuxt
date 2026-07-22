# Production request logging

- Status: Planned
- Priority: P2
- Last reviewed: 2026-07-22
- Related: [quality audit](../audits/2026-07-19-quality-audit.md), [spec](../superpowers/specs/2026-07-19-server-hardening-design.md), [plan](../superpowers/plans/2026-07-19-server-hardening.md)

## Навіщо

Production middleware може логувати IP, повний query і referrer для кожного
запиту. Це збільшує function logs і створює непотрібний privacy risk.

## Очікуваний результат

Production logs лишають достатній operational signal без raw secrets,
ідентифікаторів або повних URL parameters.

## Обсяг

- Визначити production sampling/disable policy.
- Винести тестовану redaction-функцію.
- Редагувати query, referrer та чутливі request metadata.
- Зберегти повний локальний debug mode.

## Залежності

- Узгоджена privacy policy для майбутньої [Sentry integration](sentry-observability.md).

## Критерії завершення

- Тести доводять відсутність secrets і raw query values у production logs.
- Production verbosity вимкнена або семплується за явним правилом.
- Local debug лишається інформативним.

## Наступний крок

Зафіксувати дозволені request fields і реалізувати redaction task із server hardening plan.
