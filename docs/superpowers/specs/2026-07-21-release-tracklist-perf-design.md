# Release tracklist performance (сторінки релізів з багатьма треками)

Дата: 2026-07-21. Гілка: `main`.

> Спека написана в автономному режимі: після додавання аудіо в усі релізи VA-сторінки
> з великим tracklist (напр. `/release/va-futured-vol-7`, `/release/va-gatekey-vol-2`)
> завантажуються помітно повільніше за релізи з малим списком
> (`/release/zymosis-an-endless-sense-of-the-past`).

## Контекст

Аналіз коду (2026-07-21) показав, що повільність масштабується з кількістю треків, але
**не** через N+1-запити до БД — і `/api/release/[id]`, і `/api/tracks/[id]`, і
`/api/track-plays`, і лайк-лічильники читаються одним batch-запитом (`.in(slugs)`).
Реальні драйвери:

1. **Дубльована блокуюча гідратація треків.** `app/pages/release/[id].vue:16-20` робить
   `await Promise.all` з трьох запитів, що блокують SSR:
   - `useRelease()` → `/api/release/[id]` — уже повертає **повністю гідратований**
     `tracklist` (`hydrateReleaseTracklist`, `server/utils/releaseTracklist.ts:52-71`),
     який і рендериться в шаблоні;
   - `useFetch('/api/tracks/${id}')` (рядок 18) — **повний дубль** гідратації тих самих
     треків (`server/api/tracks/[release_slug].get.ts` → `expandReleaseTracks`), потрібний
     лише для мапи `artistSlugByTrackNumber` (рядки 99-101) заради поля `artist_slug`;
   - `useFetch('/api/release/${id}/related')` (рядок 19) — блокує SSR, хоч рендериться
     нижче фолду.

   Причина, чому дубль узагалі існує: `hydrateReleaseTracklist` **має** `artist_slug` у
   вхідному `CatalogTrack` (`releaseTracklist.ts:14`), але **не** кладе його у
   `ReleaseTracklistEntry` (`releaseTracklist.ts:1-8, 61-68`). Тобто дані вже під рукою
   на сервері — другий запит зайвий.

2. **Важкий клієнтський рендер на кожен трек.** `splitTitleByArtists`
   (`app/utils/tracks.ts`) будує великий regex-alternation з **повного** списку артистів
   (`/api/artists-all`) і проганяє його на кожен трек, до того ж викликається ~5 разів
   на трек: 3× у computed `playerTracks` (`[id].vue:79,83,85`) + у `TrackTitle` та
   `TrackArtists` у шаблоні tracklist. Плюс у розмітці рядка tracklist — **два**
   `TooltipProvider` на рядок (важкі Radix-компоненти × N треків).

3. **Дубльований `/api/track-plays`.** Викликається двічі: у сторінці
   (`[id].vue:56-62`, `onMounted`) і всередині `AudioTrackPlaylist.vue` (`onMounted`).
   Некешований (`no-store`), тож це два зайвих запити на монтування.

Кешування вже коректне: catalog-роути (`/api/release/**`, `/api/tracks/**`) —
`public, max-age=3600, swr` (`server/utils/cachePolicy.ts`) + Nitro
`defineCachedEventHandler`; лайки/plays — `private, no-store` навмисно.

## Рішення

Не змінювати вигляд і поведінку; прибрати зайву роботу й розблокувати SSR.

1. **Прокинути `artist_slug` крізь гідратацію релізу** й **видалити другий фетч треків.**
   Додати `artist_slug` у `ReleaseTracklistEntry` і у мапований об'єкт
   `hydrateReleaseTracklist`. У `[id].vue` брати `artistLink` напряму з
   `t.artist_slug` елемента `tracklist`, прибрати `useFetch('/api/tracks/${id}')`,
   `tracksAsync`, `tracks`, `artistSlugByTrackNumber`. `/api/tracks/[release_slug]`
   endpoint лишити (використовується деінде через `useTracks`), не чіпати.

2. **Зробити `related` неблокуючим.** `useFetch('/api/release/${id}/related')` →
   `{ lazy: true }` (винести з `await Promise.all`), щоб перший пейнт не чекав на
   related-блок під фолдом. `titleArtists` уже має фолбек на `allArtists`
   (`server:false`), тож lazy-related не ламає розбір назв.

3. **Здешевити рендер на трек.** Рахувати сегменти `splitTitleByArtists` **один раз** на
   трек (для title/artist/name) і перевикористовувати результат у `playerTracks`,
   `TrackTitle`, `TrackArtists` (передавати готові сегменти пропами замість повторного
   виклику з повним списком артистів). Розглянути один спільний `TooltipProvider` на весь
   tracklist замість по два на рядок. Кожен підкрок міряти окремо — лишати лише те, що дає
   вимірний зсув.

4. **Прибрати дубль `/api/track-plays`.** Лишити один виклик (у сторінці), передавати
   `playCounts` у `AudioTrackPlaylist` пропом; прибрати внутрішній `onMounted`-фетч
   компонента (або навпаки — лишити в компоненті, прибрати зі сторінки; обрати те, що
   мінімізує зміни контракту, зафіксувати в плані).

Поза скоупом: page-level ISR, віртуалізація tracklist, зміна дизайну сторінки релізу,
зміни в схемі БД чи sync-скриптах (`artist_slug` уже є в `tracks`).

## Критерії успіху

- Сторінка `/release/va-futured-vol-7` робить **на один блокуючий SSR-запит менше**
  (немає `/api/tracks/[id]`) і **один** `/api/track-plays` замість двох (перевірити в
  DevTools Network).
- Візуально tracklist ідентичний до/після (порядок, `artistLink`, назви з розбиттям
  артистів, BPM, тривалість) на VA- та звичайному релізі.
- Вимірне зменшення часу до інтерактивності / TBT на `/release/va-futured-vol-7` проти
  baseline (зафіксувати числа в PR); на `/release/zymosis-an-endless-sense-of-the-past`
  без регресій.
- `npm run test:unit` (базлайн 39 файлів / 161 тест) і `npx nuxi typecheck` зелені.

## Ризики

- `artist_slug` для гостьових/невідомих артистів може бути порожнім — `artistLink`
  має лишатись `undefined` у цьому випадку (як зараз через `artistSlug ? … : undefined`).
- Перевикористання сегментів у `TrackTitle`/`TrackArtists` не повинно змінити розмітку —
  порівняти рендер до/після на треку з кількома артистами (feat./&).
- Lazy-related: переконатися, що блок related усе одно з'являється (не лишається порожнім
  через невдалий фетч) і не спричиняє layout shift.
- Спільний `TooltipProvider` — перевірити, що тултипи tracklist усе ще працюють; якщо
  ламає — відкотити лише цей підкрок.

## Результати

Контрольний замір виконано 2026-07-21 у headless Chromium з вимкненим browser cache:
після одного прогрівального завантаження — медіана трьох чистих browser context за
перші 6 секунд. TBT тут — відтворювана апроксимація як сума частин long tasks понад
50 мс; Scripting — CDP `ScriptDuration`.

| Реліз | TBT до | TBT після | Scripting до | Scripting після |
| --- | ---: | ---: | ---: | ---: |
| `va-futured-vol-7` | 119 мс | 101 мс | 72.8 мс | 72.6 мс |
| `va-gatekey-vol-2` | 123 мс | 100 мс | 80.0 мс | 82.7 мс |
| `zymosis-an-endless-sense-of-the-past` | 56 мс | 50 мс | 74.5 мс | 73.1 мс |
| `mirror-me-azure-skies-and-golden-valleys` | 60 мс | 54 мс | 81.6 мс | 78.0 мс |

- Блокуючі SSR catalog-запити сторінки: `3 → 1` — лишився `/api/release/[slug]`,
  `/api/tracks/[slug]` видалено, а `/api/release/[slug]/related` перенесено на клієнт
  через `{ lazy: true, server: false }` і відсутній у початковому SSR HTML.
- Клієнтські `/api/*` запити: `5 → 5`; загальна кількість не змінилася, бо один
  `/api/track-plays` прибрано (`2 → 1`), а related перенесено з SSR на один lazy
  client request (`0 → 1`).
- Візуальна перевірка пройшла для VA- і звичайного релізу: порядок, artist links,
  title segments, BPM, play counts і lazy related збережені; повторний чистий прогін
  без console/page errors.
- Спільний `TooltipProvider` не залишено: A/B-перевірка показала, що tooltip `Plays`
  застрягає у стані `delayed-open`; з per-row providers обидва tooltip працюють.
- Фінальна перевірка: 39 test files / 162 tests і `npx nuxi typecheck` зелені.
