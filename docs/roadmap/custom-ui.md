# Sentimony-owned UI

- Status: Idea
- Priority: Future
- Last reviewed: 2026-07-22
- Related: [design system](design-system.md), [previous proposed UI spec](../superpowers/specs/2026-06-27-sentimony-ui-refactor-design.md)

## Навіщо

Проєкт має власну візуальну мову, але presentation patterns розподілені між
page markup, shadcn-derived wrappers і локальними компонентами. Попередній `Sr*`
дизайн не був реалізований і не відповідає поточному напряму owned components.

## Очікуваний результат

Високоповторювані presentation surfaces належать Sentimony, мають стабільні
contracts і спираються на доступні primitives без wholesale rewrite.

## Обсяг

- Почати з buttons, likes, media, status і entity links.
- Зберегти Reka primitives там, де вони дають accessibility/focus behavior.
- Мігрувати call sites кластерами та видаляти obsolete wrappers після parity.
- Не створювати паралельні компоненти без чіткої ownership boundary.

## Залежності

- [Design system](design-system.md): tokens, states, typography, spacing і contracts.
- Behavior tests для shared interactive components.

## Критерії завершення

- Узгоджені high-reuse surfaces використовують documented owned components.
- Obsolete compatibility wrappers видалені після міграції.
- Accessibility, themes і responsive behavior не регресують.

## Наступний крок

Завершити design-system inventory і вибрати перший bounded component cluster.
