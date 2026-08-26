# Artist `category_id` numbering

- Last reviewed: 2026-07-26

Довідник для випадків, коли нумерацію артистів треба відновити або розширити.
Щоденне правило («новому артисту — наступний вільний номер») живе в `AGENTS.md`.

## Що це

`category_id` задає порядок артистів у межах категорії (`sortArtistsByCategory()`
в `app/utils/artists.ts` сортує за `category` → числовим `category_id`) і
відображається як бейдж на картці. Значення — рядок, зазвичай тризначний.

Станом на 2026-07-26: 242 артисти, всі мають `category_id`; тризначний діапазон
`001`–`240` без пропусків і дублікатів.

Для перших 226 артистів канонічні номери та порядок беруться з inline-коментарів
`// NNN slug` у `sentimony-images/src/data/artist-images.ts`; порядок
`server/data/sentimony-db.yml` повторює цей список, пропускаючи дублікати фото.

## Правило обчислення

1. `irukanji` завжди `001` і стоїть першим як founder, незалежно від хронології релізів.
2. Далі — за першою появою в `server/data/sentimony-db.yml`: релізи за
   `releases[].date` від старих до нових, артисти всередині релізу за порядком у
   `releases[].artists`.
3. Події (`events`) інтерлівити за датою з релізами; нові учасники події
   отримують номер у момент першої появи.
4. Артисти без появи в релізах/подіях ідуть у хвіст, алфавітно за slug.

## Відомі винятки й ручні поправки

- `irukanji` — примусовий `001`.
- Ручні появи з `sentimony-images/CLAUDE.md`: `va-true-story` додає `iorlovskyi`
  і `zea`; event `shift-space` додає `hagen`.
- Slug-аліаси з даних релізів до реальних artist slug: `ers` → `e-r-s`,
  `alientime` → `alien-time`, `ka` → `ka-art`, історично також `36` →
  `thirty-sixth`, `anomalie` → `anomalie-in`, `braindrop` → `braindrop-in-dub`,
  `kd-expression` → `k-d-expression`.
- Хвіст без release connection: `astrocat` (`222`), `elisa-vargas-fernandez`
  (`223`), `gribessa` (`224`), `proff` (`225`), `tairam` (`226`).
- Артисти, додані в DB але відсутні в `artist-images.ts`, мають `227`–`240` і
  стоять у DB за відомою першою появою: `flange`, `monno`, `1n0x`,
  `thirty-sixth`, `scarlet-crown`, `fivetimesno`, `paul-pazdan`, `stripes`,
  `pxeyes`, `stereodots`, `symetric`, `slamthings`, `exoflux`, `shivaomart`.
- **Parking-діапазон `1600+`** — виняток із тризначного формату: `reis-mit-scheis`
  (`1600`), `apivniuk` (`1601`), `oklapak` (`1602`). Усі троє — `designer`,
  `visible: false`; номери виносять їх у кінець designer-групи замість
  канонічного місця. Не використовувати для видимих артистів.
