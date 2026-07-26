# PWA icons

- Status: Partial
- Priority: P3
- Ініційовано: 2026-07-18
- Last reviewed: 2026-07-25
- Related: [spec](../superpowers/specs/2026-07-19-brand-assets-design.md), [plan](../superpowers/plans/2026-07-19-brand-assets.md)

## Навіщо

`public/site.webmanifest` уже містить regular і maskable іконки 192/512, а
`scripts/verify-pwa.mjs` перевіряє їхню наявність. Відкритим лишається саме
artwork: логотип виглядає затиснутим на macOS і не має бажаного maskable
treatment із деталями, що виходять за базове коло. Немає ні master SVG, ні
відтворюваної генерації PNG, ні перевірки реальних dimensions.

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
