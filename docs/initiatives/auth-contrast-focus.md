# Auth contrast and focus states

- Status: Implemented
- Priority: P2
- Ініційовано: 2026-07-25
- Last reviewed: 2026-07-26
- Related: [audit](../audits/2026-07-25-auth-theme-contrast-audit.md), [spec](../superpowers/specs/2026-07-25-auth-contrast-focus-design.md)

## Навіщо

Аудит `/signin` у двох темах показав, що головна CTA не має індикатора фокусу
взагалі (база `buttonVariants` містить безумовний `outline-none` і нуль
`focus-visible`), а secondary-текст у світлій темі системно нижчий за AA
(2.58-3.94 замість 4.5). Success-повідомлення захардкоджене під темну тему
(`text-green-400`, 1.59 у світлій).

## Очікуваний результат

Auth-сторінки мають видимий focus-стан на кожному інтерактивному елементі й
проходять AA в обох темах, а виправлення живуть у токенах і primitives, а не в
дублях класів на call-sites.

## Обсяг

- Ретюн токенів: `--card`, `--muted-foreground`, `--ring`, `--input`,
  `--destructive`, новий `--success`.
- `focus-visible` у базу `buttonVariants` через `outline`; варіант `submit` для
  сабмітів форм; перевірений у рендері outline в `Input`, auth-лінках і кнопці
  видимості пароля; варіант `success` в `alertVariants`.
- Intentional-dark Footer локально перевизначає `--ring`; його navigation і
  social links не анімують `outline-color`.
- Екстракція `AuthCard.vue` (оболонку дублюють `AuthForm.vue` і
  `reset-password.vue`), `aria-describedby`/`role="alert"` для помилок полів,
  `aria-label`/`aria-pressed` для кнопки ока.
- Регрес-тест `tests/unit/interactionStates.test.ts`.

## Залежності

- Візуальна перевірка обох тем на auth-сторінках і обхід сайту через
  `buttonVariants` (зачіпає всі кнопки).
- Не конфліктує з [design system](design-system.md): та ініціатива не торкається
  самих токенів.

## Критерії завершення

- Tab дає видиме обведення на всіх інтерактивних елементах auth у двох темах.
- Текст ≥ 4.5, focus-обведення та іконки у спокої ≥ 3.0 на `/signin`, `/signup`,
  `/forgot-password`, `/reset-password` в обох темах.
- Сабміт однаковий за вагою в обох темах; success-повідомлення читається.
- `npm run test:unit` і `npm run typecheck` зелені.

## Наступний крок

Немає: обсяг закритий. Follow-up-и (решта 11 `outline-none`, п’ять
`focus-visible:ring-ring/50`, site-wide `text-foreground/50` і
`buttonVariants.soft`) описані в
[аудиті](../audits/2026-07-25-auth-theme-contrast-audit.md) і належать
[accessibility structure](accessibility-structure.md) та
[design system](design-system.md).
