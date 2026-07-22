# Design system

- Status: Planned
- Priority: P3
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-design-system-validity-design.md), [plan](../superpowers/plans/2026-07-19-design-system-validity.md)

## Навіщо

Theme tokens повні, але компоненти містять сотні hardcoded white/black opacity
utilities і ручні light/dark pairs. Це ускладнює власний UI та залишає light
theme нерівномірною.

## Очікуваний результат

Токени, typography, spacing, surfaces і interaction states мають чіткі правила,
а повторно використовувані компоненти спираються на них замість випадкових кольорів.

## Обсяг

- Зафіксувати mapping conventions і intentional dark surfaces.
- Мігрувати контрастно зламані компоненти й duplicate token pairs.
- Додати regression inventory test.
- Описати component contracts для [Sentimony-owned UI](custom-ui.md).

## Залежності

- Візуальна перевірка обох тем.
- Є базовою залежністю для `custom-ui.md`.

## Критерії завершення

- Немає невиправданих парних black/white token duplicates.
- Light/dark states видимі й консистентні.
- Lighthouse Accessibility 100 зберігається.
- Нові компоненти мають documented token/component conventions.

## Наступний крок

Оновити inventory hardcoded кольорів і виконати перший кластер із готового plan.
