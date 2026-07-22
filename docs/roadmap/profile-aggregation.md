# Profile aggregation

- Status: Planned
- Priority: P2
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-profile-aggregation-design.md), [plan](../superpowers/plans/2026-07-19-profile-aggregation.md)

## Навіщо

`/api/profile/summary` повертає counts, але collection pages окремо завантажують
першу сторінку. Це створює зайві початкові приватні запити й дублює loader state.

## Очікуваний результат

Один приватний overview request повертає counts та initial collection data, а
наступні сторінки продовжують використовувати наявну пагінацію.

## Обсяг

- Винести shared collection descriptors.
- Додати `/api/profile/overview` і `useProfileOverview`.
- Дозволити `usePaginatedLikes` приймати initial items.
- Перевести profile navigation і collection pages на shared seed.

## Залежності

- Private/no-store cache policy лишається незмінною.
- Track profile page потребує окремої перевірки перед міграцією.

## Критерії завершення

- Початковий profile render не дублює перший collection request.
- Counts, empty states і пагінація зберігають правильну поведінку.
- Endpoint і composables покриті тестами.

## Наступний крок

Виконати готовий profile aggregation plan, починаючи зі shared collection options.
