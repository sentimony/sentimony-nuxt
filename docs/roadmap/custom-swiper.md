# Custom catalog swiper

- Status: Idea
- Priority: Future
- Last reviewed: 2026-07-22
- Related: [mobile performance](mobile-performance.md)

## Навіщо

Swiper покриває багато behavior, але додає JavaScript, styles і DOM complexity.
Власна реалізація може бути легшою лише якщо реальні catalog requirements істотно
менші за можливості залежності.

## Очікуваний результат

Benchmark-backed рішення `keep`, `configure` або `replace`, а не переписування
залежності заради самого переписування.

## Обсяг

- Інвентаризувати navigation, touch, free mode, breakpoints, section dividers,
  keyboard/a11y, lazy rendering та SSR needs.
- Порівняти поточний Swiper із малим native scroll-snap prototype.
- Виміряти bundle, DOM, interaction latency, accessibility і maintenance cost.

## Залежності

- [Mobile performance](mobile-performance.md) baseline і результати оптимізації
  поточного Swiper.

## Критерії завершення

- Є відтворюваний prototype/benchmark і письмовий keep/replace decision.
- Усі поточні UX та accessibility requirements враховані.
- Якщо обрано replacement, для нього створено окрему spec перед implementation.

## Наступний крок

Зафіксувати current feature inventory і mobile performance baseline до прототипування.
