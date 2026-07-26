# Auth contrast and focus states

Дата: 2026-07-25. Гілка: `main`. Roadmap: [auth-contrast-focus.md](../../roadmap/auth-contrast-focus.md) (P2).
Аудит із замірами «до»: [2026-07-25-auth-theme-contrast-audit.md](../../audits/2026-07-25-auth-theme-contrast-audit.md).

## Контекст

Аудит `/signin` у світлій і темній темах (Chromium 1440x900, контраст рахований
через canvas-резолв `oklch`/`oklab` з композицією всіх напівпрозорих шарів)
виявив три класи проблем:

1. **Немає індикатора фокусу на головній CTA.** База `buttonVariants` містить
   безумовний `outline-none` і жодного `focus-visible:*`, тому Tab на кнопку
   `Sign In` не дає видимого стану в обох темах. У `app/` до змін було 13
   входжень `outline-none` і 7 call-sites із `focus-visible` у 6 файлах, але
   жоден із них не покривав базу кнопок.
2. **Світла тема системно провалює AA на secondary-тексті.** Токенні рівні
   `text-foreground/40` і `/50` дають 2.58-3.94 замість 4.5. Темна тема тримає
   `/50` (5.36) і провалює `/40` (3.66-3.80).
3. **Поверхня не тримає текст.** `--card` = 4-5% заливки дає 1.08-1.09 контрасту
   проти сторінки, а `backdrop-blur-sm` (4px) не гасить текстуру фонового фото
   лісу, тому лейбли лежать на листі. Під карткою розкид яскравості фону
   становить 1.61x (light) і 1.77x (dark).

Ключове вимірювання, яке визначило напрямок правок: у світлій темі картка
залита **чорним** 4%, і збільшення цієї заливки **погіршує** контраст чорного
тексту (потрібна альфа зростає з 0.58 до 0.65). Тобто у світлій темі поверхня
має світлішати, а не темнішати.

Пороги проти worst-case пікселя фону під карткою:

| тема | текст мусить бути | зараз |
|---|---|---|
| light | чорний з альфою ≥ 0.56 для AA 4.5 (≥ 0.44 для 3.0) | `/50`, `/40` - провал |
| dark | білий з альфою ≥ 0.46 для AA 4.5 (≥ 0.34 для 3.0) | `/50` ok, `/40` провал |

Виміряний blast radius (визначив, що ретюн токенів безпечний):
`<Card>` використовується лише на auth-сторінках і `/ui`; `--muted-foreground` -
лише в placeholder `Input.vue`; `<Input>`/`PasswordInput` - лише auth і `/ui`;
`buttonVariants` - весь сайт, але додавання focus-обведення є additive.

## Рішення

Правки робляться на рівні токенів і primitives, а auth-компоненти лише
споживають семантику. Це не конфліктує з наявною спекою
[design-system-validity](2026-07-19-design-system-validity-design.md), бо та
явно не торкається самих токенів.

### 1. Токени (`app/assets/css/tailwind.css`)

Light (`:root`):

| токен | зараз | стає | перевірений ratio |
|---|---|---|---|
| `--card` | `oklch(0 0 0 / 4%)` | `oklch(1 0 0 / 55%)` | картка проти сторінки 1.47 (було 1.09); текстура 1.61x → 1.21x |
| `--muted-foreground` | `oklch(0 0 0 / 50%)` | `oklch(0 0 0 / 62%)` | 5.83 на картці, 5.47 на заливці поля |
| `--ring` | `oklch(0 0 0 / 40%)` | `oklch(0 0 0 / 55%)` | 4.55 як non-text (потрібно 3.0) |
| `--input` | `oklch(0 0 0 / 15%)` | `oklch(0 0 0 / 25%)` | помірний підйом, див. рішення про рамки нижче |
| `--destructive` | `oklch(0.6 0.2 22)` | `oklch(0.52 0.19 22)` | 5.08 (зараз 3.64 на новій поверхні, 4.01 на старій - провал в обох) |
| `--success` | немає | `oklch(0.48 0.12 155)` | 5.13 |

Dark (`.dark`):

| токен | зараз | стає | перевірений ratio |
|---|---|---|---|
| `--card` | `oklch(1 0 0 / 5%)` | `oklch(0 0 0 / 25%)` | картка проти сторінки 1.13; текстура 1.77x → 1.45x |
| `--muted-foreground` | `oklch(1 0 0 / 50%)` | `oklch(1 0 0 / 62%)` | 6.07 на картці, ~5.2 на заливці поля |
| `--ring` | `oklch(1 0 0 / 50%)` | `oklch(1 0 0 / 65%)` | 6.51 |
| `--input` | `oklch(1 0 0 / 20%)` | `oklch(1 0 0 / 28%)` | див. рішення про рамки нижче |
| `--destructive` | `oklch(0.7 0.19 22)` | без змін | 4.51 |
| `--success` | немає | `oklch(0.8 0.18 155)` | 7.55 |

`--color-success: var(--success)` додається у блок `@theme inline`, щоб працювала
утиліта `text-success`.

`--muted-foreground` однаковий за альфою в обох темах (62%) навмисно: у темній
темі заливка поля підсвітлює поверхню, і на 55% placeholder падає до 4.38, тобто
нижче AA.

**Свідоме рішення 1: напрямок заливки картки інвертується між темами.**
Light-картка стає світлішою за сторінку, dark - темнішою. Це не порушення
page-theme lock: скло підсвічує на світлому фоні й димить на темному. Наслідок -
світла картка стане помітно білішою, ніж зараз (зараз її фактично не видно).

**Свідоме рішення 2: `--input` не тягнеться до 3:1 як межа контролу.**
Для 3.0 потрібно 45% чорного / 40% білого, і такі рамки вбивають glass-мову.
WCAG 1.4.11 вимагає 3:1 лише для меж, які **єдино** ідентифікують контрол; тут є
лейбл над полем і власна заливка поля, тож рамка не єдиний ідентифікатор.
Замість важкої рамки поле отримує помітну власну заливку (див. нижче), а
`--input` піднімається помірно.

### 2. Primitives

`app/components/ui/button/index.ts`:

- у базу cva додається
  `focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`;
- безумовний `outline-none` з бази прибирається. **Пастка Tailwind v4:**
  `outline-none` виставляє `--tw-outline-style: none` на елементі безумовно, тому
  `focus-visible:outline-2` після нього дасть обведення нульового стилю, тобто
  нічого. Перший крок реалізації - перевірити Tab-ом, що обведення реально
  малюється, а не «клас є, ефекту немає»;
- додається варіант `submit` для сабмітів форм:
  `h-10 px-4 text-sm border border-foreground/30 bg-foreground/12 hover:bg-foreground/20 hover:border-foreground/45`.
  Одна утиліта, коректна в обох темах, нуль `dark:`-дублів; вага вища за поле
  (/12 проти /8), щоб кнопка читалася як головний контрол. `w-full` лишається на
  call-site, бо варіанти не володіють лейаутом.

`app/components/ui/input/Input.vue`:

- `focus-visible:ring-ring/50` замінюється на
  `focus-visible:outline-solid focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-ring`, а безумовний
  `outline-none` прибирається. Implementation review показав, що ring-класи
  виставляли `--tw-ring-shadow`, але через `shadow-xs` ring-слот у фактичному
  `box-shadow` лишався прозорим. Outline перевірено по computed styles і
  скриншотах: 2px, offset 2px, повний `--ring` в обох темах;
- заливка поля: `bg-transparent` + `dark:bg-input/30` замінюються **єдиним**
  `bg-foreground/8` без `dark:`-варіанта. У світлій це 8% чорного (поле втоплене
  в білу картку), у темній - 8% білого (поле підсвічене). Поле проти картки
  1.19 / 1.28; значення в полі 14.7 / 10.3; placeholder 5.5 / ~5.2.

`app/components/ui/alert/index.ts`:

- варіант `success: 'bg-card text-success'`. Бордер приходить від `currentColor`,
  як і в `destructive`, тож зелена рамка з'являється симетрично до червоної.

### 3. Auth-поверхня

Новий `app/components/AuthCard.vue` - оболонка, яку зараз дублюють `AuthForm.vue`
і `reset-password.vue`: обгортка-центрування, `<h1>`, `<Card>` з класами
поверхні, пара `<Alert>` для error/message. Props: `title`, `error`, `message`.
Слот - поля й сабміт. Розподіл відповідальності: `AuthCard` володіє поверхнею,
форма володіє змістом. Класи картки:
`border-foreground/20 backdrop-blur-md` замість
`border-black/20 dark:border-white/20 backdrop-blur-sm` - парний дубль зникає, а
підвищений blur гасить текстуру фото.

Зміни в `AuthForm.vue`, `PasswordInput.vue`, `reset-password.vue`, `confirm.vue`:

- сабміт переходить з `variant="outline"` на `variant="submit"` (саме `outline` у
  світлій темі давав непрозорий білий блок замість скла);
- `text-foreground/50` і `text-foreground/40` → `text-muted-foreground`,
  hover → `hover:text-foreground`. Рівня, тусклішого за `muted-foreground`, для
  тексту не залишається;
- `aria-describedby` з інпута на `id` спана з помилкою + `role="alert"` на спані:
  зараз `aria-invalid` є, але текст помилки скрінрідеру не доходить;
- кнопка ока: динамічний `aria-label` («Show password» / «Hide password») і
  `aria-pressed`; semantic outline задається через
  `button.password-toggle:focus-visible`, а перехід обмежується
  `transition-[color]`, щоб outline не анімувався від `currentColor`;
- `a:focus-visible` глобально використовує той самий outline, тому auth-лінки
  не залежать від синього UA-outline Chromium;
- `text-green-400` зникає з `AuthForm.vue`, `reset-password.vue`, `ui.vue` на
  користь `<Alert variant="success">`.

`variant="outline"` не змінюється. Інвентар його використання: `AuthForm.vue`,
`reset-password.vue` (обидва переходять на `submit`), `CloseBtn.vue` (перекриває
заливку власним `bg-white/20`) і 9 разів у демо `ui.vue`. Тобто після цих правок
непрозора світла заливка `outline` не впливає ні на одну продуктову сторінку.

Побічний ефект підйому `--input`, який лишається свідомо: токен також живить
темну заливку варіанта `outline` (`dark:bg-input/30`), тому вона стає трохи
світлішою (0.06 → 0.084 альфи). Видно лише на `/ui` і в `CloseBtn`, який усе
одно перекриває заливку своєю.

**Правило на випадок, що alert зникне на світлій картці.** `alertVariants`
використовує `bg-card`, а `--card` у світлій темі стає білою 55%, тому alert
всередині картки триматиметься лише на кольоровій рамці й тексті. Якщо при
візуальній перевірці alert не читається як окремий блок, його заливка змінюється
з `bg-card` на `bg-foreground/8` (та сама мова, що поле й кнопка). Рішення
приймається на кроці верифікації.

### 4. Верифікація

Регрес-тест `tests/unit/interactionStates.test.ts` у стилі
`tests/unit/authPages.test.ts` (грепає джерела через `readProjectFile`, іде в CI
через `npm run test:unit`):

- `tailwind.css` визначає `--success`, `--ring`, `--muted-foreground` і в
  `:root`, і в `.dark`; `--color-success` є в `@theme inline`;
- база `buttonVariants` містить `focus-visible:` і не містить безумовного
  `outline-none`;
- `Input.vue` містить outline-класи, не містить `focus-visible:ring-*` і
  безумовного `outline-none`;
- `tailwind.css` задає semantic outline для `a:focus-visible` та
  `button.password-toggle:focus-visible`;
- у `app/` немає `text-green-400`;
- auth-файли не містять `text-foreground/40`, `text-foreground/50` і парних
  `black/N dark:white/N`.

Існуючий `authPages.test.ts` мусить лишитися зеленим: він грепає внутрішнє
`AuthForm.vue` (`mode="signin"`, `useSeoMeta({`, `title,`), тож екстракція
`AuthCard` не має винести це з файлу.

Ручна верифікація (throwaway Playwright-скрипт, dev-сервер на окремому порті
3100, щоб не чіпати сервери користувача):

- переміряти заміри аудиту на `/signin`, `/signup`, `/forgot-password`,
  `/reset-password` у двох темах; пороги приймання: текст ≥ 4.5, non-text
  (focus-обведення, іконка у спокої) ≥ 3.0;
- прохід Tab-ом: обведення видно на кнопці ока, `Forgot password?`, сабміті,
  footer-лінку. Це головний acceptance-критерій, бо саме він зараз зламаний;
- стани: спокій / фокус / помилки валідації / серверна помилка / success /
  390px мобільний.

Перевірка blast radius поза auth (очима, обидві теми): `buttonVariants` зачіпає
всі кнопки, тому обхід `/`, `/releases`, однієї detail-сторінки, `/profile`,
`/ui` - `outline-offset-2` не конфліктує зі скляними кнопками хедера й нічого не
обрізається `overflow-hidden` батьками.

### 5. Документація

Написано разом зі спекою: `docs/audits/2026-07-25-auth-theme-contrast-audit.md`
(заміри «до», методика, follow-up-и), `docs/roadmap/auth-contrast-focus.md`
(P2-айтем), рядки в `docs/roadmap/README.md` і `docs/audits/README.md`.

Лишається на реалізацію:

- одне речення в `AGENTS.md` (секція Styling) про рівні тексту (`foreground` /
  `muted-foreground`, третього немає) і про focus-конвенцію через `outline`;
- перевести `docs/roadmap/auth-contrast-focus.md` у `Implemented` після
  верифікації.

### 6. Intentional dark surface у футері

Implementation review глобального `a:focus-visible` виявив регресію: у світлій
темі `--ring` чорний, але `Footer.vue` навмисно лишається майже чорним. Контраст
outline на footer links падає до 1.12–1.38.

Корінь футера отримує локальний
`[--ring:oklch(1_0_0_/_65%)]`. Перевизначення успадковується всіма
інтерактивними нащадками й одночасно обслуговує глобальне CSS-правило,
`outline-ring` та `ring-ring`. Окремі focus-класи на кожен footer link не
додаються; новий dark-surface primitive для одного call-site не створюється.

Навігаційні footer links переходять із `transition-colors` на
`transition-[color,background-color]`. У Tailwind v4 `transition-colors`
включає `outline-color`, тому без звуження outline протягом 300ms
інтерполюється від `currentColor` до `--ring`. Глобальне
`transition-property: none` у `a:focus-visible` не додається: воно вимкнуло б
інші корисні переходи всіх посилань сайту. Основна навігація Header уже
використовує явний список без `outline-color`, social links футера — також.

`interactionStates.test.ts` охороняє локальний токен футера: дістає `--ring` із
`.dark`, нормалізує underscore-синтаксис arbitrary property і порівнює
значення, щоб Footer не відстав від theme token. Наявний асерт проти
`transition-colors` у `PasswordInput.vue` звужується до рядка класів кнопки
`password-toggle`, щоб нешкідлива поява цієї утиліти в іншому місці файлу не
ламала тест. Окремий асерт охороняє явний transition-список footer navigation.

Live-перевірка проходить footer links `News` і `Home` та всі шість Tab-стопів
auth-картки в обох темах. Footer outline мусить мати 2px, offset 2px і білий
`--ring` 65%; auth-контроли мусять зберегти поточні theme-specific значення.
Колір читається одразу після Tab і повторно після завершення 300ms CSS-переходу:
обидва заміри мають бути однаковими. Для baseline до виправлення достовірним є
лише другий, settled-замір; інакше Chromium повертає проміжний `currentColor`.

## Поза скоупом

- Міграція `text-foreground/50` по всьому сайту (47 входжень) - це
  [design-system.md](../../roadmap/design-system.md).
- Решта 11 входжень `outline-none` (`Header`, `OpenSidebar`, `ThemeToggle`,
  `profile/*`, `OpenImage`) - фіксуються в audit-документі як follow-up до
  [accessibility-structure.md](../../roadmap/accessibility-structure.md). П’ять
  із цих call-sites також використовують `focus-visible:ring-ring/50` і мають
  бути переміряні після переходу на повний semantic focus.
- `buttonVariants.soft` із `text-foreground/40` належить site-wide
  [design-system.md](../../roadmap/design-system.md).
- Перенесення `password-toggle` до icon-варіанта `buttonVariants`; це має сенс,
  коли з’являться інші подібні іконкові кнопки.
- Посилання поза Footer, які поєднують глобальний `a:focus-visible` із
  `transition-colors`, можуть інтерполювати `outline-color` до 300ms. Обидва
  кінцеві кольори на їхніх theme-aware поверхнях читабельні, тому це прийнятий
  косметичний борг, а не блокер AA.
- Світла заливка варіанта `outline` у `buttonVariants`.
- Погоня за Lighthouse Accessibility 100 як окрема мета.

## Критерії успіху

- Tab на всіх інтерактивних елементах auth-сторінок дає видиме обведення в обох
  темах.
- Весь текст на `/signin`, `/signup`, `/forgot-password`, `/reset-password`
  тримає ≥ 4.5, focus-обведення та іконки у спокої ≥ 3.0 в обох темах.
- Сабміт виглядає однаково за вагою в обох темах (немає непрозорого білого блока
  у світлій).
- Success-повідомлення читається в обох темах (зараз 1.59 у світлій).
- `npm run test:unit` і `npm run typecheck` зелені; `interactionStates.test.ts`
  падає, якщо `focus-visible` або токени приберуть.
