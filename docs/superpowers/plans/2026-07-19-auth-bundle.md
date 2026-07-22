# Auth Bundle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Прибрати auth-стан із критичного шляху глобального layout: user-меню хедера, аватар сайдбара і Toaster гідратуються ліниво; внесок supabase-js/vue-sonner виміряний і зафіксований.

**Architecture:** Вимірювання (`nuxi analyze`) → екстракція `HeaderUserMenu.vue` і lazy-гідратація auth-залежних блоків → контрольний замір + ADR-рішення щодо модульного плагіна. `@nuxtjs/supabase` модуль і всі auth-флоу не змінюються.

**Tech Stack:** Nuxt 4 lazy hydration, @nuxtjs/supabase, vue-sonner.

**Spec:** `docs/superpowers/specs/2026-07-19-auth-bundle-design.md`

## Global Constraints

- Гілка `json-to-yml`, без git worktrees; нових залежностей не додавати.
- Auth-флоу недоторканні: signin/signup/forgot/confirm/reset, signOut, middleware `/profile/**`.
- `createLikes` не змінюється.
- Кожна зміна — окремий коміт із вимірюванням у повідомленні.

---

### Task 1: Baseline

- [ ] **Step 1: Bundle analyze**

Run: `npx nuxi analyze`
Записати: розмір entry, чанк(и) з `@supabase/supabase-js`, `vue-sonner`, `vee-validate` — у яких чанках і скільки KiB. Якщо `vee-validate` в entry (не в чанках auth-сторінок) — додати окрему таску на виправлення імпорту (за фактом).

---

### Task 2: `HeaderUserMenu.vue`

**Files:**
- Create: `app/components/HeaderUserMenu.vue`
- Modify: `app/components/Header.vue`

**Interfaces:**
- Produces: `HeaderUserMenu.vue` — самодостатній компонент без пропсів: `useSupabaseClient`/`useSupabaseUser`, dropdown залогіненого (аватар, лінки профілю, signOut) і гостьовий стан (лінк `/signin`) — увесь auth-блок поточного `Header.vue` переїжджає сюди 1:1.
- `Header.vue` більше не імпортує supabase-composables; монтує `<LazyHeaderUserMenu hydrate-on-idle />` на місці старого блоку.

- [ ] **Step 1: Екстракція**

Перенести з `Header.vue` у новий `app/components/HeaderUserMenu.vue`: рядки з `useSupabaseClient()`/`useSupabaseUser()`, `signOut()`, і шаблонний блок user-меню/signin-лінка (разом зі стилями/класами, `aria-label` зберегти). У `Header.vue` на місці блоку:

```html
    <LazyHeaderUserMenu hydrate-on-idle />
```

Жодних змін розмітки всередині перенесеного блоку — тільки переміщення.

- [ ] **Step 2: Верифікація auth-флоу**

Run: dev; перевірити: (гість) хедер показує signin-лінк, перехід на `/signin` працює; (залогінений — тестовий акаунт) аватар/меню з'являється, signOut працює, після signOut меню повертається до гостьового стану. Консоль без hydration warnings.

- [ ] **Step 3: Тести + typecheck + commit**

Run: `npm run test:unit && npx nuxi typecheck` → зелено.

```bash
git add app/components/HeaderUserMenu.vue app/components/Header.vue
git commit -m "perf(header): extract auth user menu into idle-hydrated component"
```

---

### Task 3: Аватар-блок `OpenSidebar.vue`

**Files:**
- Modify: `app/components/OpenSidebar.vue` (+ Create: `app/components/SidebarUserCard.vue`, якщо блок більший за кілька рядків)

- [ ] **Step 1: Та сама екстракція**

Блок, що використовує `useSupabaseUser()` у сайдбарі, винести в `SidebarUserCard.vue` (без пропсів, розмітка 1:1) і монтувати `<LazySidebarUserCard hydrate-on-idle />`. Якщо блок тривіальний (один рядок аватара) — допустимо замість екстракції відкласти весь сайдбар-контент, але лише якщо сайдбар не видимий до взаємодії (перевірити: якщо він off-canvas — гідратувати `hydrate-on-interaction`).

- [ ] **Step 2: Верифікація + тести + commit**

Ті самі перевірки, що в Task 2 (гість/залогінений, відкриття сайдбару).

```bash
git add app/components/OpenSidebar.vue app/components/SidebarUserCard.vue
git commit -m "perf(sidebar): idle-hydrate auth-dependent user card"
```

---

### Task 4: Lazy `Toaster`

**Files:**
- Modify: `app/app.vue`

- [ ] **Step 1: Відкласти гідратацію**

У `app/app.vue` замінити `<Toaster … />` (явний імпорт із `~/components/ui/sonner`) на lazy-варіант:

```html
    <LazyToaster hydrate-on-idle />
```

Якщо auto-import lazy-варіанта для явно імпортованого компонента не спрацює (компонент імпортується вручну через export-ім'я ≠ ім'я файлу `Sonner.vue`) — залишити явний імпорт, але обгорнути через `defineAsyncComponent`:

```ts
const Toaster = defineAsyncComponent(() => import('~/components/ui/sonner').then(m => m.Toaster))
```

- [ ] **Step 2: Верифікація**

Run: dev; викликати помилку лайка (вимкнути мережу → клік лайка) — toast з'являється. Консоль чиста.

- [ ] **Step 3: Тести + commit**

```bash
git add app/app.vue
git commit -m "perf(app): lazy-mount sonner toaster"
```

---

### Task 5: Контрольний замір + ADR

- [ ] **Step 1: Повторний analyze**

Run: `npx nuxi analyze`
Порівняти з Task 1: дельта entry і чанків; числа — у PR-опис.

- [ ] **Step 2: ADR-рішення щодо модульного плагіна**

Якщо `@supabase/supabase-js` лишається в entry > ~30 KiB gzip — додати в `docs/roadmap/auth-bundle.md` пункт «Замінити @nuxtjs/supabase плагін на ручний lazy-клієнт» з виміряними числами. Якщо ні — зафіксувати в PR, що подальша оптимізація недоцільна.

- [ ] **Step 3: Повна верифікація + commit**

Run: `npm run test:unit && npx nuxi typecheck && node scripts/web-debug.mjs` → зелено.

```bash
git add docs/roadmap/auth-bundle.md
git commit -m "docs(roadmap): record auth bundle results and follow-up decision"
```
