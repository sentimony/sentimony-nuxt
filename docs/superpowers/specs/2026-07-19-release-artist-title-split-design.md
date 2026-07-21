# Розділення назви релізу на виконавця та назву

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання). Ухвалені рішення позначено явно; альтернативи зафіксовано для перегляду.

## Контекст

`release.title` в export/БД — суцільний рядок формату `Виконавець «Назва»` з опційним суфіксом:

- `Sphingida «Origin»`, `VA «Fantazma»`, `Cifroteca & Roof Raiser «Wild Storm»`, `Hypnotriod «Seven Heavenly Edges» EP`.
- Перевірено на всіх 102 релізах export: регекс `^(.*?)\s*«(.+)»\s*(.*)$` матчить **102/102**; суфікси лише `EP` та `Single`; 51 унікальний префікс виконавця (включно з `VA` та колабораціями через `&`).

Окремих полів виконавця/назви немає ніде: ні в export, ні в колонках Supabase, ні в DTO (`Release extends BaseEntity` має тільки суцільний `title`). Розбиття по гільметах не робить жоден код; наявний `splitTitleByArtists` (`app/utils/tracks.ts`) вирішує іншу задачу — лінкування імен артистів у назвах треків.

Місця рендеру release title на фронті:

- `app/components/Item.vue:93` — картка каталогу (списки релізів, головна, профіль);
- `app/components/RelativeItem.vue:43` — related releases;
- `app/pages/release/[id].vue:137` — `<h1>` detail-сторінки; `:119-125` — `useSeoMeta` (title/ogTitle/twitterTitle); `:112` — `PageDescription`; alt-атрибути обкладинок.

Поле `releases.artists` (CSV slug-ів) — окрема сутність (зв'язки release↔artists), його не чіпаємо: display-ім'я виконавця в title (`VA`, `Cifroteca & Roof Raiser`) не завжди виводиться зі slug-ів.

## Розглянуті підходи

1. **Client/shared-side derive (ОБРАНО).** Чиста функція `splitReleaseTitle(title)` → `{ artist, name, edition }`, застосована в компонентах і SEO. `title` лишається канонічним і єдиним джерелом правди; DTO, export, БД, сінки, кеші — без змін.
2. Server-side derive: додаткові поля `title_artist`/`title_name` у DTO на межі маперів (обидва бекенди). Плюс — клієнти отримують готове; мінус — правки в усіх list/detail handlers обох бекендів, інвалідація кешів, зміна форми DTO і тестів заради даних, які детерміновано виводяться з наявного поля.
3. Data-level split: окремі поля в export + міграція колонок + сінки + Firebase. Найчистіша модель даних, але найбільший blast radius (102 записи export, 2 бекенди, зворотна сумісність `title`), а виграшу проти (1) немає, поки редагування даних відбувається через export-файл, де суцільний `title` зручний.

Обрано (1) як мінімальний, повністю оборотний крок. Якщо згодом знадобиться server-side поле (наприклад, для зовнішніх споживачів API) — функція вже чиста й переноситься на межу маперів без зміни контракту.

## Дизайн

### Утиліта `splitReleaseTitle`

Файл: `app/utils/releaseTitle.ts` (auto-import у компонентах, явний імпорт у тестах).

```ts
export interface ReleaseTitleParts {
  artist: string | null
  name: string
  edition: string | null
}

export function splitReleaseTitle(title: string | null | undefined): ReleaseTitleParts
```

Контракт:

- `Sphingida «Origin»` → `{ artist: 'Sphingida', name: 'Origin', edition: null }`;
- `Hypnotriod «Seven Heavenly Edges» EP` → `{ artist: 'Hypnotriod', name: 'Seven Heavenly Edges', edition: 'EP' }`;
- `VA «Fantazma»` → `{ artist: 'VA', name: 'Fantazma', edition: null }` — `VA` рендериться як є, без мапінгу на slug-и;
- рядок без гільметів (майбутні дані) → `{ artist: null, name: title, edition: null }` — graceful fallback, UI показує суцільний рядок як зараз;
- `null`/`undefined`/`''` → `{ artist: null, name: '', edition: null }`.

Регекс: `^(.*?)\s*«(.+)»\s*(.*)$` (перевірений на 102/102). Порожній префікс перед гільметами → `artist: null`.

### Рендер

- **`Item.vue`**: замість одного рядка `{{ i.title }}` — два рядки: виконавець (менший кегль, приглушений колір, поточні токени muted-тексту компонента) над назвою (поточний стиль). Гільмети в назві не рендеряться — розбиття робить їх надлишковими. `edition` — після назви тим самим приглушеним стилем (`Origin` / `Seven Heavenly Edges EP`). Fallback без artist — один рядок як зараз. Застосовується лише до карток релізів: `Item` універсальний, тому розбиття вмикається тільки коли entity — реліз (пропом або за `linkPrefix`/наявним механізмом розрізнення, з'ясувати на імплементації; інші сутності не мають гільметного формату і проходять через fallback автоматично, тож захист — це поведінка за замовчуванням).
- **`RelativeItem.vue`**: той самий дворядковий патерн у компактному вигляді.
- **`release/[id].vue`**: `<h1>` → виконавець окремим рядком/блоком над назвою релізу (назва лишається головним акцентом `<h1>`); alt-атрибути обкладинок і `:title` iframe-ів лишаються на повному `item.title` (там потрібен суцільний рядок).
- **SEO не змінюється**: `useSeoMeta` продовжує використовувати повний `item.title` (`Sphingida «Origin»`) — це вже коректний людиночитний заголовок, і зміна зламала б наявну індексацію тайтлів.

### Помилки та межі

- Функція чиста, без винятків: будь-який вхід дає валідний `ReleaseTitleParts`.
- Треків/артистів/подій не стосується — тільки release title.

### Тести

- `tests/unit/releaseTitle.test.ts`: кейси artist/name/edition, VA, колаборація з `&`, назва з `:` усередині гільметів, відсутні гільмети, порожній/undefined вхід.
- Прогін наявної сюїти (базлайн 39 files / 161 tests) — регресій бути не повинно, бо DTO не змінюється.
- Live smoke: `/releases`, `/release/va-fantazma`, головна.

## Наслідки

- API, БД, export, сінки, кеш-політика — без змін.
- Візуальна зміна карток і `<h1>` — узгоджена з дизайн-принципом «Artwork owns the color»: приглушений рядок виконавця не конкурує з обкладинкою.
