# Аудит фронтенду за скілом frontend-crafting (повторний)

- Дата: 2026-09-04
- Гілка: `quality-audits-2026-09` від `accessibility-baseline` (`1667326`)
- Скіл: `.claude/skills/frontend-crafting` v1.2.1, workflow `review`
- Формат: read-only аудит; код не змінено. Ремедіації нижче — вхід для спеки
  й плану тієї самої сесії.
- Попередній аудит тих самих поверхонь:
  [2026-09-01](2026-09-01-frontend-crafting-audit.md). Його знахідки
  перевірено в джерелі повторно і винесено в таблицю статусів нижче;
  жодна з них не повторюється як нова.

## Методика та обсяг

Читання джерел плюс статичний інвентар класів і атрибутів; браузер не
запускався. Пороги контрасту успадковано з
[аудиту 2026-07-25](2026-07-25-auth-theme-contrast-audit.md) (світла тема:
чорний текст потребує альфи ≥ 0.56 для AA 4.5; темна: білий ≥ 0.46), токени
`--foreground` / `--muted-foreground` з того часу не змінювалися.

**Вибірка.** Відкрито порядково 23 із 36 сторінок (усі списки, усі сім
детальних, `index`, `contacts`, `profile.vue`, `profile/index`, `signin`,
`reset-password`) і 42 із 50 компонентів (усі поза `ui/*` плюс
`ui/{alert,button,card,input}`). Решта 13 сторінок пройшли лише grep-інвентар
(заголовки, токени, атрибути), бо є тонкими обгортками вже відкритих
компонентів: `signup` і `forgot-password` — над `AuthForm`; шість
`profile/*` — над `ProfileCollectionPage`; три `releases/{psychill,psytrance,ungrouped}`
— над `ReleasesFiltered`; `confirm` — редирект; `ui.vue` — поза скоупом.
Вісім примітивів `ui/{alert/AlertDescription,card/CardContent,label,sonner,tooltip/*}`
оцінено через споживачів. Кожна цифра в звіті — результат повторного
підрахунку в джерелі після grep.

**Поверхні та їхні режими** — ті самі сім груп, що й 2026-09-01: головна
(Persuade + Experience), списки каталогу (Persuade → Operate), детальні
сторінки (Read), auth і profile (Operate), плеєр (Operate, наскрізний), shell
(наскрізний). `confirm.vue` (редирект без UI) і `ui.vue` (внутрішній UI-kit,
`noindex`) — свідомі винятки.

## Статус знахідок аудиту 2026-09-01

| ID | Суть | Статус | Де перевірено |
|---|---|---|---|
| T1 | лендмарки, скіп-лінка | **закрито** | `layouts/default.vue:104-107,187`, `Header.vue:34,57`, `Footer.vue:13,17`, `OpenSidebar.vue:74`, `error.vue:16` |
| T2 | фокус лише на `a` | **закрито** | `tailwind.css:109` — `:is(a, button, [role="button"], input[type="range"], summary):focus-visible` |
| T3 | `div` замість кнопки в `OpenImage` | **закрито** | `OpenImage.vue:60-83` |
| T4 | іконкові таби без імені | **закрито** | `Tabs.vue:27` |
| T5 | зміна треку без live-region | **закрито** | `GlobalPlayer.vue:124` |
| T9 | `scroll-padding` | **закрито** | `tailwind.css:126-127` |
| T10 | стрілки свайпера | **закрито** | `Swiper.vue:168-180` |
| V2 | третій текстовий рівень | **закрито для публічних поверхонь** — `text-foreground/50` лишився тільки в `pages/ui.vue` (9 входжень, поза скоупом) | grep по `app/` |
| V3 | стани списків | **закрито на 8 сторінках**, лишилися три без станів — див. T16 | `CollectionStatus.vue`, 10 споживачів |
| V6 | `error.vue` поза системою | **закрито** | `error.vue` |
| V1 | `<h1>` на головній | **закрито наполовину**: `<h1>` є (`Hero.vue:27`), але містить лише «Sentimony» — див. V9; CTA не додано — рішення продукту | `Hero.vue` |
| V4 | другий рядок картки | **відкрито** (візуальне рішення, не дефект стандарту) | `Item.vue:81` |
| V5 | розділювачі свайпера | **частково**: колір став `text-muted-foreground`, розмір `text-[8px]` і `!pointer-events-none` лишилися, семантики немає | `Swiper.vue:137-150` |
| T6 | `color-scheme` | **відкрито** — жодного входження в `app/` і `nuxt.config.ts`; є лише в `public/offline.html:10` | grep |
| T7 | контраст футера | **відкрито** | `Footer.vue:13` — `text-white/50` |
| T8 | хардкоджені кольори | **відкрито**, інвентар уточнено — див. T18 | grep |
| T11 | прев'ю без `height` | **відкрито** | `OpenImage.vue:69-76` — лише `:width` |

**Чисті перевірки** (нуль знахідок, обсяг названо): `transition-all` — 0 у
`app/`; безумовний `outline-none` — 0 (два `focus:outline-none` на контейнерах
діалогів reka-ui, легітимно); позитивний `tabindex` — 0; `target="_blank"` без
`rel` — 0; `<img>` у `Item.vue` з `width`/`height` — 3 з 3; `toLocaleDateString`
поза `useDate` — 0 (дати через `Intl.DateTimeFormat`, `useDate.ts:20,33`);
`v-html` без `sanitizeHtml` — 8, усі на статичних константах або
екранованих рядках (`Hero`, `Tabs`, `OpenImage`, `index.vue`, `playlist/[id]`).

---

# Шар 1. Візуальна й досвідна критика

## Що зроблено добре

**`CollectionStatus` став системою, а не латкою.** Один компонент з трьома
станами (`role="alert"` + повтор, loading з `motion-reduce`, порожній стан з
власним текстом) підключено до восьми списків, і кожен має свій текст
порожнього стану: «No releases in this genre yet», «No events announced yet»,
«Nothing published yet». Це рівень, якого 2026-09-01 не мала жодна сторінка.

**Плеєр лишається еталоном.** До `inert`/`aria-hidden` панелі, що виїжджає,
додано live-region із «{artist} - {name}» (`GlobalPlayer.vue:124`); `PagePlayer`
тримає колонку номерів у ширині `max(2, digits)ch`, тож короткі й довгі
треклісти вирівняні однаково (`PagePlayer.vue:119`).

**`useDate` — правильний спосіб форматувати дати.** Один композабл через
`Intl.DateTimeFormat` з `timeZone: 'UTC'`; у всьому `app/` немає жодного
`toLocaleDateString` чи ручної збірки рядка.

**Auth-форма — зразок для решти форм.** `Label for`, `autocomplete`,
`aria-invalid`, `aria-describedby` на помилку, `role="alert"` на тексті
помилки, `inputmode` через `type="email"`, 16px на мобільному
(`Input.vue:26`: `text-base md:text-sm`).

## Системні знахідки

### V7. Накладена прозорість відроджує третій текстовий рівень

- **Локація:** `app/components/buttons/LikeButton.vue:26` (`opacity-50` на
  лічильнику всередині `soft`-варіанта з `text-muted-foreground`, ефективна
  альфа 0.62 × 0.5 = 0.31), `app/components/player/PagePlayer.vue:213`
  (`text-black/60 opacity-60` = 0.36), `PagePlayer.vue:228` (`opacity-60`
  всередині рядка `text-black/60` = 0.36), `app/components/Header.vue:53`
  (`opacity-[0.4]` на «Psychedelic Music Label»), `Header.vue:124`
  (`opacity-50` на email у меню акаунта).
- **Проблема:** V2 прибрала `text-foreground/50` з каталогу, але той самий
  рівень повертається через множення двох легітимних прозоростей: контейнер
  на 60 % і текст усередині ще на 60 %. Правило AGENTS.md про два тири
  формально дотримано, а фактичний контраст — нижчий за старий `/50`.
- **Severity:** P2.
- **Вплив:** лічильники лайків і прослуховувань у треклісті та лічильник на
  кнопці «Like» — саме ті цифри, які показують соціальний сигнал релізу — у
  світлій темі нижчі за AA з великим запасом (0.31-0.36 при порозі 0.56);
  підпис бренду в хедері не проходить в обох темах.
- **Ремедіація:** для тексту всередині вже приглушеного контейнера
  використовувати `text-muted-foreground` замість `opacity-*`, а контейнер
  тримати на `text-foreground`; `opacity-*` лишити іконкам (для них поріг 3:1).
  Додати перевірку в `tests/unit/interactionStates.test.ts`: у файлах плеєра
  й кнопок `opacity-{40,50,60}` не стоїть на елементі з текстовим вмістом.

### V8. «Relative» замість «Related» і два інші копірайт-дефекти на детальних сторінках

- **Локація:** `app/pages/release/[id].vue:278,292` і `app/pages/event/[id].vue:193`
  («Relative Releases:», «Relative Artists:»); `app/pages/video/[id].vue:123`
  («Сredits:» — перша літера кирилична `С`, U+0421); `app/components/player/PagePlayer.vue:167`,
  `app/components/OpenImage.vue:22`, `app/pages/playlist/[id].vue:24` — три
  формулювання одного стану («Music is coming», «Image is<br>coming ⛄»,
  «Music is<br>coming ⛄»).
- **Проблема:** «relative» — родич або відносний, потрібне «related»; кирилична
  `С` виглядає ідентично, але ламає пошук по сторінці, скрінрідер і
  автопереклад; три словники для «контенту ще немає».
- **Severity:** P2 для «Relative» і кирилиці (текст описує не те, що є), P3
  для розбіжності формулювань.
- **Вплив:** заголовки секцій читає кожен відвідувач детальної сторінки релізу
  й події; «Сredits» з кирилицею не знайдеться через Ctrl+F і читається
  скрінрідером як «S-redits».
- **Ремедіація:** «Related Releases» / «Related Artists», латинська «C», один
  рядок «Coming soon» для всіх трьох заглушок.

### V9. Заголовок головної — «Sentimony» без «Records»

- **Локація:** `app/components/Hero.vue:27-33`.
- **Проблема:** `<h1 v-html="heroTitle"/>` містить `Sentimony<br>`, а «Records»
  — сусідній `<div>`. Доступна назва сторінки — половина назви лейблу.
- **Severity:** P3.
- **Вплив:** у списку заголовків скрінрідера і в SEO-снапшоті головна
  називається «Sentimony».
- **Ремедіація:** зробити `<h1>` обгорткою обох рядків (візуальні класи
  лишаються на внутрішніх `<span class="block">`), або додати «Records» у
  `sr-only`.

## Ізольовані знахідки

### V10. Сторінка друга не додає нічого до списку

- **Локація:** `app/pages/friend/[id].vue:49-64`.
- **Проблема:** сторінка рендерить заголовок, картинку `cover_th` без
  `width`/`height` і в `ItemContent` — ще раз той самий заголовок. Ні опису,
  ні посилання на сайт друга.
- **Severity:** P2.
- **Вплив:** перехід із `/friends` веде на сторінку, з якої нікуди йти; для
  Read-поверхні це порожній стан, замаскований під сторінку.
- **Ремедіація:** або показати поле з посиланням/описом (якщо є в каталозі),
  або зробити `/friends` списком зовнішніх посилань без детальної сторінки.
  Мінімум — `width`/`height` на картинці (T20).

### V11. Порожня секція «Releases with X» і сто порожніх абзаців

- **Локація:** `app/pages/artist/[id].vue:301-314`.
- **Проблема:** `<p v-for="i in releasesSortedByDate">` рендерить абзац на
  кожен реліз каталогу (102), а `v-if` стоїть на `<RelativeItem>` усередині;
  для артиста з двома релізами в DOM лишається сто порожніх `<p class="mb-2">`.
  Заголовок «Releases with X:» показується навіть коли збігів нуль (у
  дизайнерів і мастеринг-інженерів це норма).
- **Severity:** P2.
- **Вплив:** візуально маргіни порожніх абзаців схлопуються, тож око нічого
  не бачить, але скрінрідер отримує сотню порожніх абзаців, а секція без
  вмісту виглядає як помилка даних.
- **Ремедіація:** відфільтрувати у `computed` і ховати секцію при нулі — так
  само, як уже зроблено для `organizedEvents` і `portfolioReleases` у тому ж
  файлі.

### Текст інтерфейсу

Прочитано всі видимі рядки в 35 сторінках і 40 компонентах. Плейсхолдерів і
вигаданих цифр немає; capitalization послідовний (Title Case у навігації та
кнопках). Окрім V8: `title` iframe-ів названо за реалізацією («Bandcamp
Iframe», «SoundCloud Iframe» — `release/[id].vue:170,206`, `track/[id].vue:181,199`,
`playlist/[id].vue:141`), а не за тим, що це для користувача («Bandcamp
player»). Повідомлення «Something went wrong. Please try again.» при
реєстрації на зайнятий email (`AuthForm.vue:16`) навмисно розмите, щоб не
розкривати наявність акаунта — це прийнятний виняток із правила про корисний
текст помилки.

---

# Шар 2. Технічні знахідки

## Системні патерни

### T12. Треклісти й списки зв'язків — абзаци, а не списки

- **Локація:** `app/pages/release/[id].vue:245-263` (обидва варіанти
  треклісту), `app/pages/tracks.vue:124-133`, `app/pages/event/[id].vue:155-162`
  (лайнап з нумерацією), `app/components/player/PagePlayer.vue:169-234`
  (рядки треків як `<div>`), `app/pages/playlist/[id].vue:177-200` (`<ol>`,
  усередині якого `<div>`, а `<li>` — усередині `<div>`: невалідне вкладення);
  списки зв'язків через `<p>` на елемент: `release/[id].vue:279-302`,
  `track/[id].vue:272-278`, `artist/[id].vue:304-327`, `event/[id].vue:180-203`.
- **Проблема:** пронумерований треклист — канонічний `<ol>`; замість нього
  `<p>` з `<small>` для номера. Скрінрідер не оголошує «список, 12 елементів»
  і не дає перескочити його; у `playlist/[id].vue` маркер `list-decimal`
  застосовується до `<li>`, що лежать у `<div>`, тобто структура невалідна.
- **Severity:** P1 (playlist — невалідний HTML), P2 для решти.
- **Вплив:** кожна детальна сторінка релізу, треку, артиста, події і плейліста
  плюс `/tracks` — тобто весь Read-шар каталогу — без списочної навігації.
- **Стандарт:** quality-gate MUST «Lists are list elements».
- **Ремедіація:** `<ol class="list-none">` + `<li>` для треклістів і лайнапу
  (номер лишається в `<small class="font-mono">`, як зараз), `<ul>` для
  зв'язків, `<ol>` + `<li>` для рядків `PagePlayer`; у `playlist/[id].vue`
  винести реліз у власний `<li>` з вкладеним `<ol>`. Клас `mb-2` переноситься
  з глобального `p` на `li`, щоб вертикальний ритм не змінився.

### T13. Надлишкові й невірні alt-тексти всередині посилань

- **Локація:** `app/components/Item.vue:50,59,68` («{title} Cover Thumbnail» /
  «Photo Thumbnail» / «Flyer Thumbnail» поруч із видимим `{title}`),
  `app/components/RelativeItem.vue:28,36` («{title} thumbnail»),
  `app/pages/news.vue:100` («{title} Thumbnail»), `app/components/Header.vue:47`
  («Sentimony Records Logo SVG» у посиланні з текстом «Sentimony Records»),
  `app/components/buttons/PrimaryButton.vue:29` і `DefaultButton.vue:43`
  (`:alt="img + ' icon'"` — alt дорівнює **URL** SVG плюс слово «icon»:
  «https://content.sentimony.com/assets/img/svg-icons/qobuz-2.svg?01 icon»).
- **Проблема:** зображення в посиланні з видимим текстом декоративне і має
  бути `alt=""`; інакше доступна назва посилання подвоюється («Frog Prog
  «Songs Of Buffo» Cover Thumbnail Frog Prog «Songs Of Buffo»»). У кнопках
  посилань alt узагалі складено з адреси файлу.
- **Severity:** P1 для `PrimaryButton`/`DefaultButton` (кнопки «Qobuz»,
  «Diggers Factory», «Ektoplazm» оголошуються з URL), P2 для решти.
- **Вплив:** кожна картка каталогу (102 релізи, понад 200 артистів на одній
  сторінці) читається двічі; три сервісні кнопки на сторінці релізу — з
  адресою файлу.
- **Стандарт:** quality-gate MUST «Images have `alt` text that conveys their
  purpose, or `alt=""` when they are decorative».
- **Ремедіація:** `alt=""` для картинок у посиланнях із текстом (`Item`,
  `RelativeItem`, `news`, логотип у `Header`); у `PrimaryButton`/`DefaultButton`
  — `alt=""` (текст кнопки вже є в `title`). Юніт-перевірка в
  `accessibleNames.test.ts`.

### T14. Шість iframe-ів без пробілу в назві, один — без назви

- **Локація:** `app/pages/release/[id].vue:184,220`, `app/pages/artist/[id].vue:261`,
  `app/pages/video/[id].vue:101`, `app/pages/playlist/[id].vue:117,154` —
  `:title="item.title + 'YouTube video player'"` без пробілу («Songs Of
  BuffoYouTube video player»); `app/pages/artist/[id].vue:276-283` — SoundCloud
  iframe без `title` узагалі.
- **Проблема:** `title` iframe — його доступна назва; злиплий рядок читається
  як одне слово, а відсутній — оголошується як «frame».
- **Severity:** P1 для безіменного iframe, P3 для пробілу.
- **Стандарт:** quality-gate MUST «Icon-only controls carry an accessible
  name» (iframe без назви — той самий клас).
- **Ремедіація:** пробіл у шести місцях (`track/[id].vue:213,231` уже
  правильні — взяти за зразок), `title` на SoundCloud iframe артиста.

### T15. `color-scheme` не оголошено (T6, відкрито з 2026-09-01)

- **Локація:** `nuxt.config.ts:41-50` (`meta` без `color-scheme`),
  `app/assets/css/tailwind.css:12,45` (`:root` / `.dark` без `color-scheme`).
- **Проблема / вплив / стандарт:** як у T6 аудиту 2026-09-01 — нативні
  скролбари, автозаповнення й дефолтні контроли лишаються світлими в темній
  темі.
- **Severity:** P2.
- **Ремедіація:** `<meta name="color-scheme" content="dark light">` у
  `app.head.meta` + `color-scheme: light` у `:root` і `color-scheme: dark` у
  `.dark`.

### T16. Три списки без станів завантаження, помилки й порожнечі

- **Локація:** `app/pages/tracks.vue:39-40` (`useReleases` + `useFetch('/api/tracks')`
  без `status`/`error`), `app/pages/releases/all.vue:4-6`,
  `app/pages/artists/all.vue:6-8` (`useAsyncData` без деструктуризації
  `status`/`error`).
- **Проблема:** V3 закрила вісім списків, ці три лишилися на щасливому
  шляху: відмова `/api/tracks` дає порожню сторінку «Tracks» зі статистикою
  «0 tracks», `/releases/all` без релізів виглядає як порожній каталог.
- **Severity:** P2.
- **Вплив:** `/tracks` — єдина сторінка, що показує весь каталог треків;
  `/releases/all` і `/artists/all` — точки входу для прихованих записів.
- **Стандарт:** quality-gate MUST «Every surface that can load, be empty, or
  fail has a designed state for each».
- **Ремедіація:** підключити `CollectionStatus` так само, як у
  `releases/index.vue:40-47`.

### T17. Немає `height` у зображень поза каталожними картками

- **Локація:** `app/components/OpenImage.vue:69-76` (T11: лише `:width`),
  `app/components/RelativeItem.vue:25-39` (`width="24"` без `height`),
  `app/pages/artist/[id].vue:340-345` (портфоліо, ні `width`, ні `height`),
  `app/pages/friend/[id].vue:49-54` (ні `width`, ні `height`).
- **Проблема:** до завантаження блок має нульову висоту, вміст під ним
  стрибає. У `OpenImage` це перший екран кожної з семи детальних сторінок.
- **Severity:** P2.
- **Стандарт:** quality-gate MUST «Images … declare dimensions or an aspect
  ratio so nothing shifts when they load».
- **Ремедіація:** `OpenImage` — `:height` за `ratio` (190 для `square`, 158
  для `video` при ширині 280); `RelativeItem` — `height="24"`; портфоліо —
  `width`/`height` (контейнер уже `aspect-square`); друг — `width="120"` +
  `height`.

### T18. Хардкоджені кольори повз шар токенів (T8, інвентар уточнено)

- **Локація:** `#b5ccb5` — `app/components/SvgTriangle.vue:9`,
  `app/components/Testimonials.vue:14`, `app/assets/css/tailwind.css:213,215`;
  `#2a4030` — `Testimonials.vue:14`, `tailwind.css:214,216`;
  `app/components/AudioMixPlayer.vue:48` (`accent-[#144B15]` /
  `dark:accent-[#4e8b52]`); `app/components/HomepageAtmosphere.vue:16,47,59` +
  градієнти в рядках 41-43, 55, які дослівно дублюють `tailwind.css:163-169`.
- **Проблема:** один і той самий колір поверхні «мох» живе в чотирьох місцях
  без імені; фонова композиція головної описана двічі (глобально в
  `tailwind.css` і локально в `HomepageAtmosphere.vue`) — зміна одного не
  зачепить другого.
- **Severity:** P3.
- **Вплив:** правка палітри — ручний обхід семи місць; `SvgTriangle` і
  `Testimonials` розійдуться при першій правці.
- **Ремедіація:** `--color-moss: #b5ccb5` / `--color-moss-dark: #2a4030` у
  `@theme`, `bg-moss` / `fill-moss` у споживачах; градієнти головної —
  `--forest-tint-light` / `--forest-tint-dark` у `:root` і посилання з обох
  файлів; `AudioMixPlayer` — на `.player-range` (T19).

### T19. Повзунок міксу без імені й поза стилем плеєра

- **Локація:** `app/components/AudioMixPlayer.vue:46-55`.
- **Проблема:** `input[type=range]` без `aria-label` (обидва повзунки
  `GlobalPlayer` і `PlayerSeek` названі — `GlobalPlayer.vue:213`,
  `PlayerSeek.vue:33`); стилізований `accent-[#144B15]` замість спільного
  `.player-range`, тому на сторінці артиста два різні повзунки поруч (мікс і
  Sentimony-треки).
- **Severity:** P1 (безіменний контрол) + P3 (drift).
- **Вплив:** табка «Mix» на сторінках артистів із міксом; скрінрідер
  оголошує «slider» без назви.
- **Стандарт:** quality-gate MUST «Form controls have a programmatically
  associated label».
- **Ремедіація:** `aria-label="Seek"` і клас `player-range` зі `--progress`,
  як у `PlayerSeek`.

## Ізольовані дефекти

### T20. Контраст футера (T7, відкрито з 2026-09-01)

- **Локація:** `app/components/Footer.vue:13` — `text-white/50` на
  `bg-black/90 dark:bg-black/75` поверх глобального фонового зображення.
- **Severity:** P2. Решта як у T7: 0.5 тримає поріг 0.46 лише за умови
  непрозорого чорного під ним, якого немає.
- **Ремедіація:** `text-white/70`. Зміна потрапляє в snapshot
  `homepage-theme.spec.ts`, тож знімки оновлюються свідомо, разом із цим
  пунктом.

### T21. `hover:text-white/80` у світлій темі на `/artists/all`

- **Локація:** `app/pages/artists/all.vue:71`.
- **Проблема:** єдиний у проєкті hover без `dark:`-пари, який ставить білий
  текст на світлому фоні: наведення в світлій темі робить ім'я артиста
  майже невидимим.
- **Severity:** P2.
- **Стандарт:** quality-gate CONTEXTUAL «Contrast requirements hold in every
  theme independently».
- **Ремедіація:** `hover:text-foreground/80` або патерн `RelativeItem.vue:22`
  (`hover:text-emerald-900 dark:hover:text-emerald-100`).

### T22. Дублікат CSS-карти висот iframe-ів у двох сторінках

- **Локація:** `app/pages/release/[id].vue:317-353` і
  `app/pages/track/[id].vue:298-328` — два незкоупені `<style>` з класами
  `.BandcampIframe.tracks-N` / `.SoundcloudIframe.tracks-N`; карти різні
  (реліз має `tracks-22/25/27`, трек — ні).
- **Проблема:** обидва блоки глобальні, тож після переходу
  реліз → трек у документі живуть обидві карти, і яка переможе для
  `tracks-22` залежить від порядку монтування. Це drift дизайн-системи, а не
  лише дублікат.
- **Severity:** P3.
- **Ремедіація:** одна карта в `tailwind.css` (об'єднання обох), обидві
  сторінки без `<style>`.

### T23. Розділювачі свайпера артистів (V5, частково відкрито)

- **Локація:** `app/components/Swiper.vue:137-150`.
- **Проблема:** підпис категорії `text-[8px]` у слайді з
  `!pointer-events-none`; для скрінрідера це текст посеред списку, не
  структура.
- **Severity:** P3 (колір уже виправлено).
- **Ремедіація:** `role="separator"` + `aria-label` категорії на слайд і
  `text-[10px]`. Розмір змінює пікселі маскованої області снапшоту
  (`.swiper-artist` замасковано в `homepage-theme.spec.ts:270`), тож знімки
  не зачіпає — але лишається візуальним рішенням власника.

### T24. Медіа-колонка детальних сторінок рендериться лише на клієнті

- **Локація:** `app/components/Tabs.vue:18` (`<ClientOnly>` навколо
  `TabsRoot`), споживачі — сім детальних сторінок.
- **Проблема:** плеєр, треклист `PagePlayer` і embed-и відсутні в SSR-HTML;
  колонка з'являється після гідратації і зсуває вміст. Коміт, що додав
  обгортку (`4d2dc39` «netlify experiment, huge upd»), не пояснює причини.
- **Severity:** P2.
- **Вплив:** CLS на кожній детальній сторінці; текст треклісту не бачать
  краулери.
- **Ремедіація:** потребує перевірки в браузері, чи гідратація reka-ui
  `TabsRoot` без `ClientOnly` дає розбіжність id. Якщо ні — прибрати
  обгортку; якщо так — лишити `ClientOnly` лише навколо `TabsList`, а вміст
  першого таба рендерити на сервері. Поза скоупом нічної сесії: потрібен
  живий прогін.

## Не перевірено

Браузер не запускався: реальні ratio контрасту, поведінка `OpenSidebar` з
`:modal="false"`, горизонтальне переповнення на 320px, розміри hit-area в
свайпері, причина `ClientOnly` у `Tabs`. Це кандидати на `web-debug`.

## Ремедіації, які бере ця сесія

Усі пункти нижче — семантика, атрибути, токени й тексти; композиція не
змінюється. Кожен закріплюється юніт-тестом по джерелу.

1. T12 списки (усі локації).
2. T13 alt-тексти (усі локації).
3. T14 назви iframe-ів.
4. T15 `color-scheme`.
5. T16 `CollectionStatus` на трьох сторінках.
6. T17 розміри зображень.
7. T18 токени кольорів і спільні градієнти.
8. T19 повзунок міксу.
9. T20 контраст футера (зі свідомим оновленням снапшотів).
10. T21 hover на `/artists/all`.
11. T22 одна карта висот iframe-ів.
12. V7 накладена прозорість (`LikeButton`, `PagePlayer`, `Header`).
13. V8 копірайт («Related», латинська «C», один рядок заглушки).
14. V9 `<h1>` з повною назвою.
15. V11 порожні абзаци й прихована секція на сторінці артиста.

## Потребує рішення власника (не в скоупі сесії)

- **V1 (CTA на головній)** і **V4 (другий рядок картки)** — продуктові рішення
  про композицію.
- **V10 (сторінка друга)** — залежить від того, які поля є в каталозі.
- **T23 (розділювачі свайпера)** — візуальне рішення про розмір.
- **T24 (`ClientOnly` у `Tabs`)** — потребує живого прогону.
