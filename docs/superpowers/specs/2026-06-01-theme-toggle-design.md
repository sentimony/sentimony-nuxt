# Перемикач світлої/темної теми з круговим розкриттям

**Дата:** 2026-06-01
**Статус:** реалізовано

## Мета

Додати перемикач теми світла↔темна з ефектом **кругового розкриття** (як у Nuxt DevTools): при кліку нова тема «проявляється» колом, що розходиться від кнопки до краю екрана. Зараз сайт лише темний (хардкод `class="dark"`, единий темний `:root`, `body` з `text-white` + `bg-green-950` + фон лісу).

## Обсяг

**Підхід «спершу ефект + проста світла тема»** (затверджено користувачем):

- Повна інфраструктура перемикання тем (стан, збереження, перемикач у хедері) і сама анімація — реалізуються повністю.
- Світла тема — **проста, на рівні токенів** (світлий фон, темний текст). «Дорогий» вигляд та покомпонентний лоск — поза обсягом цього спеку.

### Поза обсягом

- Покомпонентне перефарбування десятків `text-white/X`, `bg-white/X`, `border-white/20`, що «вшиті» під темну (див. Caveat нижче).
- `prefers-color-scheme` (system preference) при першому візиті — дефолт завжди темний; можна додати пізніше.
- Окреме світле фонове зображення («денна» варіація бренду).

## Технічний підхід до ефекту

**View Transitions API + `clip-path: circle()`** (канонічний патерн Nuxt DevTools / antfu / VueUse docs).

При кліку по кнопці:

1. Зчитуємо координати кліку `(x, y)`.
2. `const t = document.startViewTransition(() => applyTheme(next))`.
3. На `t.ready` анімуємо `::view-transition-new(root)`:

```js
const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
document.documentElement.animate(
  { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
  { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
)
```

CSS, щоб дефолтний crossfade не заважав чистому колу:

```css
::view-transition-old(root),
::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
```

**Деградація (progressive enhancement):**

- Немає `document.startViewTransition` (старий Firefox) → миттєве перемикання без анімації.
- `prefers-reduced-motion: reduce` → миттєве перемикання без кола.

**Розглянуті альтернативи:** ручний overlay/canvas (більше коду без переваг) і звичайний crossfade (це не кругове розкриття) — відкинуто.

## Архітектура

Чотири частини:

### 1. `app/composables/useTheme.ts`

- Реактивний стан `isDark: Ref<boolean>`, ініціалізований із класу `<html>` (який виставляє інлайн-скрипт, див. п.2).
- `setTheme(theme: 'light' | 'dark')` — перемикає клас `.dark` на `documentElement`, пише в `localStorage['theme']` (через `useStorage` з `@vueuse/core`).
- `toggle(event?: MouseEvent)` — запускає кругове розкриття (п. «Технічний підхід») від координат `event`; за відсутності координат — від центру екрана; за відсутності підтримки / `reduced-motion` — миттєво.

### 2. Інлайн-скрипт у `<head>` (запобігання FOUC)

Через `app.head` (`nuxt.config.ts`) або плагін — виконується **до першого рендеру**, щоб не блимало:

```js
;(() => {
  const t = localStorage.getItem('theme')
  document.documentElement.classList.toggle('dark', t !== 'light')
})()
```

Дефолт — темний: клас `dark` лишається, доки користувач явно не обере світлу. Хардкод `htmlAttrs: { class: 'dark' }` з `nuxt.config.ts` **прибираємо** — клас тепер ставить скрипт. (ISR кешує HTML, але скрипт виконується на клієнті щоразу, тож кеш не заважає.)

### 3. `app/components/ThemeToggle.vue`

- Кнопка-іконка sun/moon (`lucide:sun` ↔ `lucide:moon`) у хедері, **ліворуч від Sign In / аватарки**, у стилі правих дій хедера (`hover:bg-white/30`, `rounded-[2px]`, квадрат ~46/56px).
- `@click="toggle($event)"` з `useTheme()`.

### 4. CSS-реструктуризація (`app/assets/css/tailwind.css`)

- Перенести поточні **темні** токени з `:root` у блок `.dark { … }`; у `:root` лишити **світлі** токени (стартові значення нижче). `@theme inline` маппінг `--color-*` не змінюється — змінні резолвляться залежно від `:root`/`.dark`.
- `body` розділити на теми: зараз хардкодить `text-white bg-green-950 bg-[url(trees-green…)]`. Темна (`.dark body`) лишає ліс + білий текст без змін. Світла (`body` за замовчуванням) — `background: var(--background)` (світлий токен `oklch(0.97 0.01 155)`), `color: var(--foreground)`, **без** фонового зображення лісу.
- Додати правила `::view-transition-*` (вимкнути дефолтний crossfade).
- **Автозаповнення:** `-webkit-text-fill-color: #fff` / `caret-color: #fff` зробити залежними від теми (інакше в світлому режимі білий текст на світлому). Прив'язати до `var(--foreground)` або винести під `.dark`.

#### Стартові світлі токени (`:root`)

```css
--background: oklch(0.97 0.01 155);
--foreground: oklch(0.18 0.02 155);
--card: oklch(0 0 0 / 4%);
--card-foreground: oklch(0.18 0.02 155);
--popover: oklch(0.99 0.005 155);
--popover-foreground: oklch(0.18 0.02 155);
--primary: oklch(0.2 0.02 155);
--primary-foreground: oklch(0.98 0 0);
--secondary: oklch(0 0 0 / 6%);
--secondary-foreground: oklch(0.18 0.02 155);
--muted: oklch(0 0 0 / 5%);
--muted-foreground: oklch(0 0 0 / 50%);
--accent: oklch(0 0 0 / 8%);
--accent-foreground: oklch(0.18 0.02 155);
--destructive: oklch(0.6 0.2 22);
--border: oklch(0 0 0 / 15%);
--input: oklch(0 0 0 / 15%);
--ring: oklch(0 0 0 / 40%);
```

(Темні значення — поточні з `:root` — переносяться в `.dark` без змін.)

## Рішення

| Питання | Рішення |
|---|---|
| Дефолт при першому візиті | Завжди темна; світла — лише після явного вибору (зберігається в `localStorage`). |
| System preference | Не враховуємо (поза обсягом). |
| Збереження | `localStorage['theme']` = `'light' \| 'dark'`. |
| Розташування кнопки | Хедер, ліворуч від Sign In / аватарки (і в мобільному ряду). |
| Іконка | `lucide:sun` ↔ `lucide:moon`. |
| Тривалість/easing | 450ms, `ease-in-out`. |
| Стан-менеджмент | Власний `useTheme` + `useStorage` (`@vueuse/core`, вже в залежностях). Розглянуто `@nuxtjs/color-mode` — відкинуто, щоб не додавати модуль; затверджений підхід — інлайн-скрипт. |

## Caveat: «проста» світла тема

Десятки компонентів хардкодять `text-white/40`, `bg-white/20`, `border-white/20` — вони «вшиті» під темну й **не інвертуються самі**. Реструктуризація токенів + `body` зробить головні поверхні світлими, але частина оверлеїв/акцентів у світлому режимі виглядатиме негарно (білий текст на світлому), доки не відполіруємо покомпонентно (окрема ітерація). Анімація + перемикач + перемикання тем працюють повністю одразу.

Приклади відомо-проблемних місць (для майбутнього лоску): кнопки лайків (`text-white/40`, `border-white/20`), хедер (`hover:bg-white/30`, `text-white`), auth-картки (`border-white/20`), Sign In кнопка, соцлінки.

## Крайові випадки

- **FOUC/SSR/ISR** — інлайн-скрипт у `<head>` виставляє клас до фарбування; хардкод `dark` прибрано.
- **Без View Transitions** — миттєве перемикання.
- **`prefers-reduced-motion`** — миттєве перемикання без кола.
- **Подвійний клік під час переходу** — `startViewTransition` сам ставить переходи в чергу/скасовує; обробки не потребує.

## Верифікація

- Ручна перевірка в dev: клік по кнопці → кругове розкриття; повторний клік → назад; перезавантаження → тема збереглася; `prefers-reduced-motion` (DevTools rendering) → миттєво; вузький Firefox (або емуляція без API) → миттєво без помилок.
- Скриншоти світлого/темного стану хедера й кількох сторінок (playwright) для фіксації стартового вигляду світлої теми.
- Автотест анімації View Transitions не робимо (візуальна, UA-залежна).

## Зачеплені файли

- `nuxt.config.ts` — прибрати `htmlAttrs.class: 'dark'`, додати інлайн-скрипт у `app.head`.
- `app/assets/css/tailwind.css` — реструктуризація токенів, `body`, `::view-transition`, автозаповнення.
- `app/composables/useTheme.ts` — новий.
- `app/components/ThemeToggle.vue` — новий.
- `app/components/Header.vue` — вставити `<ThemeToggle>` у праві дії.
- `CLAUDE.md` — оновити нотатку про стилі (тема більше не «always-dark»).
