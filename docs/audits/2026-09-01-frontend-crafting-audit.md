# Аудит фронтенду за скілом frontend-crafting

- Дата: 2026-09-01
- Гілка: `main` (`e96a3d2`)
- Скіл: `.claude/skills/frontend-crafting`, workflow `review`
- Обсяг: shell (`app/layouts/default.vue`, `Header`, `Footer`, `OpenSidebar`,
  `Overlay`, `ThemeToggle`, `app/app.vue`, `app/error.vue`), головна
  (`index.vue`, `Hero`, `Fractal`, `HomepageAtmosphere`, `Testimonials`,
  `Swiper`), списки (`releases/*`, `artists/*`, `tracks`, `videos`, `events`,
  `playlists`, `friends`, `news`, `Item`, `GenreTabs`, `ReleasesFiltered`),
  детальні сторінки (`release|artist|track|video|event|playlist|friend/[id]`,
  `Tabs`, `Tab`, `OpenImage`, `EntityLinks`), auth (`AuthCard`, `AuthForm`,
  `PasswordInput`, 5 сторінок), profile (7 сторінок + два спільні компоненти),
  плеєр (`GlobalPlayer`, `PagePlayer`, `PlayerControls`, `PlayerSeek`,
  `PlayerTrackInfo`, `AudioBridge`), примітиви `app/components/ui/*`,
  `app/assets/css/tailwind.css`.
- Попередні аудити, чиї знахідки перевірено повторно:
  [2026-07-25 auth](2026-07-25-auth-theme-contrast-audit.md),
  [2026-07-26 profile](2026-07-26-profile-pages-audit.md).

## Методика та обсяг

Аудит виконано читанням джерел плюс статичним інвентарем класів і атрибутів;
браузер не запускався, замірів контрасту в рендері не робилося.

**Вибірка.** Кожен файл у `app/layouts/`, `app/components/` (окрім
`app/components/ui/*`, звідки відкрито `button`, `input`, `alert`) і кожна
сторінка в `app/pages/` пройшли через grep-baseline; далі кожен збіг відкрито в
джерелі перед тим, як стати знахідкою. Пороги контрасту взято з аудиту
2026-07-25 (світла тема: чорний текст потребує альфи ≥ 0.56 для AA 4.5; темна:
білий ≥ 0.46) — свої заміри не додавали б інформації там, де знайдені рівні
лежать нижче з великим запасом.

**Поверхні та їхні режими** (за класифікацією скіла):

| Група | Режим | Файли |
|---|---|---|
| Головна | Persuade + Experience | `index.vue`, `Hero`, `Fractal`, `HomepageAtmosphere`, `Testimonials` |
| Списки каталогу | Persuade → Operate | `releases/*`, `artists/*`, `tracks`, `videos`, `events`, `playlists`, `friends`, `news`, `Item`, `GenreTabs` |
| Детальні сторінки | Read | сім `[id].vue`, `Tabs`, `OpenImage`, `ItemContent`, `RelativeItem` |
| Auth | Operate | `signin`, `signup`, `forgot-password`, `reset-password`, `confirm` |
| Profile | Operate | `profile.vue` + шість підсторінок |
| Плеєр | Operate (наскрізний) | `player/*`, `AudioBridge` |
| Shell | наскрізний | `layouts/default.vue`, `Header`, `Footer`, `OpenSidebar` |

**Свідомі винятки.** `app/pages/confirm.vue` — сторінка-редирект без власного
UI. `app/pages/ui.vue` — внутрішній UI-kit; його оцінено лише як споживача
примітивів, не як публічну поверхню (він у `noindexRoutes`).

**Чисті перевірки** (нуль знахідок, обсяг названо):

- `transition: all` / `transition-all` — 0 входжень у всьому `app/`.
- Безумовний `outline-none` на інтерактиві — 0; усі п'ять решток мають
  заміну: `OpenSidebar.vue:66` і `OpenImage.vue:89` — це `focus:` на контейнері
  діалога, який reka-ui фокусує програмно; `ThemeToggle.vue:9` —
  `focus-visible:outline-none` у парі з видимим `ring`; `Header.vue:129,138` —
  `outline-none` разом із `data-[highlighted]:bg-*`, тобто roving-підсвіткою
  reka-ui в меню акаунта. Follow-up аудиту 2026-07-26 закрито.
- `<img>` без розмірів у каталозі — 0: `Item.vue` віддає `width`/`height` під
  кожну з трьох категорій, `Header`, `Testimonials`, `index.vue` теж.
- `positive tabindex` — 0 входжень.
- Anti-pattern «вкладені картки» — 0: `Card` вживається лише в auth і profile,
  без вкладення.
- Знахідки аудиту 2026-07-26 виправлені: `server/api/track-likes/tracks.get.ts`
  селектить канонічний набір колонок, `/ui` додано до `noindexRoutes`,
  `ProfileCollectionStatus` розрізняє error, loading і empty.

---

# Шар 1. Візуальна й досвідна критика

## Що зроблено добре

**Плеєр — найдоглянутіша поверхня проєкту.** `GlobalPlayer.vue` ставить
`:inert="!revealed"` разом із `:aria-hidden`, тож панель, яка ще виїжджає,
недосяжна ані для клавіатури, ані для скрінрідера; кожна іконкова кнопка має
`aria-label`, що змінюється зі станом (`Repeat off` / `Repeat all` /
`Repeat one`), обидва `input[type=range]` названі, а поява панелі має
`motion-reduce:transition-none!`. Це рівень, до якого варто підтягувати решту.

**`Fractal.vue` — приклад того, як робити декоративний рух.** Шість секунд
обертання на кожній зміні маршруту могли б бути найгрубішим порушенням
`prefers-reduced-motion` у проєкті; натомість кожен із чотирьох вкладених шарів
несе власний `motion-reduce:animate-none!` або `motion-reduce:transition-none!`,
а контейнер — `aria-hidden="true"`. Мотив теж чесний: мандала-«пелюстки» — це
візуальна мова психоделічного лейблу, а не градієнт заради градієнта.

**`Testimonials.vue` уникає найтиповішої підробки.** Замість вигаданих відгуків
у три колонки — один справжній підпис («@ Ihor») із фото артиста лейблу і
проханням лишити коментар на YouTube/SoundCloud/Bandcamp. Це працює саме тому, що не вдає
соціальний доказ, якого немає.

## Системні знахідки

### V1. Головна не має `<h1>` і не робить обіцянки

- **Локація:** `app/pages/index.vue:39-54`, `app/components/Hero.vue:22-46`.
- **Проблема:** `Hero` рендерить «Sentimony / Records / Psychedelic Music Label»
  трьома `<div>` з letter-spacing до 20px, а `index.vue` під ним відкривається
  логотипом і трьома абзацами історії лейблу. Жодного `<h1>` на сторінці немає,
  і жодного заклику — ні «послухати останній реліз», ні посилання на
  `/releases`. Persuade-поверхня, яка не називає одну дію.
- **Severity:** P1.
- **Вплив:** відвідувач, що прийшов уперше, бачить назву й історію з 2006 року,
  але не дізнається, що зробити далі; шлях до музики — через хедер або свайпери,
  які на мобільному нижче фолда. Плюс структурна втрата: сторінка без `h1`.
- **Ремедіація:** підняти `Sentimony Records` у `Hero` до `<h1>` (візуальний
  розмір лишається класами, рівень — семантика), додати під описом один
  первинний CTA на останній реліз або `/releases`. Кнопка «play» у
  `GlobalPlayer` уже вміє грати останній реліз (`playLatestRelease`) — на
  головній це варте видимого дубля.

### V2. Третій текстовий рівень живий у всьому каталозі

- **Локація:** `app/pages/release/[id].vue:115-141`, `track/[id].vue:134-141`,
  `artist/[id].vue:140-157`, `event/[id].vue:117-135`, `video/[id].vue:65-80`,
  `playlist/[id].vue:89`, `tracks.vue:103`, `news.vue:98`,
  `components/EntityLinks.vue:47`, `components/Swiper.vue:188,191`,
  `components/ui/button/index.ts:20` (`soft`).
- **Проблема:** AGENTS.md фіксує два семантичні рівні тексту й прямо каже, що
  `/40` і `/50` не проходять WCAG AA у світлій темі. Проте `text-foreground/50`
  зустрічається 39 разів, `/40` — тричі, `/25` — раз, і майже все це — лейбли
  метаданих на детальних сторінках («Release Date:», «Catalog Number:»,
  «Styles:», «BPM:»), тобто рівно той контент, заради якого сторінку відкрили.
- **Severity:** P1 (як візуальна незлагодженість; технічний бік — T1).
- **Вплив:** метадані релізу — головна причина заходу на сторінку релізу для
  колекціонера; вони набрані найтьмянішим відтінком на сторінці. Правило
  проєкту при цьому існує й захищене тестом — але тільки для auth і profile.
- **Ремедіація:** замінити на `text-muted-foreground` у всіх перелічених місцях;
  для `soft`-варіанта кнопки — `text-muted-foreground` замість
  `text-foreground/40`. Розширити блок у `tests/unit/interactionStates.test.ts`
  на детальні сторінки каталогу, інакше рівень повернеться.

### V3. Порожній і помилковий стан списків не спроєктовано взагалі

- **Локація:** прочитано `app/pages/releases/index.vue:30-40`,
  `artists/index.vue:36-60` і `tracks.vue:92-120`; за тим самим патерном
  (`useXxx()` без деструктуризації `error`/`status`) написані `videos.vue`,
  `events.vue`, `playlists.vue`, `friends.vue`, `news.vue` і
  `components/ReleasesFiltered.vue` — вони перевірені грепом на відсутність
  `error`/`pending`, але не відкриті порядково.
- **Проблема:** сторінка списку — це `useXxx()` без `error`/`pending` і
  `v-for` по відсортованому масиву; `artists/index.vue` розкладає той самий
  масив на чотири `<h2>`-секції, тож при порожньому результаті лишаються
  чотири заголовки без вмісту. Якщо `/api/releases` віддасть помилку або
  фільтр не дасть збігів, під `<h1>Releases</h1>` лишається порожня смуга без
  тексту. `ProfileCollectionStatus.vue` уже вміє всі три стани — але живе тільки
  в profile.
- **Severity:** P1.
- **Вплив:** відмова API виглядає як «у лейблу немає релізів». Найпомітніше на
  `/releases/ungrouped`, де порожній результат — штатна можливість.
- **Ремедіація:** винести логіку `ProfileCollectionStatus` у нейтральний
  `CollectionStatus` і прокинути `status`/`error` з `useAsyncData` у списки;
  для `ReleasesFiltered` додати текст порожнього фільтра.

## Ізольовані знахідки

### V4. Каталожні картки не показують того, за чим у каталог приходять

- **Локація:** `app/components/Item.vue:33-91`.
- **Проблема:** `Item` — універсальна картка для релізу, артиста, відео, події
  та плейліста — рендерить обкладинку і назву. Для релізу не видно ні артиста,
  ні року, ні каталожного номера; для події — ні дати, ні міста. Бейджі
  («Coming Soon», «Out Now») є, тобто механізм для другого рядка вже вбудований.
- **Severity:** P2.
- **Вплив:** на `/releases` (102 релізи в `server/data/sentimony-db.yml`) відвідувач змушений
  відкривати картку, щоб дізнатися артиста; сітка стає рядом обкладинок без
  інформації, за якою її можна сканувати. За класифікацією скіла — структура,
  що не несе змісту.
- **Ремедіація:** дати `Item` опційний другий рядок за категорією: артист для
  релізу, дата й місто для події. Дані вже є в `ItemEntity`.

### V5. Секційні розділювачі свайпера артистів нечитні

- **Локація:** `app/components/Swiper.vue:139-147`.
- **Проблема:** підпис категорії («Producers», «DJs», «Mastering»,
  «Designers») набрано `text-[8px]` у `text-foreground/25`, вертикально, з
  `writing-mode: vertical-rl`. Слайд позначено `!pointer-events-none`, тобто до
  нього не дістатися ні мишею, ні клавіатурою.
- **Severity:** P2.
- **Вплив:** єдиний навігаційний орієнтир у стрічці з понад двохсот артистів
  практично невидимий; для скрінрідера він теж не структура, а звичайний текст
  посеред списку.
- **Ремедіація:** підняти до `text-[10px]` і `text-muted-foreground`, а групи
  розмітити семантично (наприклад, `role="separator"` з `aria-label` категорії).

### V6. `app/error.vue` живе поза системою

- **Локація:** `app/error.vue:14-27`.
- **Проблема:** сторінка помилки має власну кнопку з `class="transition-background …"`
  (такої утиліти в Tailwind немає — перехід просто не працює) замість
  `PrimaryButton`, набрана `text-white` без токенів, тож у світлій темі білий
  текст лягає на світлий фон, і показує лише код та `statusMessage`.
- **Severity:** P1.
- **Вплив:** 404 — сторінка, яку в каталозі зі старими зовнішніми посиланнями
  бачать регулярно; у світлій темі вона близька до нечитної, і не пропонує
  нічого, крім «Go Home», хоча пошук по релізах був би доречнішим.
- **Ремедіація:** перевести на `text-foreground` і `PrimaryButton`, прибрати
  мертвий клас, додати посилання на `/releases` і `/artists`.

### Текст інтерфейсу

Прочитано видимі рядки в тих файлах, які відкривались порядково: shell
(`Header`, `Footer`, `OpenSidebar`, `error.vue`), головна (`Hero`, `index.vue`,
`Testimonials`), `releases/index.vue`, `artists/index.vue`, `tracks.vue`,
`GenreTabs`, `AuthCard`, `ProfileCollectionStatus`, `OpenImage`, плеєр. Плейсхолдерів, вигаданих цифр і обірваних рядків немає; capitalization
послідовний (Title Case для навігації й кнопок). Дві дрібниці, обидві в
`app/components/OpenImage.vue`: рядок-заглушка «Image is coming ⛄» вшитий
HTML-літералом (`comingImage`, рядок 39) і подається через `v-html`, хоча це
звичайний текст; у `PagePlayer.vue:167` та сама ідея звучить інакше — «Music is
coming». Одна відсутність контенту, два різні формулювання.

---

# Шар 2. Технічні знахідки

## Системні патерни

### T1. Немає жодного орієнтира-лендмарка, крім `<main>` у profile

- **Локація:** `app/layouts/default.vue:107-176` (весь шаблон),
  `app/components/Header.vue:35`, `app/components/Footer.vue:13`.
- **Проблема:** макет побудований на вкладених `<div>`. `<header>`, `<nav>`,
  `<main>`, `<footer>` не використано ніде, окрім `app/pages/profile.vue:32,34`.
  Скіп-лінка теж немає — перевірено `app/layouts/*` і `app/app.vue`.
- **Severity:** P0.
- **Вплив:** користувач скрінрідера не може перейти до основного вмісту
  штатною навігацією по лендмарках, а користувач клавіатури на кожній сторінці
  проходить логотип, вісім пунктів навігації, соцпосилання, перемикач теми й
  меню акаунта, перш ніж дістатися вмісту. На детальних сторінках перед вмістом
  ще й свайпер із сотнями фокусованих карток.
- **Стандарт:** quality-gate MUST «Landmark structure exists: header,
  navigation, main, footer. One `<main>` per page» і MUST «A skip link lets a
  keyboard user jump past repeated navigation». P0, а не P1, попри формальний
  обхідний шлях (протабувати навігацію повністю): на детальних сторінках між
  хедером і вмістом стоїть свайпер із сотнями фокусованих карток, тож обхід
  коштує стільки, що перестає бути обхідним шляхом.
- **Ремедіація:** у `layouts/default.vue` обгорнути `<slot/>` у `<main id="main">`,
  замінити кореневі `<div>` у `Header.vue` і `Footer.vue` на `<header>` і
  `<footer>`, блок навігації в обох — на `<nav aria-label="Main">`, і додати
  першим елементом шаблону скіп-лінку на `#main`. `profile.vue` після цього має
  віддати свій `<main>`, щоб не було двох.

### T2. Фокус видно тільки на посиланнях і на кнопках із примітива

- **Локація:** `app/assets/css/tailwind.css:107-117` (правило лише для
  `a:focus-visible` і `button.password-toggle`),
  `app/components/ui/button/index.ts:7` (база cva має `focus-visible:outline-*`).
  Кнопки поза цими двома шляхами: `Header.vue:102` (тригер меню акаунта),
  `OpenSidebar.vue:39` (бургер),
  `OpenSidebar.vue:110` (перемикач теми в шухляді),
  `GlobalPlayer.vue:136,180,196` (repeat, like, mute),
  `PlayerControls.vue:29,41,54` (prev/play/next),
  `PlayerSeek.vue:19` і `GlobalPlayer.vue:207` (два `input[type=range]`),
  `PagePlayer.vue:176,210`, `Swiper.vue:159,164` (стрілки), `error.vue:18`.
- **Проблема:** глобальне правило написано під селектор `a`, а не `:is(a, button)`,
  тож усі перелічені `<button>` покладаються на дефолтний браузерний фокус —
  який на темному напівпрозорому тлі цих панелей ледь помітний. Для повзунків
  ситуація гірша: `.player-range` (`tailwind.css:217-258`) перевизначає
  `appearance` і малює власний трек та повзунок, але жодного правила
  `:focus-visible` у цьому блоці немає.
- **Severity:** P0.
- **Вплив:** керування плеєром із клавіатури можливе, але користувач не бачить,
  де він; те саме в мобільному меню, яке відкривається саме кнопкою.
- **Стандарт:** quality-gate MUST «Focus is always visible».
- **Ремедіація:** розширити правило в `tailwind.css` до
  `:is(a, button, [role="button"], input[type="range"], summary):focus-visible`;
  це закриває всі перелічені місця однією зміною. Наявний тест
  `non-primitive focus` у `tests/unit/interactionStates.test.ts` варто
  доповнити перевіркою селектора.

### T3. Клікабельна прев'ю зображення — `<div>` із `@click`

- **Локація:** `app/components/OpenImage.vue:31-36`.
- **Проблема:** тригер діалога повного розміру — `<div class="cursor-pointer" @click="open">`,
  а не `<DialogTrigger as-child><button>`, хоч reka-ui тут уже підключено і в
  тому ж файлі `DialogClose as-child` використано правильно.
- **Severity:** P0.
- **Вплив:** `OpenImage` — єдиний шлях до повнорозмірної обкладинки, і він стоїть
  на кожній із семи детальних сторінок. З клавіатури зображення не відкрити,
  скрінрідер не бачить тут керування взагалі.
- **Стандарт:** quality-gate MUST «Use `<button>` for actions… A `div` with a
  click handler is never navigation»; anti-patterns «Inaccessible interaction».
- **Ремедіація:** обгорнути прев'ю в `<DialogTrigger as-child>` з `<button type="button">`
  і доступним іменем на кшталт `Open full-size image: {{ alt }}`; `@click="open"`
  тоді зайвий, стан веде `DialogRoot`.

### T4. Іконкові таби детальних сторінок без доступного імені

- **Локація:** `app/components/Tabs.vue:12,26-40`; споживач із п'ятьма табами —
  `app/pages/release/[id].vue:150-211`.
- **Проблема:** `hideTitles` вмикається при `orderedTabs.length >= 5` і ховає
  `<span>` з назвою, лишаючи в `TabsTrigger` саму `<Icon>`. Назва йде тільки в
  `TooltipContent`, який reka-ui не зв'язує з тригером як `aria-label` чи
  `aria-labelledby` — тултип тут окремий вузол поруч.
- **Severity:** P0.
- **Вплив:** на сторінці релізу з п'ятьма табами скрінрідер оголошує п'ять
  безіменних вкладок; тултип до того ж недосяжний із сенсорного пристрою.
- **Стандарт:** quality-gate MUST «Icon-only controls carry an accessible name».
- **Ремедіація:** додати `:aria-label="plainTitle(tab.info.title)"` на
  `TabsTrigger`, коли `hideTitles` істинне (функція `plainTitle` уже є в файлі).

### T5. Розділ каталогу без сигналу зміни стану плеєра

- **Локація:** `app/components/AudioBridge.vue` (жодного `aria-live` у файлі),
  `app/components/player/GlobalPlayer.vue:159-171`.
- **Проблема:** зміна треку — при переході по черзі, при `next`/`prev`, при
  repeat — оновлює `PlayerTrackInfo` без жодного live-region. Media Session
  оновлюється, але це системний рівень, не сторінка.
- **Severity:** P1.
- **Вплив:** для користувача скрінрідера трек змінюється безшумно: наступний
  трек уже грає, а сторінка про це не повідомила.
- **Стандарт:** quality-gate MUST «Status that appears without a page change …
  is announced through a polite live region».
- **Ремедіація:** додати у `GlobalPlayer` візуально прихований
  `<p aria-live="polite">`, що містить «{artist} - {name}» поточного треку.

## Ізольовані дефекти

### T6. `color-scheme` не оголошено

- **Локація:** `app/app.vue:6-11` (`useHead` ставить лише `htmlAttrs.lang`),
  `nuxt.config.ts` (збігів `color-scheme` немає у всьому `app/`).
- **Проблема:** проєкт має дві теми і перемикач, але браузеру не сказано, які
  схеми підтримуються.
- **Severity:** P2.
- **Вплив:** нативні контроли — скролбари, дефолтні `input[type=range]` до
  застосування стилів, автозаповнення, колір адресного рядка на мобільних —
  лишаються світлими в темній темі. Найпомітніше на скролбарі.
- **Стандарт:** quality-gate CONTEXTUAL «The browser is told which color schemes
  are supported».
- **Ремедіація:** додати `<meta name="color-scheme" content="dark light">` у
  `app.head` поряд з інлайн-скриптом теми і `color-scheme: dark` / `light` у
  `.dark` та `:root` у `tailwind.css`.

### T7. Тьмяний текст футера в парі з локальним `--ring`

- **Локація:** `app/components/Footer.vue:13`.
- **Проблема:** увесь футер набрано `text-white/50` на `bg-black/90`. Аудит
  2026-07-25 встановив поріг ≥ 0.46 альфи для білого — 0.5 проходить його
  впритул, але тільки поки під футером справді `black/90`; сам футер стоїть
  поверх глобального фонового зображення й градієнта з `tailwind.css`, тобто
  фактичний фон світліший за розрахунковий.
- **Severity:** P2.
- **Вплив:** контакти й навігація футера на межі AA; запас з'їдається фоном.
- **Стандарт:** quality-gate MUST «Body text meets a contrast ratio of at least
  4.5:1».
- **Ремедіація:** підняти до `text-white/70` або зробити підкладку футера
  непрозорою (`bg-black`), тоді 0.5 тримає поріг із запасом. Локальний
  `[--ring:oklch(1_0_0_/_65%)]` коректний і синхронізований тестом — його не
  чіпати.

### T8. Хардкоджені кольори повз шар токенів

- **Локація:** `app/components/AudioMixPlayer.vue:48`
  (`accent-[#144B15] dark:accent-[#4e8b52]`), `app/components/Testimonials.vue:14`
  (`bg-[#b5ccb5]/85` / `dark:bg-[#2a4030]/85`), `app/components/SvgTriangle.vue:9`
  (`fill="#b5ccb5"`), `app/components/HomepageAtmosphere.vue:16,47,59`.
- **Проблема:** сім літеральних значень поза `@theme`. `#b5ccb5` при цьому
  повторюється у двох файлах — це вже спільний колір без імені.
- **Severity:** P3.
- **Вплив:** зміна палітри вимагає ручного обходу; `SvgTriangle` і
  `Testimonials` розійдуться при першій же правці одного з них. Контраст ці
  значення не ламають — `Testimonials` явно задає `text-black`/`dark:text-white`
  під свій фон.
- **Ремедіація:** винести `#b5ccb5` і `#2a4030` у `@theme` як токен поверхні
  (наприклад `--color-surface-moss`) і послатися з обох файлів; акцент
  `AudioMixPlayer` звести до наявного emerald, який уже вживає плеєр.

### T9. Зупинки прокрутки не зарезервовано під липкі панелі

- **Локація:** `app/components/Header.vue:35` (`sticky top-0`, висота 72px),
  `app/components/player/GlobalPlayer.vue:106` (`sticky bottom-0`, мінімум 71px),
  `app/assets/css/tailwind.css` (жодного `scroll-padding` чи `scroll-margin` у файлі).
- **Проблема:** сторінка має липку панель зверху й знизу, але
  `scroll-padding-block` на `html` немає.
- **Severity:** P2.
- **Вплив:** під час табування вниз по довгому треклісту або сітці релізів
  сфокусований елемент опиняється під хедером або під панеллю плеєра — фокус є,
  але його не видно; це підсилює T2.
- **Стандарт:** quality-gate MUST «A sticky header, footer, or toolbar never
  covers the element that just received focus».
- **Ремедіація:** `html { scroll-padding-top: 5rem; scroll-padding-bottom: 6rem }`
  у `tailwind.css`.

### T10. Стрілки свайпера — кнопки без імені й без вмісту

- **Локація:** `app/components/Swiper.vue:159-167` (`<button class="swiper-button-next" v-wave />`),
  стилі — там же, рядки 191-196.
- **Проблема:** обидві кнопки порожні; іконка приходить із CSS-псевдоелемента
  теми Swiper, тож доступного імені немає ні з тексту, ні з атрибута.
- **Severity:** P1.
- **Вплив:** дві безіменні кнопки в табуляції кожної детальної сторінки. Клавіші
  стрілок працюють (модуль `Keyboard` увімкнено), тож функціональність
  доступна — це і тримає знахідку на P1, а не P0.
- **Стандарт:** quality-gate MUST «Icon-only controls carry an accessible name».
- **Ремедіація:** `type="button"` плюс `aria-label="Previous"` / `"Next"`; за
  бажанням `aria-controls` на контейнер свайпера.

### T11. Прев'ю в `OpenImage` без `height`

- **Локація:** `app/components/OpenImage.vue:44-51`.
- **Проблема:** `<img>` отримує лише `:width="imgWidth"`; коментар у файлі
  пояснює, що висота навмисно йде за реальним співвідношенням сторін.
- **Severity:** P2.
- **Вплив:** до завантаження прев'ю блок має нульову висоту, тож блок метаданих
  і кнопки під ним стрибають — на кожній детальній сторінці, у першому екрані.
- **Стандарт:** quality-gate MUST «Images … declare dimensions or an aspect
  ratio so nothing shifts when they load».
- **Ремедіація:** зберігати співвідношення сторін у каталозі й ставити
  `aspect-ratio` на контейнер, або для `ratio: 'square'` (обкладинки — завжди
  квадрат) просто додати `:height="imgWidth"`.

## Не перевірено

Візуального прогону в браузері не було, тож поза охопленням лишилися: реальні
ratio контрасту в рендері (використано пороги аудиту 2026-07-25), поведінка
пастки фокуса в `OpenSidebar` при `:modal="false"`, горизонтальне переповнення
на вузьких екранах і фактичні розміри hit-area в свайпері на дотику. Це кандидати
на прогін `web-debug` окремим кроком.
