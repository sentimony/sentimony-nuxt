# Vitest Setup + useLikes Baseline Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Налаштувати Vitest + @nuxt/test-utils + @vue/test-utils, написати 5 baseline-тестів на `useLikes` (release-likes), які фіксують поточну поведінку як safety-net перед рефакторингом likes-фабрики.

**Architecture:** Vitest з `nuxt`-environment (через `@nuxt/test-utils/config`), happy-dom як DOM-runtime. Тести лежать у `tests/composables/`. Композаблі викликаються в `setup()` фейкового компонента через хелпер `withSetup()`, бо `onMounted`/`useState` потребують Vue-контексту. Зовнішні залежності (`useSupabaseUser`, `navigateTo`, `$fetch`) мокаються через `mockNuxtImport` і `vi.stubGlobal`. Серверні мережеві запити НЕ робляться — `$fetch` підмінюємо `vi.fn()`.

**Tech Stack:** Vitest 3.x · @nuxt/test-utils 3.x · @vue/test-utils 2.x · happy-dom · TypeScript · Nuxt 4 auto-imports.

---

## Context для виконавця

**Поточний стан тестування:** жодного. У `package.json` немає `test`-скрипта і нема ні Vitest, ні Jest. Цей план — інфраструктурний bootstrap.

**Чому саме `useLikes` як перший:**
1. Він невеликий (57 рядків), але має 4 нетривіальні поведінки: load on mount, optimistic toggle, rollback on error, login-redirect для гостей.
2. Найближчий рефакторинг (`docs/superpowers/plans/2026-05-01-likes-factory.md`) переписує саме його. Тести будуть safety-net: якщо після міграції на фабрику зеленими лишаться — поведінка збережена.
3. Це шаблон для наступних композаблів (`useArtistLikes`, `useTrackLikes` тощо).

**Чому `useLikes`, а не `createLikes`:** на момент виконання цього плану `createLikes` ще не існує — він з'явиться як частина паралельного/наступного плану. Тестуємо існуючий код, щоб мати baseline.

**Що НЕ покривається цим планом** (окремі майбутні плани):
- Тести для решти likes-композаблів — після того, як шаблон тут перевірено, копіювання тривіальне.
- Тести серверних API endpoint-ів (`server/api/*-likes/*.ts`) — потребують `setup({ server: true })` від @nuxt/test-utils, що значно складніше.
- Component-тести (`Item.vue`, `Tabs.vue`, `OpenImage.vue`) — окрема задача.
- E2E через Playwright.
- CI integration — згадано в Notes наприкінці як next-step.

**Особливості Nuxt-тестового середовища:**
- `useState`, `useSupabaseUser`, `navigateTo`, `$fetch` — auto-imports, доступні в тестах коли `environment: 'nuxt'`.
- `onMounted` працює лише всередині `setup()` компонента — тому композабль викликаємо через `withSetup()`-хелпер з `@vue/test-utils.mount`.
- `useState` між тестами може зберігати стан, якщо ключ той самий. Vitest за замовчуванням ізолює тестові файли (worker pool), але не окремі `it`-ки в одному файлі. Тому в `beforeEach` робимо повний reset — або через `nuxtApp.payload.state[key] = undefined`, або через перемоунт компонента (краще — простіше).

**Mock-стратегія:**
- `useSupabaseUser` → `mockNuxtImport` повертає `ref<User | null>`, який тест змінює через `userMock.value = ...`.
- `navigateTo` → `mockNuxtImport` повертає `vi.fn()`.
- `$fetch` → `vi.stubGlobal('$fetch', vi.fn())` у `beforeEach`. У кожному тесті задається `.mockResolvedValue(...)` чи `.mockRejectedValue(...)`.

**TDD-нюанс:** оскільки ми тестуємо ВЖЕ ІСНУЮЧИЙ код, тести мають зеленіти одразу при першому запуску. Якщо тест red — це баг у тесті/моках, не в коді. Класичний цикл "red → green → commit" перетворюється на "write → run → expect green; if red, debug → green → commit".

---

## File Structure

**Create:**
- `vitest.config.ts` — Vitest конфіг через `@nuxt/test-utils/config`.
- `tests/setup.ts` — спільний test-setup (глобальні mock-и `useSupabaseUser`, `navigateTo`).
- `tests/utils/withSetup.ts` — хелпер для виклику композаблів у Vue-компоненті.
- `tests/composables/useLikes.spec.ts` — 5 тестів.

**Modify:**
- `package.json` — додати `test` і `test:watch` скрипти + devDependencies.
- `.gitignore` — додати `coverage/` (на майбутнє).

**Не змінюємо:**
- `tsconfig.json` — Nuxt-генерований tsconfig з `.nuxt/tsconfig.app.json` уже включає `vitest/globals` коли встановлено пакет.
- Жоден код в `app/` — тільки тести.

---

## Task 1: Установити залежності та створити Vitest-конфіг

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Встановити dev-залежності**

Run:
```bash
npm i -D vitest @nuxt/test-utils @vue/test-utils happy-dom
```

Expected: чотири пакети додані в `devDependencies`. `package-lock.json` оновлений.

- [ ] **Step 2: Створити `vitest.config.ts`**

Файл `vitest.config.ts` (у корені, поруч з `nuxt.config.ts`):
```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.spec.ts'],
  },
})
```

- [ ] **Step 3: Додати npm-скрипти**

В `package.json` секція `scripts` — додати два рядки:
```json
"test": "vitest run",
"test:watch": "vitest",
```

Фінальна `scripts` секція виглядає так:
```json
"scripts": {
  "build": "nuxt build",
  "dev": "node --env-file=.env.local node_modules/.bin/nuxt dev",
  "generate": "nuxt generate",
  "preview": "nuxt preview",
  "postinstall": "nuxt prepare",
  "sync:firebase": "firebase database:set / public/data/sentimony-db-export.json -P sentimony-db -f",
  "sync:supabase": "node --env-file=.env.local scripts/sync-supabase.mjs",
  "deploy:stage": "netlify deploy --alias stage --context deploy-preview",
  "deploy:prod": "netlify deploy --prod",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Додати `coverage/` у `.gitignore`**

В `.gitignore` додати рядок (наприкінці):
```
coverage/
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .gitignore
git commit -m "chore(test): bootstrap vitest with @nuxt/test-utils"
```

---

## Task 2: Створити test-setup і `withSetup` helper

**Files:**
- Create: `tests/setup.ts`
- Create: `tests/utils/withSetup.ts`

- [ ] **Step 1: Створити `tests/setup.ts`**

Файл `tests/setup.ts`:
```ts
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi, beforeEach } from 'vitest'

export const userMock = ref<{ id: string } | null>(null)
export const navigateToMock = vi.fn()

mockNuxtImport('useSupabaseUser', () => () => userMock)
mockNuxtImport('navigateTo', () => navigateToMock)

beforeEach(() => {
  userMock.value = null
  navigateToMock.mockClear()
  vi.stubGlobal('$fetch', vi.fn())
})
```

- [ ] **Step 2: Створити `tests/utils/withSetup.ts`**

Файл `tests/utils/withSetup.ts`:
```ts
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

export function withSetup<T>(composable: () => T): { result: T, wrapper: VueWrapper } {
  let result!: T
  const wrapper = mount(defineComponent({
    setup() {
      result = composable()
      return () => h('div')
    },
  }))
  return { result, wrapper }
}
```

Цей хелпер дозволяє викликати композабль у Vue-контексті (потрібно для `onMounted`, `useState`). Повертає і result композабля, і wrapper — щоб тест міг зробити `wrapper.unmount()` між тестами при потребі.

- [ ] **Step 3: Sanity-test, що інфраструктура працює**

Файл `tests/sanity.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('vitest setup', () => {
  it('запускається в nuxt-environment', () => {
    expect(typeof useState).toBe('function')
    expect(typeof navigateTo).toBe('function')
  })
})
```

- [ ] **Step 4: Запустити sanity-test**

Run: `npm test`
Expected:
- 1 test passed (`tests/sanity.spec.ts`).
- Жодного error про missing module чи Vue context.

Якщо тест red:
- Якщо «Cannot find module '@nuxt/test-utils'» → пакет не встановився, повторити Task 1 Step 1.
- Якщо «useState is not defined» → перевірити, що `environment: 'nuxt'` у `vitest.config.ts`.
- Якщо «document is not defined» → встановити `happy-dom` (вже мало бути в Task 1).

- [ ] **Step 5: Видалити sanity-test**

Sanity нам більше не потрібен — він був разовий індикатор.
```bash
rm tests/sanity.spec.ts
```

- [ ] **Step 6: Commit**

```bash
git add tests/setup.ts tests/utils/withSetup.ts
git commit -m "test: add nuxt test setup and withSetup helper"
```

---

## Task 3: Тест — `load()` робить GET `/api/likes` і заповнює slug-и

**Files:**
- Create: `tests/composables/useLikes.spec.ts`

- [ ] **Step 1: Створити тест-файл з першим тестом**

Файл `tests/composables/useLikes.spec.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { withSetup } from '../utils/withSetup'
import { userMock } from '../setup'

describe('useLikes', () => {
  beforeEach(() => {
    useState<string[]>('likes', () => []).value = []
    useState<boolean>('likes-loaded', () => false).value = false
    useState<Record<string, number>>('like-counts', () => ({})).value = {}
  })

  it('завантажує лайки на mount, якщо user залогінений', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn().mockResolvedValue(['slug-a', 'slug-b'])
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useLikes())
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/api/likes')
    expect(result.isLiked('slug-a')).toBe(true)
    expect(result.isLiked('slug-b')).toBe(true)
    expect(result.isLiked('slug-c')).toBe(false)
  })
})
```

Reset-логіка у `beforeEach` критична: Nuxt-context живе один на тест-файл (не на `it`), а `useState` — глобальний кеш у цьому контексті. Без reset-у тест 2 побачить slugs з тесту 1 і `loaded === true`, тому повторний `load()` НЕ виконається.

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: 1 test passed. Якщо red:
- «useLikes is not a function» → переконатись, що `app/composables/useLikes.ts` існує і експортує `useLikes`.
- «$fetch is not defined» → `vi.stubGlobal('$fetch', ...)` має бути ДО `withSetup`, не після (порядок матеріалу важливий).

- [ ] **Step 3: Commit**

```bash
git add tests/composables/useLikes.spec.ts
git commit -m "test(likes): cover useLikes load on mount"
```

---

## Task 4: Тест — `isLiked` і `likeCount` віддзеркалюють стан

**Files:**
- Modify: `tests/composables/useLikes.spec.ts`

- [ ] **Step 1: Додати тест**

В кінець `describe('useLikes', () => { ... })` додати:
```ts
  it('isLiked повертає false і likeCount = 0 для невідомого slug', async () => {
    userMock.value = { id: 'user-1' }
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]))

    const { result } = withSetup(() => useLikes())
    await flushPromises()

    expect(result.isLiked('unknown')).toBe(false)
    expect(result.likeCount('unknown')).toBe(0)
  })
```

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: 2 tests passed.

- [ ] **Step 3: Commit**

```bash
git add tests/composables/useLikes.spec.ts
git commit -m "test(likes): cover isLiked/likeCount defaults"
```

---

## Task 5: Тест — `toggleLike` додає slug і робить POST

**Files:**
- Modify: `tests/composables/useLikes.spec.ts`

- [ ] **Step 1: Додати тест**

```ts
  it('toggleLike оптимістично додає slug і шле POST /api/likes', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce([])           // initial load
      .mockResolvedValueOnce({ ok: true }) // POST
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useLikes())
    await flushPromises()

    await result.toggleLike('slug-x')

    expect(result.isLiked('slug-x')).toBe(true)
    expect(result.likeCount('slug-x')).toBe(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/likes', {
      method: 'POST',
      body: { slug: 'slug-x' },
    })
  })
```

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: 3 tests passed.

- [ ] **Step 3: Commit**

```bash
git add tests/composables/useLikes.spec.ts
git commit -m "test(likes): cover toggleLike optimistic add"
```

---

## Task 6: Тест — `toggleLike` робить rollback при server error

**Files:**
- Modify: `tests/composables/useLikes.spec.ts`

- [ ] **Step 1: Додати тест**

```ts
  it('toggleLike відкочує оптимістичний стан при помилці server-у', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce([])                          // initial load
      .mockRejectedValueOnce(new Error('500 Server Error')) // POST fails
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useLikes())
    await flushPromises()

    await result.toggleLike('slug-y')

    expect(result.isLiked('slug-y')).toBe(false)
    expect(result.likeCount('slug-y')).toBe(0)
  })
```

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: 4 tests passed. Тест верифікує, що `.catch(() => {...})` блок у `toggleLike` дійсно реверсує state.

- [ ] **Step 3: Commit**

```bash
git add tests/composables/useLikes.spec.ts
git commit -m "test(likes): cover toggleLike rollback on error"
```

---

## Task 7: Тест — `toggleLike` без user → редірект на `/login`

**Files:**
- Modify: `tests/composables/useLikes.spec.ts`

- [ ] **Step 1: Додати тест**

Імпорт треба розширити — на початку файлу замінити:
```ts
import { userMock } from '../setup'
```
на:
```ts
import { userMock, navigateToMock } from '../setup'
```

Додати тест:
```ts
  it('toggleLike без залогіненого user-а робить navigateTo("/login") і не шле fetch', async () => {
    userMock.value = null
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useLikes())
    await flushPromises()

    await result.toggleLike('slug-z')

    expect(navigateToMock).toHaveBeenCalledWith('/login')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.isLiked('slug-z')).toBe(false)
  })
```

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: 5 tests passed.

- [ ] **Step 3: Commit**

```bash
git add tests/composables/useLikes.spec.ts
git commit -m "test(likes): cover login redirect for guest toggle"
```

---

## Task 8: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Прогнати весь test-suite**

Run: `npm test`
Expected: 5 tests passed, 0 failed, час виконання <5s.

- [ ] **Step 2: Перевірити, що watch-mode працює**

Run: `npm run test:watch` → дочекатись запуску → змінити будь-який тест (наприклад додати зайвий expect, що падає) → переконатись, що watcher переsапускає → відкотити правку → переконатись, що тест знову passing → Ctrl+C.

- [ ] **Step 3: Type-check весь проєкт**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors. Тестові файли імпортують типи з vitest/vue-test-utils — переконатись, що типи з'явились після `postinstall` (коли `nuxt prepare` запустився).

- [ ] **Step 4: Перевірити, що build не зламався**

Run: `npm run build`
Expected: build success. Тестові файли в `tests/` НЕ повинні потрапляти в Nuxt-білд (Nuxt сканує `app/`, `server/`, `shared/`).

- [ ] **Step 5: Перевірити LOC і готовність до розширення**

Run: `wc -l tests/composables/useLikes.spec.ts tests/setup.ts tests/utils/withSetup.ts vitest.config.ts`
Expected: загалом ~80–100 рядків. Це шаблон для копіювання на інші композаблі.

- [ ] **Step 6: Final commit (якщо щось додалось)**

```bash
git status
# Якщо чисто — нічого не комітимо.
```

---

## Notes для виконавця

**Якщо тести впадуть на CI, але працюють локально:**
- Найімовірніша причина — race у `flushPromises`. Спробуй замінити `await flushPromises()` на `await new Promise(r => setTimeout(r, 0))` + `await flushPromises()` (двофазне чекання).

**Якщо `useState` між тестами «протікає»:**
- Тобто другий тест бачить state від першого. Це означає, що Vitest не ізолює окремі `it` (вони ділять той самий Nuxt context). Вирішення: у `beforeEach` (в `setup.ts`) додати ручний reset:
  ```ts
  import { useState } from '#imports'  // якщо потрібно
  // у beforeEach:
  useState('likes:release:slugs').value = []  // приклад
  ```
  Але краще: робити `wrapper.unmount()` наприкінці кожного `it` через `afterEach` + перемоунтити при потребі. У моєму плані beforeEach скидає mock-и, але НЕ скидає useState — якщо побачиш протікання, додай.

**Що далі (поза цим планом):**
1. **Скопіювати шаблон на решту 5 likes-композаблів** (~30 хв) — той самий набір тестів з заміненим endpoint-ом.
2. **Покрити `createLikes` фабрику** після її імплементації — переписати тести на `useLikes` так, щоб вони перевіряли і фабрику теж (обгортка тривіальна, тести не міняються — це і є safety-net).
3. **Додати CI** (`.github/workflows/test.yml`) — `npm ci && npm test && npx vue-tsc --noEmit && npm run build`. Запускати на push/PR.
4. **Server-API тести** (Task 22 з беклогу) — `setup({ server: true })` від @nuxt/test-utils, мокати `serverSupabaseUser` і `supabaseAdmin()`.
5. **Component-тести** для `Tabs.vue` (keyboard navigation), `OpenImage.vue`/`OpenSidebar.vue` (Esc + scroll-lock).
6. **Playwright E2E** для login → like → profile flow.

**`mockNuxtImport` нюанс:** працює тільки коли тестова утиліта виконується ДО першого імпорту мокованого модуля. У `tests/setup.ts` (через `setupFiles` у конфізі) це гарантовано — викликається перед усім.
