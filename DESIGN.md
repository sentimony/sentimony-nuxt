# Design System — Sentimony

## Версія Tailwind

- **Tailwind CSS**: v3.4.19 (не v4)
- **Nuxt Module**: `@nuxtjs/tailwindcss` v6.14.0
- **Config**: `tailwind.config.js`
- **CSS Entry**: `app/assets/css/tailwind.css`

## Design Tokens

### Кольори

Проєкт використовує фіксовану темну тему без `dark:` варіантів.

| Токен | Значення | Використання |
|---|---|---|
| Background | `green-950` + image overlay | Основний фон |
| Text | `white` + opacity (`/30`, `/50`, `/80`) | Весь текст |
| Accent green | `green-600`, `#b5ccb5` | Акценти, ховери |
| Accent red | `red-600`, `#8a0202` | Деструктивні дії |
| Link | `blue-500`, `blue-400`, `blue-700` | Посилання |
| Theme color meta | `#111111` | PWA theme-color |

### Шрифти

| Змінна | Значення | Завантаження |
|---|---|---|
| `font-montserrat` | `"Montserrat, sans-serif"` | Google Fonts (wght: 400) |
| `font-julius` | `"Julius Sans One, sans-serif"` | Google Fonts (wght: 400) |

### Анімації

Визначені в `tailwind.config.js`:

| Ім'я | Опис |
|---|---|
| `spin2` | Повний оберт 0° → 360° |
| `spin2rev` | Зворотний оберт з проміжними кадрами |

### Spacing & Sizing

Стандартний Tailwind. Кастомні розміри через arbitrary values (`w-[230px]`, `h-[36px]`).

### Dark Mode

**Відсутній.** Проєкт використовує фіксовану темну тему — `darkMode` не сконфігуровано, `dark:` варіанти не використовуються.

---

## Компоненти

### Структура (`app/components/`)

14 Vue-компонентів у плоскій структурі:

| Компонент | Призначення |
|---|---|
| `BtnPrimary.vue` | Кнопка-посилання |
| `Header.vue` | Sticky навігація |
| `Footer.vue` | Футер з метаданими |
| `Hero.vue` | Hero-секція |
| `Item.vue` | Універсальна картка (releases, artists тощо) |
| `Swiper.vue` | Карусель (Swiper.js) |
| `Tabs.vue` / `Tab.vue` | Таб-система через provide/inject |
| `OpenImage.vue` | Модальний перегляд зображень |
| `OpenSidebar.vue` | Тогл сайдбару |
| `RelativeItem.vue` | Спрощений варіант Item |
| `Testimonials.vue` | Секція відгуків |
| `Fractal.vue` | Геометричний декоративний елемент |
| `SvgTriangle.vue` | SVG-утиліта |

### Патерни стилізації

- **Inline utility-first** — без CVA, shadcn/ui, Headless UI
- **Dynamic стани** — через `:class` binding Vue
- **`@apply`** — лише в `<style>` блоках для Swiper-специфічних елементів
- **Glassmorphism** — `backdrop-blur-sm` + `bg-white/5`
- **Переходи** — `transition-[property] ease-in-out duration-300`
- **Hover** — `hover:bg-white/30`, `hover:opacity-100`

### Надмірне використання arbitrary values

```html
w-[230px]  h-[36px]  text-[16px]
shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]
bg-[url('https://...')]
```

---

## Plugins

`plugins: []` — жодного Tailwind-плагіну.

Суміжні бібліотеки (не Tailwind-плагіни):
- `v-wave` — ripple-ефект
- `@nuxt/icon` — Iconify
- `@nuxt/image` — оптимізація зображень
- `swiper` — карусель

---

## Проблеми та рекомендації

### Критичні

| Проблема | Рекомендація | Статус |
|---|---|---|
| Хардкод hex-кольорів (`#b5ccb5`, `#8a0202`) всюди | Семантичні токени в `tailwind.config.js → theme.extend.colors` | ✅ Виконано |
| Arbitrary values замість токенів | Перенести повторювані розміри в `extend` конфігу | — |

**Токени додано** (`tailwind.config.js → theme.extend.colors`):
- `sage` → `#b5ccb5` — light section backgrounds (`.Content`, Testimonials card, `SvgTriangle`)
- `sage-alt` → `#a1c0a1` — Testimonials section background
- `crimson` → `#8a0202` — Footer tooltip background
- `brand` → `#1cb884` — brand accent (OpenImage gradient)

### Середні

| Проблема | Рекомендація |
|---|---|
| Нема компонентного шару (CVA) | Додати CVA для `BtnPrimary`, `Item` при зростанні варіантів |
| Tailwind v3 → v4 не мігровано | Міграція можлива, але `@nuxtjs/tailwindcss` ще не повністю v4-ready |

### Низькі

| Проблема | Рекомендація |
|---|---|
| Нема `dark:` варіантів | Актуально тільки якщо планується light mode |
| Порожній `plugins: []` | Додати `@tailwindcss/typography` якщо потрібен rich text |
