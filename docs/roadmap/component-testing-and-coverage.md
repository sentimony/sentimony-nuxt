# Component testing and coverage

- Status: Planned
- Priority: P1
- Last reviewed: 2026-07-22
- Related: [quality audit](../audits/2026-07-19-quality-audit.md)

## Навіщо

VITEST-2 і VITEST-4–VITEST-6 показали, що component behavior переважно
перевіряється читанням `.vue` source, coverage не вимірюється, Nitro globals
мокаються вручну, а central cleanup policy не визначена.

## Очікуваний результат

High-risk UI має поведінкові Nuxt/Vue tests, security/data branches — видимий
coverage signal, а mock lifecycle є однаковим і задокументованим.

## Обсяг

- Додати окремий Nuxt/Vue component-test project із DOM environment.
- Мігрувати likes, audio, auth і tabs із source-string-only assertions.
- Додати V8 coverage baseline та risk-based branch thresholds.
- Визначити explicit cleanup або перевірений central restore policy.
- Скоротити manual `globalThis` mocks через factories/test utilities там, де це виправдано.

## Залежності

- VITEST-2, VITEST-4, VITEST-5 і VITEST-6 із quality audit.
- [TypeScript hardening](typescript-hardening.md) для test typecheck.

## Критерії завершення

- Likes, audio player, auth form і tabs мають runtime behavior tests.
- Coverage report публікується в CI з thresholds для критичних branches.
- Mock cleanup convention задокументований і не має shuffled-run leakage.

## Наступний крок

Вибрати найменший Nuxt/Vue test harness і перенести один high-risk source assertion як pilot.
