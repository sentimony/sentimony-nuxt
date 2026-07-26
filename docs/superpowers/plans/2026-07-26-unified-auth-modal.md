# Unified Auth + Modal Sign-In Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. Виконувати задачі послідовно — Task 2 залежить від міграції з Task 1, Task 5 від компонентів Task 3-4.

**Goal:** Вхід і реєстрація живуть в одній two-step формі на `/auth`, доступній також як модальне вікно з будь-якої сторінки; серверний email-lookup захищений Postgres-backed rate limit'ом.

**Architecture:** Міграція (rate limit + `auth_email_exists` RPC) → `server/utils/rateLimit.ts` і переписаний `email-exists` → two-step `AuthForm.vue` → `AuthDialog.vue` + `useAuthDialog()` → перемикання роутів/тригерів → тести й документація.

**Tech Stack:** Nuxt 4, `@nuxtjs/supabase`, reka-ui Dialog, vee-validate, Supabase Postgres (plpgsql `security definer`), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-26-unified-auth-modal-design.md`

## Global Constraints

- Гілка `feature/unified-auth` від `main`, squash merge наприкінці; без git worktrees.
- Нових npm-залежностей не додавати.
- Коментарі в коді — англійською; уникати коментарів там, де назви самодокументовані.
- `reset-password.vue` і `confirm.vue` не чіпати.
- Не запускати `sync:firebase` / `sync:supabase`.
- Свій dev-сервер — тільки на порту 3100 (`with_server.py`); чужі 3000-3002 не чіпати.
- Міграції застосовувати через `db query --linked --file` workaround (див. AGENTS.md), бо `.env` — директорія.

---

### Task 1: Міграція — rate limit і email-lookup RPC

**Files:**
- Create: `supabase/migrations/20260726_auth_rate_limit.sql`

- [ ] **Step 1: Написати міграцію**

```sql
create table if not exists public.auth_rate_limits (
  bucket text not null,
  subject text not null,
  window_start timestamptz not null default now(),
  hits integer not null default 0,
  primary key (bucket, subject)
);

alter table public.auth_rate_limits enable row level security;
-- No policies on purpose: only the service_role key (which bypasses RLS) may touch this table.

create index if not exists auth_rate_limits_window_start_idx
  on public.auth_rate_limits (window_start);

create or replace function public.consume_rate_limit(
  p_bucket text,
  p_subject text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window interval := make_interval(secs => p_window_seconds);
  v_hits integer;
  v_start timestamptz;
begin
  insert into public.auth_rate_limits as r (bucket, subject, window_start, hits)
  values (p_bucket, p_subject, v_now, 1)
  on conflict (bucket, subject) do update
    set hits = case when r.window_start < v_now - v_window then 1 else r.hits + 1 end,
        window_start = case when r.window_start < v_now - v_window then v_now else r.window_start end
  returning r.hits, r.window_start into v_hits, v_start;

  if random() < 0.01 then
    delete from public.auth_rate_limits where window_start < v_now - interval '1 day';
  end if;

  return query select
    v_hits <= p_limit,
    greatest(p_limit - v_hits, 0),
    case
      when v_hits <= p_limit then 0
      else ceil(extract(epoch from (v_start + v_window) - v_now))::integer
    end;
end;
$$;

create or replace function public.auth_email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  );
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.auth_email_exists(text) from public, anon, authenticated;
```

- [ ] **Step 2: Застосувати**

```bash
TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env/.env.local | cut -d= -f2)
mkdir -p /tmp/sb/supabase && cp supabase/config.toml /tmp/sb/supabase/ && cp -r supabase/.temp /tmp/sb/supabase/ && touch /tmp/sb/.env
cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked \
  --file <abs-path>/supabase/migrations/20260726_auth_rate_limit.sql
```

Перевірити: повторний виклик `select * from consume_rate_limit('t','x',2,60)` тричі → третій рядок `allowed=false`, `retry_after>0`. Прибрати тестовий рядок: `delete from auth_rate_limits where bucket='t'`.

---

### Task 2: Серверний rate limit + переписаний email-lookup

**Files:**
- Create: `server/utils/rateLimit.ts`
- Modify: `server/utils/authEmail.ts`, `server/api/auth/email-exists.post.ts`, `server/utils/cachePolicy.ts`

**Interfaces:**
- Produces: `consumeRateLimit(subject, rule)`, `enforceRateLimit(event, subject, rule)`, `clientIp(event)`, `hashSubject(value)`, тип `RateLimitRule = { bucket: string; limit: number; windowSeconds: number }`.
- Consumes: `supabaseAdmin()` з `server/utils/supabaseAdmin.ts`.

- [ ] **Step 1: `server/utils/rateLimit.ts`**

- `clientIp(event)` — `getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'`.
- `hashSubject(value)` — `createHash('sha256').update(value.trim().toLowerCase()).digest('hex')`.
- `consumeRateLimit(subject, rule)` — `admin.rpc('consume_rate_limit', { p_bucket, p_subject, p_limit, p_window_seconds })`; RPC повертає масив із одного рядка. При `error` або порожній відповіді — `logger`-warning і `{ allowed: true, retryAfter: 0 }` (fail-open, як у `trackArtists.ts`).
- `enforceRateLimit(event, subject, rule)` — при `!allowed`: `setResponseHeader(event, 'Retry-After', String(retryAfter))` і `throw createError({ statusCode: 429, statusMessage: 'Too many attempts' })`.

- [ ] **Step 2: `authEmail.ts` на RPC**

Замінити цикл `admin.auth.admin.listUsers()` на `admin.rpc('auth_email_exists', { p_email: normalized })`. Помилка RPC → `createError({ statusCode: 500 })` як зараз (тут fail-open неприпустимий: він дозволив би `signUp` на існуючий email). Нормалізацію email лишити.

- [ ] **Step 3: Ліміти в `email-exists.post.ts`**

Після валідації email:

```ts
await enforceRateLimit(event, clientIp(event), { bucket: 'auth_lookup_ip', limit: 20, windowSeconds: 600 })
await enforceRateLimit(event, hashSubject(email), { bucket: 'auth_lookup_email', limit: 5, windowSeconds: 600 })
```

- [ ] **Step 4: `cachePolicy.ts`**

Додати `rules['/api/auth/**'] = privateCacheRule`.

- [ ] **Step 5: Тести**

Create `tests/unit/authRateLimit.test.ts` за патерном `tests/unit/likeCountersHandler.test.ts` (мок `supabaseAdmin` на `globalThis` + `vi.resetModules()` + динамічний імпорт):
- allowed → без винятку;
- `allowed=false` → 429 і `Retry-After` виставлений;
- RPC error → fail-open, без винятку;
- `hashSubject` не пропускає email у відкритому вигляді (перевірити, що аргумент `p_subject` ≠ email).

Оновити `tests/unit/authEmail.test.ts` під RPC; додати в `tests/unit/cachePolicy.test.ts` перевірку `/api/auth/**`.

- [ ] **Step 6: Верифікація + commit**

```bash
npm run test:unit && npm run typecheck
git add supabase/migrations/20260726_auth_rate_limit.sql server/utils/rateLimit.ts server/utils/authEmail.ts server/api/auth/email-exists.post.ts server/utils/cachePolicy.ts tests/unit
git commit -m "feat(auth): rate-limit email lookup with postgres-backed limiter"
```

---

### Task 3: Two-step `AuthForm.vue`

**Files:**
- Modify: `app/components/AuthForm.vue`, `app/components/AuthCard.vue`

**Interfaces:**
- Produces: `AuthForm` з пропом `variant: 'page' | 'dialog'` (default `'page'`) і опційним `redirectTo`; проп `mode` **зникає**.
- `AuthCard` отримує `variant?: 'page' | 'dialog'`: у `dialog` не рендерить зовнішній `min-h-[70vh]` контейнер і віддає заголовок слотом (у діалозі його рендерить `DialogTitle`).

- [ ] **Step 1: `AuthCard.vue`**

Додати проп `variant` (default `'page'`). У `page` — розмітка 1:1 як зараз. У `dialog` — без `min-h-[70vh] flex items-center justify-center px-4 py-16`, без `<h1>` (замість нього `<slot name="title" />`), `Card` і слоти без змін. `reset-password.vue` продовжує використовувати дефолт — його не чіпати.

- [ ] **Step 2: Крокова машина в `AuthForm.vue`**

```ts
const step = ref<'email' | 'password' | 'forgot' | 'sent'>('email')
const mode = ref<'signin' | 'signup'>('signin')
```

- Валідаційна схема (функціональна, **не** zod): `email` — як зараз; `password` валідується тільки коли `step === 'password'`, з `min(6)` лише за `mode === 'signup'`.
- `step === 'email'`: сабміт → `$fetch('/api/auth/email-exists')` → `mode = exists ? 'signin' : 'signup'`, `step = 'password'`. Помилка 429 (`err.statusCode === 429`) → `error.value = 'Too many attempts. Please try again later.'`.
- `step === 'password'` + `mode === 'signin'`: `signInWithPassword` → помилка в `error`; успіх → `onAuthenticated()`.
- `step === 'password'` + `mode === 'signup'`: `signUp({ emailRedirectTo: \`${window.location.origin}/confirm\` })`; якщо `data.user?.identities?.length === 0` → `error.value = signupExistsMessage`; інакше `step = 'sent'`, `message` = 'Check your email to confirm your account.'
- `step === 'forgot'`: `resetPasswordForEmail` → `step = 'sent'`, message як зараз.
- `onAuthenticated()`: `variant === 'dialog'` → `closeAuthDialog()`; `variant === 'page'` → `navigateTo(props.redirectTo || '/profile')`.
- `watchEffect` авторедіректу залогіненого — тільки при `variant === 'page' && step.value !== 'forgot'`.
- `useSeoMeta` викликати **тільки** при `variant === 'page'` (у діалозі він перетирав би title сторінки).

- [ ] **Step 3: Шаблон**

- `step === 'email'`: Input email + кнопка `Continue` (іконка `lucide:arrow-right`).
- `step === 'password'`: рядок з обраним email + кнопка-лінк `Use a different email` (повертає на `step='email'`, чистить пароль); `PasswordInput` з `:autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"`; кнопка `Sign In` / `Create Account`; лінк `Forgot password?` (→ `step='forgot'`) лише при `mode === 'signin'`.
- `step === 'sent'`: тільки `<Alert variant="success">` (він уже рендериться `AuthCard`) + кнопка `Back` на `step='email'`; поля приховані.
- Футер зі старими «Don't have an account? / Sign Up» видаляється — режим більше не обирає користувач.
- Заголовок: `Sign In` (email/forgot-перехід — `Reset Password`), `Sign In` / `Create Account` на кроці пароля, `Check Your Email` на `sent`.
- `aria-live="polite"` на контейнері помилки/повідомлення не додавати окремо — `Alert` уже має `role`; перевірити фактичну розмітку `ui/alert` і за потреби додати `role="alert"`.

- [ ] **Step 4: Верифікація**

Тимчасово залишити `signin.vue` як `<AuthForm />` і прогнати вручну на порту 3100: новий email → крок пароля в signup-режимі; існуючий → signin; невірний пароль → generic помилка; forgot → лист.

- [ ] **Step 5: commit**

```bash
git add app/components/AuthForm.vue app/components/AuthCard.vue
git commit -m "feat(auth): merge sign-in and sign-up into a two-step form"
```

---

### Task 4: `AuthDialog` + `useAuthDialog()`

**Files:**
- Create: `app/composables/useAuthDialog.ts`, `app/components/AuthDialog.vue`
- Modify: `app/layouts/default.vue`

**Interfaces:**
- Produces: `useAuthDialog()` → `{ state, openAuthDialog(options?), closeAuthDialog() }`, де `options = { redirectTo?: string }`. Стан через `useState('auth-dialog', () => ({ open: false, redirectTo: '' }))`.

- [ ] **Step 1: Composable**

Мінімальний: `open` boolean + `redirectTo`. Жодних додаткових опцій «про запас».

- [ ] **Step 2: `AuthDialog.vue`**

За зразком `OpenImage.vue`:

```html
<DialogRoot v-model:open="isOpen">
  <DialogPortal>
    <DialogOverlay as-child>
      <Overlay class="reka-fade fixed inset-0 z-50" />
    </DialogOverlay>
    <DialogContent class="reka-fade fixed inset-0 m-auto z-50 w-full max-w-sm h-fit px-4 focus:outline-none">
      <DialogTitle class="…">{{ title }}</DialogTitle>
      <AuthForm variant="dialog" />
      <DialogClose as-child><CloseBtn … /></DialogClose>
    </DialogContent>
  </DialogPortal>
</DialogRoot>
```

`.reka-fade` keyframes перенести в глобальний CSS **тільки якщо** вони не доступні з `OpenImage.vue` (там `<style>` без `scoped`, тобто вже глобальні) — не дублювати. Заголовок брати з `AuthForm` через слот або дублювати мінімально; уникнути двох `<h1>` на сторінці.

- [ ] **Step 3: Монтаж у layout**

У `app/layouts/default.vue` додати `<AuthDialog />` поряд із `<GlobalPlayer>`.

- [ ] **Step 4: Верифікація a11y**

Dev на 3100: Esc закриває, Tab не виходить за межі діалогу, фокус повертається на тригер, оверлей клікабельний для закриття, діалог видно поверх `GlobalPlayer`.

- [ ] **Step 5: commit**

```bash
git add app/composables/useAuthDialog.ts app/components/AuthDialog.vue app/layouts/default.vue
git commit -m "feat(auth): add global sign-in dialog"
```

---

### Task 5: Роути, тригери, редіректи

**Files:**
- Create: `app/pages/auth.vue`
- Delete: `app/pages/signin.vue`, `app/pages/signup.vue`, `app/pages/forgot-password.vue`
- Modify: `nuxt.config.ts`, `server/utils/robotsPolicy.ts`, `app/constants/nav.ts`, `app/middleware/auth.ts`, `app/components/Header.vue`, `app/components/OpenSidebar.vue`

- [ ] **Step 1: `app/pages/auth.vue`**

```vue
<script setup lang="ts">
const route = useRoute()
const redirectTo = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''))
</script>

<template>
  <AuthForm variant="page" :redirect-to="redirectTo" :initial-mode="route.query.mode === 'forgot' ? 'forgot' : undefined" />
</template>
```

`initialMode` — опційний проп `AuthForm` (лише `'forgot'`), який стартує на кроці `forgot`. Якщо на Task 3 він не був доданий — додати зараз.

Валідація `redirect`: приймати тільки шляхи, що починаються з `/` і не з `//` — інакше open redirect. Реалізувати у `AuthForm.onAuthenticated()`.

- [ ] **Step 2: Редіректи + noindex**

`nuxt.config.ts` `routeRules`:

```ts
'/signin': { redirect: { to: '/auth', statusCode: 302 } },
'/signup': { redirect: { to: '/auth', statusCode: 302 } },
'/forgot-password': { redirect: { to: '/auth?mode=forgot', statusCode: 302 } },
```

`redirectOptions.login` → `'/auth'`. У `robotsPolicy.ts` додати `/auth` до `noindexRoutes` (старі шляхи лишити — правило нешкідливе).

- [ ] **Step 3: Видалити старі сторінки**

`git rm app/pages/signin.vue app/pages/signup.vue app/pages/forgot-password.vue`.

- [ ] **Step 4: Тригери**

`nav.ts:33`: ключ `/signin` → `/auth`, список аліасів — `['/auth', '/signin', '/signup', '/forgot-password', '/reset-password']`.

`Header.vue` і `OpenSidebar.vue`: посилання лишається `to="/auth"`, додається

```ts
function onAuthClick(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
  event.preventDefault()
  openAuthDialog({ redirectTo: useRoute().fullPath })
}
```

**Перевірити**, що нативний `@click` доходить крізь `DefaultButton` до внутрішнього `NuxtLink` (inheritAttrs). Якщо ні — замінити тригер на власний `<NuxtLink>` з тими самими класами або додати `emit('click', event)` у `DefaultButton`. У сайдбарі перед відкриттям діалогу закрити сайдбар.

`Header.vue:30`: `signOut()` → `navigateTo('/auth')`.
`middleware/auth.ts`: `navigateTo(\`/auth?redirect=${encodeURIComponent(to.fullPath)}\`)` (додати параметр `to`).

- [ ] **Step 5: Верифікація**

Dev на 3100: `/signin` → 302 на `/auth` (перевірити `curl -I`); клік по signin у header відкриває модалку; Cmd-клік відкриває `/auth` у новій вкладці; `/profile` без сесії → `/auth?redirect=%2Fprofile`, після входу веде на `/profile`; підсвітка активного пункту nav працює.

- [ ] **Step 6: commit**

```bash
git add -A
git commit -m "feat(auth): serve sign-in and sign-up from a single /auth route"
```

---

### Task 6: Тести

**Files:**
- Modify: `tests/unit/authPages.test.ts`, `tests/unit/robotsPolicy.test.ts`
- Create: `tests/e2e/auth-dialog.spec.ts`

- [ ] **Step 1: Unit**

`authPages.test.ts` переписати під нову структуру (файлові asserts, як зараз):
- `app/pages/auth.vue` існує і рендерить `variant="page"`;
- `AuthForm.vue` містить кроки `'email'`, `'password'`, `'forgot'`, `'sent'` і виклик `/api/auth/email-exists`;
- `signin.vue`/`signup.vue`/`forgot-password.vue` більше не існують;
- `nuxt.config.ts` містить редіректи трьох старих шляхів і `login: '/auth'`;
- `layouts/default.vue` монтує `<AuthDialog />`;
- `AuthForm.vue` зберігає `signupExistsMessage`.

`robotsPolicy.test.ts` — `/auth` у результаті `buildNoindexRouteRules()`.

- [ ] **Step 2: E2E**

`tests/e2e/auth-dialog.spec.ts`: з `/` клік по signin у header → діалог видимий, має accessible name; Esc закриває; `/signin` редіректить на `/auth`. (Playwright поки не в CI — тест пишемо, але gate лишається на `test:unit`.)

- [ ] **Step 3: Прогін**

```bash
npm run test:unit && npm run typecheck && npm run typecheck:ts7
npm run test:e2e -- auth-dialog
```

Очікуваний baseline після змін: 42 файли (був 41) — звірити фактичне число і зафіксувати в AGENTS.md на Task 7.

- [ ] **Step 4: commit**

```bash
git add tests
git commit -m "test(auth): cover unified auth route and sign-in dialog"
```

---

### Task 7: Документація

**Files:**
- Modify: `AGENTS.md`, `docs/roadmap.md`
- Create: `docs/initiatives/unified-auth.md`

- [ ] **Step 1: `AGENTS.md`**

Секція **Auth** переписується: один роут `/auth`, two-step форма, 302 зі старих шляхів, `AuthDialog` + `useAuthDialog()` у `layouts/default.vue`, `AuthCard` variant, rate limit (`server/utils/rateLimit.ts`, бакети й ліміти, fail-open, Postgres-сховище). Оновити verification baseline (кількість тестів).

- [ ] **Step 2: Roadmap**

`docs/initiatives/unified-auth.md` за шаблоном інших файлів (Status `Implemented`, Priority P2, `Ініційовано: 2026-07-26`, посилання на spec/plan). Рядок у `docs/roadmap.md` (P2) і оновлений `Last reviewed`. У `mutation-hardening.md` додати примітку, що спільний limiter уже існує в `server/utils/rateLimit.ts`.

- [ ] **Step 3: commit + merge**

```bash
git add AGENTS.md docs
git commit -m "docs(auth): document unified auth route and rate limiter"
git checkout main && git merge --squash feature/unified-auth
```

---

## Definition of Done

- `/auth` обслуговує вхід, реєстрацію і reset; старі три шляхи віддають 302.
- Модалка відкривається з header і sidebar, вхід не збиває поточну сторінку.
- 21-й lookup з IP за 10 хв → 429 з `Retry-After`; помилка RPC не ламає флоу.
- `npm run test:unit`, `npm run typecheck`, `npm run typecheck:ts7` зелені.
- `AGENTS.md` і roadmap описують фактичний стан.
