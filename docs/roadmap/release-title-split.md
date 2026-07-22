# Release artist/title split

- Status: Planned
- Priority: P3
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-release-artist-title-split-design.md), [plan](../superpowers/plans/2026-07-19-release-artist-title-split.md)

## Навіщо

Release cards і detail heading показують канонічний title одним рядком, через що
artist і назва релізу візуально не мають чіткої ієрархії.

## Очікуваний результат

Artist і release title рендеряться окремо у cards, related items і detail page,
а повний канонічний title лишається джерелом SEO/alt text.

## Обсяг

- Додати pure `splitReleaseTitle` із безпечним fallback.
- Використати його в `Item`, `RelativeItem` і release detail `<h1>`.
- Не змінювати API, export або SEO title.

## Залежності

- Потрібен contract для гільметів, suffix `[EP|Single]` і рядків без очікуваного формату.

## Критерії завершення

- Відомі title patterns розділяються детерміновано.
- Невідомі patterns показуються без втрати тексту.
- SEO й alt attributes використовують повний title.

## Наступний крок

Реалізувати pure utility та її table-driven tests із готового plan.
