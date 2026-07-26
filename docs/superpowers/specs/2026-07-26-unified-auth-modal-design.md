# Уніфікована auth-форма + модальний вхід

Дата: 2026-07-26. Гілка: `feature/unified-auth` (від `main`).

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст

- `AuthForm.vue` уже параметризований пропом `mode: 'signin' | 'signup' | 'forgot'`;
  `signin.vue`, `signup.vue`, `forgot-password.vue` — три однорядкові обгортки над ним.
- `AuthCard.vue` тримає спільну оболонку (центрований `<h1>`, `<Card>`, пара `<Alert>`)
  і використовується також у `reset-password.vue`.
- `server/api/auth/email-exists.post.ts` + `server/utils/authEmail.ts` уже існують
  і викликаються лише в signup-гілці `AuthForm.vue:70`. Реалізація гортає
  `admin.listUsers()` сторінками по 1000 — O(n) від кількості користувачів на
  кожен запит, без будь-якого rate limit.
- Вхід доступний лише з окремої сторінки: `Header.vue:152` і `OpenSidebar.vue:119`
  ведуть на `/signin`, `middleware/auth.ts` редіректить туди ж, `nuxt.config.ts:93`
  задає `redirectOptions.login: '/signin'`, `nav.ts:33` групує auth-роути під `/signin`.
- Модальні вікна в проєкті вже є: `OpenImage.vue` будує їх на auto-imported
  reka-ui (`DialogRoot`/`DialogPortal`/`DialogOverlay`/`DialogContent`) + `Overlay.vue`.
- Rate limiting для mutations окремо запланований у
  [`docs/initiatives/mutation-hardening.md`](../../initiatives/mutation-hardening.md); ця
  ініціатива вводить перший спільний limiter, який той пункт зможе перевикористати.

## Ключове обмеження (чесно)

Supabase **навмисно** не дає відрізнити «немає такого користувача» від «невірний
пароль»: `signInWithPassword` повертає generic `Invalid login credentials`, а
`signUp` для наявного email при увімкненому email confirmation повертає *успіх* з
obfuscated user (`data.user.identities.length === 0`). Тому наївна схема «спробувати
вхід, при помилці — реєстрація» ненадійна. Єдиний спосіб зробити одну password-форму
детермінованою — серверний пробник існування email, тобто **свідомо створений
user-enumeration oracle**. Ми приймаємо цей компроміс заради UX і компенсуємо його
rate limit'ом, хешуванням ключів і generic-повідомленнями в решті флоу. Альтернатива
без oracle — passwordless (`signInWithOtp` з `shouldCreateUser: true`) — відкидається,
бо змінює всю модель авторизації проєкту.

## Рішення

### 1. Один роут `/auth` замість трьох

- Нова сторінка `app/pages/auth.vue` → `<AuthForm variant="page" />`.
- `signin.vue`, `signup.vue`, `forgot-password.vue` видаляються; `/signin`, `/signup`,
  `/forgot-password` віддаються через `routeRules` як **302** (не 301: auth-сторінки
  noindex, SEO-ваги немає, а 301 назавжди осідає в браузерах і ускладнює відкат).
- `/reset-password` і `/confirm` не змінюються — вони приймають токен з листа.
- Query-параметри `/auth`: `?mode=forgot` (deep-link зі старого `/forgot-password`),
  `?redirect=<path>` (куди вести після успішного входу).

### 2. Two-step форма замість вгадування режиму

Крокова машина в `AuthForm.vue` (`step: 'email' | 'password' | 'forgot' | 'sent'`):

1. **`email`** — одне поле + кнопка `Continue`. Сабміт → `POST /api/auth/email-exists`
   → режим визначено (`exists ? 'signin' : 'signup'`), перехід на `password`.
2. **`password`** — показує обраний email з кнопкою `Use a different email`,
   `PasswordInput` з коректним `autocomplete` (`current-password` / `new-password`),
   кнопку `Sign In` / `Create Account`, лінк `Forgot password?` лише в signin-режимі.
3. **`forgot`** — email вже відомий, `resetPasswordForEmail`.
4. **`sent`** — термінальний екран для signup-підтвердження і reset-листа.

Two-step обраний замість «email+пароль одним екраном із гілкуванням на сабміті»,
бо саме він знімає єдину технічну проблему змішаної форми: `autocomplete`
(`current-password` vs `new-password`) і правило `min(6)` не треба вгадувати наперед
— вони застосовуються вже після того, як режим відомий.

Race condition (між lookup і `signUp` email встиг зареєструватись) обробляється як
зараз: якщо `data.user?.identities?.length === 0`, показуємо той самий generic
`Something went wrong. Please try again.` — без витоку факту існування.

### 3. Модальний вхід із будь-якої сторінки

- `app/composables/useAuthDialog.ts` — глобальний стан на `useState`:
  `{ open, mode, redirectTo }` + `openAuthDialog(options)` / `closeAuthDialog()`.
- `app/components/AuthDialog.vue` — reka-ui `DialogRoot` за зразком `OpenImage.vue`
  (портал, `<Overlay>`, `.reka-fade`, обов'язковий `DialogTitle`), усередині
  `<AuthForm variant="dialog" />`. Focus trap, Esc і `aria-modal` дає reka-ui.
- Монтується один раз у `app/layouts/default.vue` — поряд із `<GlobalPlayer>`.
- Тригери в `Header.vue` і `OpenSidebar.vue` лишаються справжніми посиланнями на
  `/auth`, але звичайний лівий клік перехоплюється і відкриває модалку;
  Cmd/Ctrl/Shift-клік і середня кнопка працюють як звичайний лінк (нова вкладка).
- Успішний вхід у модалці **не навігує**: діалог закривається, користувач лишається
  на поточній сторінці. Навігація на `redirectTo`/`/profile` — тільки у `variant="page"`.
- `watchEffect`, що зараз редіректить залогіненого на `/profile` (`AuthForm.vue:9-11`),
  обмежується `variant === 'page'`, інакше кожен залогінений користувач буде
  викидатись із будь-якої сторінки при монтуванні діалогу.

### 4. Rate limit (Postgres-backed, runtime-agnostic)

In-memory limiter на Netlify serverless безсенсовий (кожен інстанс — свій лічильник),
а попереду ще й [міграція на Cloudflare](../../initiatives/cloudflare-domain.md). Тому
сховище — Supabase Postgres, доступне з будь-якого runtime.

Міграція `supabase/migrations/20260726_auth_rate_limit.sql`:

- Таблиця `public.auth_rate_limits(bucket, subject, window_start, hits)`, PK
  `(bucket, subject)`, RLS увімкнено **без жодної policy** (доступ лише service_role).
- `public.consume_rate_limit(p_bucket, p_subject, p_limit, p_window_seconds)` —
  `security definer`, атомарний `insert … on conflict do update`, повертає
  `(allowed, remaining, retry_after)`. Вікно **фіксоване**, не ковзне — простіше й
  достатньо для anti-abuse; це свідоме спрощення. Opportunistic cleanup старих
  рядків усередині функції (`random() < 0.01`), без залежності від `pg_cron`.
- `public.auth_email_exists(p_email)` — `security definer` `select exists(...)` по
  `auth.users`, що замінює O(n) `admin.listUsers()`.
- Обидві функції `revoke` від `public`/`anon`/`authenticated`.

Серверний шар `server/utils/rateLimit.ts`:

- `clientIp(event)` — `getRequestIP(event, { xForwardedFor: true })` з фолбеком.
- `hashSubject(value)` — sha256, щоб email не лежав у таблиці лімітів у відкритому вигляді.
- `enforceRateLimit(event, subject, rule)` — кидає `createError({ statusCode: 429 })`
  і виставляє заголовок `Retry-After`.

Бакети для `/api/auth/email-exists`: `auth_lookup_ip` — 20 запитів / 600 с;
`auth_lookup_email` — 5 / 600 с (перевіряється після IP).

**Fail-open при помилці RPC.** Якщо міграція ще не застосована або Postgres
недоступний — limiter логує warning і пропускає запит, за зразком
`server/utils/trackArtists.ts`. Деплой попереду міграції не має класти auth.
Це свідомий вибір доступності над строгістю; сам `email-exists` при цьому лишається
за Supabase-ними вбудованими лімітами на `/token`.

## Обсяг

**Входить:** `/auth` + редіректи, two-step форма, `AuthDialog` + тригери в
Header/Sidebar, rate limit (міграція + util + застосування до `email-exists`),
заміна `listUsers` на RPC, оновлення `robotsPolicy`/`cachePolicy`/`nav`/middleware,
unit-тести, e2e на модалку, оновлення `AGENTS.md` і roadmap.

**Не входить:** OAuth/OTP провайдери, міграція anon-лайків на акаунт після входу,
rate limit для likes/plays (лишається за `mutation-hardening`), редизайн
`reset-password.vue` і `confirm.vue`.

## Критерії успіху

- З `/auth` можна і увійти, і зареєструватись; правильний режим визначається сам.
- Модалка відкривається з header і sidebar на будь-якій сторінці; успішний вхід
  закриває її без втрати позиції на сторінці.
- `/signin`, `/signup`, `/forgot-password` віддають 302 на `/auth`.
- 21-й lookup з однієї IP за 10 хв отримує 429 з `Retry-After`.
- `npm run test:unit` і `npm run typecheck` зелені.

## Ризики

- **User enumeration** — прийнятий свідомо (див. «Ключове обмеження»); мітигації:
  rate limit по IP і по email, хешовані ключі, generic-повідомлення в signup-гілці.
- **Fail-open limiter** — при недоступному Postgres захисту немає; зафіксовано в логах.
- **Deep-link'и на `/signin`** ззовні — покриті 302; внутрішні посилання переписані.
- **`DefaultButton` + нативний `@click`** — треба перевірити, що listener доходить до
  `NuxtLink` всередині компонента; якщо ні — тригер стає власним `<NuxtLink>` у Header/Sidebar.
- **Модалка поверх `GlobalPlayer`** — z-index узгодити з `OpenImage` (`z-50`).
