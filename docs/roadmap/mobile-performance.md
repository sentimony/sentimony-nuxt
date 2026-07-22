# Mobile performance

- Status: Planned
- Priority: P0
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-mobile-performance-design.md), [plan](../superpowers/plans/2026-07-19-mobile-performance.md)

## Навіщо

Останній зафіксований Lighthouse mobile Performance — 68. Основні втрати дають
TBT, великий початковий DOM Swiper, зайвий JavaScript, non-passive listeners і
замалі tap targets у футері.

## Очікуваний результат

Прогрітий stage стабільно показує Performance не нижче 80 без візуальних або
функціональних регресій каталогу.

## Обсяг

- Виміряти bundle і Lighthouse baseline перед змінами.
- Перевірити lazy hydration нижньофолдних блоків.
- Обмежити початковий DOM Swiper і локалізувати non-passive listener.
- Виправити tap targets футера та повторити вимірювання.

## Залежності

- Результати вимірювань визначають, які оптимізації залишаються.
- Перетинається з [custom swiper](custom-swiper.md), але не залежить від його реалізації.

## Критерії завершення

- Lighthouse mobile Performance ≥80 на прогрітому stage.
- TBT <300 ms, tap targets 100%.
- Зафіксовано before/after bundle і Lighthouse numbers.
- Головна та списки не мають візуальних або interaction regressions.

## Наступний крок

Зняти чистий bundle/Lighthouse baseline і виконувати план по одній вимірюваній
оптимізації.
