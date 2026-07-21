# Легший auth/session client bundle (PRODUCT.md §6, ROADMAP P1 #6)

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст

- `Header.vue` (`useSupabaseClient` + `useSupabaseUser`, signOut) і `OpenSidebar.vue` (`useSupabaseUser`) рендеряться в `app/layouts/default.vue` на кожній сторінці — auth-стан у глобальному контурі.
- `@nuxtjs/supabase` має `redirectOptions.exclude: ['/*']` — редірект-гард вимкнено, auth повністю опційний; клієнт, утім, ініціалізується плагіном модуля на кожному завантаженні.
- Інші реальні споживачі Supabase на клієнті: `middleware/auth.ts` (лише `/profile/**`), `createLikes` (лайки), `AuthForm.vue`, `confirm.vue`, `reset-password.vue`, `profile/*`.
- `Toaster` (`vue-sonner`) монтується глобально в `app/app.vue`.

## Ключове обмеження (чесно)

Плагін `@nuxtjs/supabase` створює клієнт при старті застосунку — тому `@supabase/supabase-js` потрапляє в initial bundle незалежно від того, які компоненти його викликають. Зняти його з entry можна лише відмовившись від модульного плагіна (великий ризик для auth-флоу) — це **не** робимо. Реалістична мета ініціативи: (а) прибрати auth-логіку з критичного шляху рендера header/sidebar, (б) відкласти гідратацію залежних від неї шматків, (в) виміряти фактичний внесок і зафіксувати рішення щодо модуля окремим ADR-пунктом, якщо вимірювання покаже, що плагін домінує.

## Рішення

1. **Виміряти спочатку**: `npx nuxi analyze` — фактичний розмір і місце `@supabase/supabase-js`, `vue-sonner`, `vee-validate` у чанках. Без цього не різати.
2. **Винести user-меню з `Header.vue`** в окремий компонент `HeaderUserMenu.vue` (єдине місце, де хедеру потрібні `useSupabaseUser`/`signOut`), монтувати як `<LazyHeaderUserMenu hydrate-on-idle />`. Гість бачить статичну іконку/лінк на `/signin` без гідратації auth-стану в критичний час. Аналогічно для аватар-блоку `OpenSidebar.vue`.
3. **`Toaster` → lazy**: `<LazyToaster hydrate-on-idle />` (тости не виникають до взаємодії) або монтаж при першому `toast.*` виклику, якщо простіше — рішення на імплементації за фактом підтримки auto-import для явного імпорту компонента.
4. **`vee-validate` не в глобальному контурі** — перевірити, що він потрапляє лише в чанки auth-сторінок (очікувано так через route-level code splitting); якщо ні — виправити імпорти.
5. **ADR-фіксація щодо плагіна модуля**: якщо analyze покаже, що плагін supabase-js в entry > ~30 KiB gzip і це головний залишковий внесок — зафіксувати окремим пунктом у ROADMAP (заміна модуля на ручний lazy-клієнт), не робити в цій ініціативі.

## Критерії успіху

- Зменшення initial JS проти baseline (числа в PR); auth-флоу (signin/signup/forgot/confirm/reset, signOut, аватар у header) працюють без регресій.
- Лайки працюють як гість і як користувач (createLikes не змінюється).

## Ризики

- Flash-of-guest-state у header для залогінених (меню з'являється після idle-гідратації) — прийнятно; аватар не є критичним контентом (узгоджено з design principle «Authentication stays secondary»).
