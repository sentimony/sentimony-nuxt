# Mobile performance (PRODUCT.md §3, ROADMAP P0 #1)

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст

Lighthouse mobile (2026-07-16): Performance 68; головні важелі — TBT 630 ms, Speed Index 7.3 s; unused JS ~103 KiB зі 177 KiB; non-passive scroll/touch listener в одному `_nuxt/*.js`; DOM 1275 елементів; tap-targets 89% (футер).

Фактичний стан коду:

- Головна рендерить через `app/layouts/default.vue` два `LazySwiper` (Releases + Artists); `Swiper.vue` рендерить **усі** картки списку без віртуалізації (усі релізи + усі 200+ артистів по секціях) — основний драйвер DOM/TBT. `LazySwiper` — лише lazy chunk, **не** lazy hydration; Swiper обгорнутий `<ClientOnly>` (client-only рендер).
- Lazy hydration ніде не використовується (`hydrate-on-visible` відсутній у кодовій базі); island/server components немає.
- Swiper тягне 5 модулів + CSS; `v-wave` підключено глобально (`v-wave/nuxt`, ~25 файлів використання) — головний підозрюваний non-passive listener (ripple слухає pointer/touch події).
- `nuxt.config.ts` не має `manualChunks`; попередня LCP-ініціатива (2026-07-13) уже закрила шрифти/іконки/flag-icons/WebP.
- Auth/Supabase-частина бандла — окрема ініціатива §6; тут не дублюється.

## Рішення

1. **Міряти до і після кожного кроку, а не наприкінці**: baseline через `npx nuxi analyze` (склад бандла) + Lighthouse mobile на прогрітому stage. Кроки, що не дають вимірного зсуву, відкочуються.
2. **Lazy hydration для нижньофолдних блоків** (найбільший очікуваний виграш TBT/DOM без зміни UX): `Testimonials`, нижні Swiper-и (всі, крім першого видимого на маршруті), `Footer` — через Nuxt lazy hydration (`<LazyXxx hydrate-on-visible />`). Swiper уже `<ClientOnly>` + lazy chunk, тож гідратація-на-видимості — природне продовження.
3. **Обмежити початковий DOM Swiper-а**: рендерити перші N слайдів (N = кратне видимому в'юпорту, орієнтовно 12) із дорендером решти після `mounted`/першої взаємодії (idle callback). Віртуалізацію Swiper не вмикаємо (ламає free-mode/секції артистів) — YAGNI.
4. **Non-passive listeners**: локалізувати джерело в DevTools (очікувано `v-wave`); якщо це воно — налаштувати/обмежити директиву (v-wave не критичний для смислу взаємодії; на найгарячіших глобальних елементах його можна зняти), інакше — точкове виправлення знайденого джерела. Рішення ухвалюється за фактом вимірювання, обидві гілки описані в плані.
5. **Tap targets у футері**: збільшити клікабельну площу соц-лінків (`p-*`/`min-w-11 min-h-11`) без зміни візуального розміру іконок.
6. **Пере-зняти Lighthouse на прогрітому `sentimony.com`/stage** після мержа, щоб відділити холодний старт TTFB.

Поза скоупом: page-level ISR, virtual scrolling, зміна дизайну секцій, Supabase-бандл (§6).

## Критерії успіху

- Lighthouse mobile Performance ≥ 80 на прогрітому stage (TBT < 300 ms, tap-targets 100%).
- `npx nuxi analyze`: зниження initial JS проти baseline (зафіксувати числа в PR).
- Жодних візуальних регресій на головній/списках (web-debug smoke + очі).

## Ризики

- Lazy hydration компонентів зі станом (Swiper navigation) — перевірити взаємодію одразу після появи у в'юпорті.
- Дорендер слайдів після idle не повинен зсувати layout (слайди фіксованої ширини — CLS-безпечно).
