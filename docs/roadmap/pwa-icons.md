# PWA icons

- Status: Planned
- Priority: P3
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-brand-assets-design.md), [plan](../superpowers/plans/2026-07-19-brand-assets.md)

## Навіщо

Поточний логотип у PWA icons виглядає затиснутим на macOS і не має бажаного
maskable treatment із деталями, що виходять за базове коло.

## Очікуваний результат

Єдине master artwork відтворювано генерує regular і maskable assets, які добре
виглядають у macOS dock та Android Add to Home Screen.

## Обсяг

- Підготувати master SVG.
- Додати deterministic generation script для потрібних PNG sizes.
- Розширити `verify:pwa` перевіркою dimensions і manifest references.
- Виконати ручну install verification.

## Залежності

- Остаточно погоджене brand artwork.

## Критерії завершення

- Усі manifest assets генеруються з одного джерела.
- `npm run verify:pwa` проходить.
- Regular/maskable icons перевірені на macOS і Android.

## Наступний крок

Підготувати й затвердити master SVG перед автоматизацією PNG generation.
