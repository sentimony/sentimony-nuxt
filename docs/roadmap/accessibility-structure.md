# Accessibility structure

- Status: Planned
- Priority: P2
- Last reviewed: 2026-07-22
- Related: [quality audit](../audits/2026-07-19-quality-audit.md)

## Навіщо

WEB-4 виявив, що public layout не має `<main>`, а homepage не має змістовного
`<h1>`. Це погіршує landmark і heading navigation для assistive technology.

## Очікуваний результат

Кожна public page має один основний landmark, а homepage — один meaningful `<h1>`
без зміни затвердженої композиції.

## Обсяг

- Замінити wrapper навколо page slot на семантичний `<main>`.
- Позначити homepage brand heading як `<h1>` без visual redesign.
- Додати browser assertions на landmark і heading counts.

## Залежності

- WEB-4 із quality audit.
- Візуальна перевірка homepage в обох темах.

## Критерії завершення

- Public routes мають рівно один `<main>`.
- Homepage має рівно один meaningful `<h1>`.
- Lighthouse Accessibility 100 і visual baselines збережені.

## Наступний крок

Написати browser contract для `<main>`/`<h1>`, потім змінити лише семантичні tags.
