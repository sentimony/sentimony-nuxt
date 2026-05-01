# Likes Factory Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Замінити шість майже ідентичних likes-композаблів (`useLikes`, `useArtistLikes`, `useTrackLikes`, `useEventLikes`, `usePlaylistLikes`, `useVideoLikes`) на одну фабрику `createLikes()` без зміни публічного контракту для call-sites.

**Architecture:** Створюємо `app/composables/createLikes.ts` — фабрика приймає `{ entity, endpoint }` і повертає стандартний контракт `{ isLiked, likeCount, toggleLike, fetchCount, setCount }`. Кожен з п'яти простих композаблів стає однорядковою обгорткою. `useTrackLikes` отримує alias-mapper, що перейменовує методи під його legacy-API (`isTrackLiked` тощо), бо call-sites цього очікують. Серверні endpoint-и не чіпаємо — тільки клієнтський шар.

**Tech Stack:** Nuxt 4 auto-imports (`useState`, `useSupabaseUser`, `$fetch`, `navigateTo`, `onMounted`, `watch`), TypeScript, `vue-tsc` для перевірки типів.

---

## Context для виконавця

**Що дублюється.** Усі шість композаблів мають ідентичну структуру (~57 рядків кожен):
1. Три `useState`: `*-likes` (масив slug-ів), `*-likes-loaded` (boolean), `*-like-counts` або `*-counts` (record).
2. `isLiked(slug)` + `likeCount(slug)`.
3. `load()` — GET `/api/<entity>-likes`, заповнює slugs.
4. `fetchCount(slug)` — GET `/api/<entity>-likes/count/<slug>`.
5. `onMounted(load)` + `watch(user, ...)`.
6. `toggleLike(slug)` — оптимістичний flip + POST/DELETE з відкатом on error; гард `if (!user) navigateTo('/login')`.

**Що різниться між композаблями:**
- `useState`-ключі (`likes` / `artist-likes` / `track-likes` / `event-likes` / `playlist-likes` / `video-likes`) і відповідні `*-loaded`, `*-like-counts` (для releases/artists/events/playlists/videos) / `track-counts` (для track).
- API endpoint base (`/api/likes` для release — без префіксу; решта `/api/<entity>-likes`).
- `useTrackLikes` повертає методи з префіксом `Track` і додає `setTrackCount` + `fetchTrackCount`.

**Call-sites (вже знайдені через grep):**
- `useLikes()` → `app/pages/release/[id].vue:6`
- `useArtistLikes()` → `app/pages/artist/[id].vue:6`, `app/components/Item.vue:10`
- `useEventLikes()` → `app/pages/event/[id].vue:6`
- `usePlaylistLikes()` → `app/pages/playlist/[id].vue:6`
- `useVideoLikes()` → `app/pages/video/[id].vue:5`
- `useTrackLikes()` → `app/pages/release/[id].vue:7` (без `fetchTrackCount`), `app/pages/track/[id].vue:5-11` (всі п'ять методів)

**Тестове покриття.** Цей план припускає, що тестова інфраструктура з планів `2026-05-01-vitest-setup.md` (Vitest + 5 тестів на `useLikes`) і опційно `component-tests.md`/`server-route-tests.md`/`playwright-e2e.md` уже встановлена. Task 0 нижче розширює baseline-тести на решту 5 композаблів, щоб мати safety-net для всього рефакторингу. Після Task 0 кожен Task 2-7 верифікується автоматично через `npm test` замість manual smoke.

Якщо тестова інфраструктура НЕ встановлена — пропусти Task 0 і у Tasks 2-7 заміни «Manual smoke» інструкції на ручний прохід у dev (legacy-режим плану). Це менш безпечно, але робоче.

**`useState` ключі.** Через `useState` Nuxt тримає стейт у per-request SSR payload + клієнтську гідрацію. Якщо ми поміняємо ключі, нічого не зламається — це не localStorage. Однак у межах одного композабля старі та нові ключі НЕ повинні конфліктувати, тому при міграції замінюємо повністю, а не паралельно.

**Синхронізація тестів і ключів.** Існуючий `tests/composables/useLikes.spec.ts` у `beforeEach` ресетить **legacy useState-ключі** (`'likes'`, `'likes-loaded'`, `'like-counts'`). Після Task 2 (мігруючи `useLikes` на фабрику) ключі змінюються на `likes:release:slugs|loaded|counts` — `beforeEach` тестів перестане ресетити правильні значення, тести можуть протікати. Тому у Task 2 **обов'язково оновити `beforeEach` синхронно** з production-кодом — це частина того ж комміту. Те саме для Tasks 3-7 і відповідних spec-файлів, що з'явилися в Task 0.

**API/серверну частину НЕ чіпаємо** — це окрема задача (пункт 1 mirror на сервері — продовження беклогу, не цей план).

---

## File Structure

**Create:**
- `app/composables/createLikes.ts` — фабрика.
- `tests/composables/useArtistLikes.spec.ts` (Task 0)
- `tests/composables/useEventLikes.spec.ts` (Task 0)
- `tests/composables/usePlaylistLikes.spec.ts` (Task 0)
- `tests/composables/useVideoLikes.spec.ts` (Task 0)
- `tests/composables/useTrackLikes.spec.ts` (Task 0)

**Modify (повна заміна вмісту, кожен ≤10 рядків після рефакторингу):**
- `app/composables/useLikes.ts`
- `app/composables/useArtistLikes.ts`
- `app/composables/useEventLikes.ts`
- `app/composables/usePlaylistLikes.ts`
- `app/composables/useVideoLikes.ts`
- `app/composables/useTrackLikes.ts` (з alias-mapper)

**Modify (синхронізація beforeEach з новими useState-ключами фабрики, по мірі міграції композаблів):**
- `tests/composables/useLikes.spec.ts` (Task 2)
- `tests/composables/useArtistLikes.spec.ts` (Task 3)
- `tests/composables/useEventLikes.spec.ts` (Task 4)
- `tests/composables/usePlaylistLikes.spec.ts` (Task 5)
- `tests/composables/useVideoLikes.spec.ts` (Task 6)
- `tests/composables/useTrackLikes.spec.ts` (Task 7)

**Не змінюємо:**
- `app/composables/usePaginatedLikes.ts` (окремий патерн).
- Серверні endpoint-и в `server/api/*-likes/*`.
- Усі call-sites — публічний контракт повністю зберігається.

---

## Task 0: Розширити unit-тест-baseline на 5 інших likes-композаблів

Pre-flight перед рефакторингом. Копіює патерн з `tests/composables/useLikes.spec.ts` (5 тестів) на artist/event/playlist/video (стандартний контракт) і track (prefix-методи + 5-й метод). Після Task 0 у Vitest буде +25 тестів, що замінять manual smoke у Tasks 3-7.

**Передумова:** План `2026-05-01-vitest-setup.md` виконано — `tests/composables/useLikes.spec.ts` зеленіє через `npm test`. `tests/setup.ts` і `tests/utils/withSetup.ts` існують. Якщо ні — пропусти Task 0 і йди до Task 1 з manual-smoke-режимом.

**Files:**
- Create: `tests/composables/useArtistLikes.spec.ts`
- Create: `tests/composables/useEventLikes.spec.ts`
- Create: `tests/composables/usePlaylistLikes.spec.ts`
- Create: `tests/composables/useVideoLikes.spec.ts`
- Create: `tests/composables/useTrackLikes.spec.ts`

- [ ] **Step 1: Створити `useArtistLikes.spec.ts`**

`tests/composables/useArtistLikes.spec.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { withSetup } from '../utils/withSetup'
import { userMock, navigateToMock } from '../setup'

describe('useArtistLikes', () => {
  beforeEach(() => {
    useState<string[]>('artist-likes', () => []).value = []
    useState<boolean>('artist-likes-loaded', () => false).value = false
    useState<Record<string, number>>('artist-like-counts', () => ({})).value = {}
  })

  it('завантажує лайки на mount, якщо user залогінений', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn().mockResolvedValue(['art-a', 'art-b'])
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useArtistLikes())
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/api/artist-likes')
    expect(result.isLiked('art-a')).toBe(true)
  })

  it('isLiked false / likeCount 0 для невідомого slug', async () => {
    userMock.value = { id: 'user-1' }
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]))

    const { result } = withSetup(() => useArtistLikes())
    await flushPromises()

    expect(result.isLiked('unknown')).toBe(false)
    expect(result.likeCount('unknown')).toBe(0)
  })

  it('toggleLike оптимістично додає slug і шле POST', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useArtistLikes())
    await flushPromises()
    await result.toggleLike('art-x')

    expect(result.isLiked('art-x')).toBe(true)
    expect(result.likeCount('art-x')).toBe(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/artist-likes', {
      method: 'POST',
      body: { slug: 'art-x' },
    })
  })

  it('toggleLike відкочує стан при server error', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('500'))
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useArtistLikes())
    await flushPromises()
    await result.toggleLike('art-y')

    expect(result.isLiked('art-y')).toBe(false)
    expect(result.likeCount('art-y')).toBe(0)
  })

  it('toggleLike гостя робить navigateTo("/login") і не шле fetch', async () => {
    userMock.value = null
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useArtistLikes())
    await flushPromises()
    await result.toggleLike('art-z')

    expect(navigateToMock).toHaveBeenCalledWith('/login')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
```

Run: `npm test -- tests/composables/useArtistLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 2: Створити `useEventLikes.spec.ts`**

Скопіюй вміст `useArtistLikes.spec.ts` і заміни (replace-all):
- `useArtistLikes` → `useEventLikes`
- `'artist-likes'` → `'event-likes'`
- `'artist-likes-loaded'` → `'event-likes-loaded'`
- `'artist-like-counts'` → `'event-like-counts'`
- `'/api/artist-likes'` → `'/api/event-likes'`
- `'art-'` → `'evt-'` (щоб slug-и були семантично коректні)

Run: `npm test -- tests/composables/useEventLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 3: Створити `usePlaylistLikes.spec.ts`**

Той самий patternу. Заміни:
- `useArtistLikes` → `usePlaylistLikes`
- `'artist-likes'` → `'playlist-likes'`
- `'artist-likes-loaded'` → `'playlist-likes-loaded'`
- `'artist-like-counts'` → `'playlist-like-counts'`
- `'/api/artist-likes'` → `'/api/playlist-likes'`
- `'art-'` → `'pl-'`

Run: `npm test -- tests/composables/usePlaylistLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 4: Створити `useVideoLikes.spec.ts`**

Заміни:
- `useArtistLikes` → `useVideoLikes`
- `'artist-likes'` → `'video-likes'`
- `'artist-likes-loaded'` → `'video-likes-loaded'`
- `'artist-like-counts'` → `'video-like-counts'`
- `'/api/artist-likes'` → `'/api/video-likes'`
- `'art-'` → `'vid-'`

Run: `npm test -- tests/composables/useVideoLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 5: Створити `useTrackLikes.spec.ts`** — особливий випадок

Track має prefix-методи (`isTrackLiked`/`toggleTrackLike`/`trackLikeCount`/`fetchTrackCount`) + додатковий `setTrackCount` (синхронна функція). useState-ключі: `'track-likes'`, `'track-likes-loaded'`, `'track-counts'` (а НЕ `track-like-counts`).

`tests/composables/useTrackLikes.spec.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { withSetup } from '../utils/withSetup'
import { userMock, navigateToMock } from '../setup'

describe('useTrackLikes', () => {
  beforeEach(() => {
    useState<string[]>('track-likes', () => []).value = []
    useState<boolean>('track-likes-loaded', () => false).value = false
    useState<Record<string, number>>('track-counts', () => ({})).value = {}
  })

  it('завантажує лайки на mount, якщо user залогінений', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn().mockResolvedValue(['trk-a', 'trk-b'])
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useTrackLikes())
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith('/api/track-likes')
    expect(result.isTrackLiked('trk-a')).toBe(true)
  })

  it('isTrackLiked false / trackLikeCount 0 для невідомого slug', async () => {
    userMock.value = { id: 'user-1' }
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]))

    const { result } = withSetup(() => useTrackLikes())
    await flushPromises()

    expect(result.isTrackLiked('unknown')).toBe(false)
    expect(result.trackLikeCount('unknown')).toBe(0)
  })

  it('setTrackCount синхронно встановлює лічильник', async () => {
    userMock.value = { id: 'user-1' }
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue([]))

    const { result } = withSetup(() => useTrackLikes())
    await flushPromises()

    result.setTrackCount('trk-seed', 7)
    expect(result.trackLikeCount('trk-seed')).toBe(7)
  })

  it('toggleTrackLike оптимістично додає і шле POST /api/track-likes', async () => {
    userMock.value = { id: 'user-1' }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useTrackLikes())
    await flushPromises()
    await result.toggleTrackLike('trk-x')

    expect(result.isTrackLiked('trk-x')).toBe(true)
    expect(result.trackLikeCount('trk-x')).toBe(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/track-likes', {
      method: 'POST',
      body: { slug: 'trk-x' },
    })
  })

  it('toggleTrackLike гостя → navigateTo("/login")', async () => {
    userMock.value = null
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)

    const { result } = withSetup(() => useTrackLikes())
    await flushPromises()
    await result.toggleTrackLike('trk-z')

    expect(navigateToMock).toHaveBeenCalledWith('/login')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
```

Зверни увагу: тест rollback-у тут пропущено — він покритий у `useLikes.spec.ts` для тієї самої логіки, а track має додатковий `setTrackCount`-тест замість нього (синхронний contract, унікальний для цього композабля).

Run: `npm test -- tests/composables/useTrackLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 6: Прогон усіх композабль-тестів разом**

Run: `npm test -- tests/composables`
Expected: 30 tests passed (5 useLikes + 25 нових).

- [ ] **Step 7: Прогон всього test-suite + commit**

Run: `npm test && npx vue-tsc --noEmit`
Expected: повний прогон зелений (з усіма іншими тестами якщо встановлені плани 2-3-4: 60 / 72 / 75 — залежить від виконаних попередніх планів). Type-check без помилок.

```bash
git add tests/composables/useArtistLikes.spec.ts tests/composables/useEventLikes.spec.ts tests/composables/usePlaylistLikes.spec.ts tests/composables/useVideoLikes.spec.ts tests/composables/useTrackLikes.spec.ts
git commit -m "test(likes): expand baseline coverage to 5 entity composables"
```

**Що Task 0 дає Tasks 2-7:**
- Замість manual smoke у dev — `npm test -- tests/composables/use<Entity>Likes.spec.ts` (~1s).
- Авто-детект, який саме контракт зламано (load / toggle / rollback / login-redirect / setTrackCount).
- Race-захист від drift-а між композаблями (наприклад, забутий метод `setTrackCount` у track alias-mapper-і).

---

## Task 1: Створити фабрику `createLikes`

**Files:**
- Create: `app/composables/createLikes.ts`

- [ ] **Step 1: Створити файл фабрики**

`app/composables/createLikes.ts`:
```ts
type LikesConfig = {
  entity: string
  endpoint: string
}

export function createLikes(config: LikesConfig) {
  const { entity, endpoint } = config
  const user = useSupabaseUser()
  const likedSlugs = useState<string[]>(`likes:${entity}:slugs`, () => [])
  const loaded = useState<boolean>(`likes:${entity}:loaded`, () => false)
  const counts = useState<Record<string, number>>(`likes:${entity}:counts`, () => ({}))

  const isLiked = (slug: string) => likedSlugs.value.includes(slug)
  const likeCount = (slug: string) => counts.value[slug] ?? 0
  const setCount = (slug: string, count: number) => { counts.value[slug] = count }

  async function load() {
    if (!user.value || loaded.value) return
    const data = await $fetch<string[]>(endpoint).catch(() => [])
    likedSlugs.value = data
    loaded.value = true
  }

  async function fetchCount(slug: string) {
    const { count } = await $fetch<{ count: number }>(`${endpoint}/count/${slug}`).catch(() => ({ count: 0 }))
    counts.value[slug] = count
  }

  onMounted(() => {
    if (user.value && !loaded.value) load()
  })

  watch(user, (u) => {
    if (u) load()
    else {
      likedSlugs.value = []
      loaded.value = false
    }
  })

  async function toggleLike(slug: string) {
    if (!user.value) {
      navigateTo('/login')
      return
    }
    if (isLiked(slug)) {
      likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
      counts.value[slug] = Math.max(0, (counts.value[slug] ?? 1) - 1)
      await $fetch(`${endpoint}/${slug}`, { method: 'DELETE' }).catch(() => {
        likedSlugs.value = [...likedSlugs.value, slug]
        counts.value[slug] = (counts.value[slug] ?? 0) + 1
      })
    } else {
      likedSlugs.value = [...likedSlugs.value, slug]
      counts.value[slug] = (counts.value[slug] ?? 0) + 1
      await $fetch(endpoint, { method: 'POST', body: { slug } }).catch(() => {
        likedSlugs.value = likedSlugs.value.filter(s => s !== slug)
        counts.value[slug] = Math.max(0, (counts.value[slug] ?? 1) - 1)
      })
    }
  }

  return { isLiked, likeCount, toggleLike, fetchCount, setCount }
}
```

- [ ] **Step 2: Перевірити типи**

Run: `npx vue-tsc --noEmit`
Expected: жодного нового error. Якщо щось — фіксити локально, не далі.

- [ ] **Step 3: Commit**

```bash
git add app/composables/createLikes.ts
git commit -m "feat(likes): add createLikes factory"
```

---

## Task 2: Перевести `useLikes` (release) на фабрику

`useLikes` — найпростіший reference-кейс зі стандартним endpoint-ом `/api/likes` (унікальний — без префіксу).

**Files:**
- Modify: `app/composables/useLikes.ts`
- Modify: `tests/composables/useLikes.spec.ts` (синхронізація `beforeEach` з новими useState-ключами)

- [ ] **Step 1: Замінити вміст composable + оновити `beforeEach` у spec-файлі**

`app/composables/useLikes.ts` — повна заміна:
```ts
import { createLikes } from './createLikes'

export function useLikes() {
  return createLikes({ entity: 'release', endpoint: '/api/likes' })
}
```

`tests/composables/useLikes.spec.ts` — заміна `beforeEach` всередині `describe('useLikes', ...)`:

```diff
   beforeEach(() => {
-    useState<string[]>('likes', () => []).value = []
-    useState<boolean>('likes-loaded', () => false).value = false
-    useState<Record<string, number>>('like-counts', () => ({})).value = {}
+    useState<string[]>('likes:release:slugs', () => []).value = []
+    useState<boolean>('likes:release:loaded', () => false).value = false
+    useState<Record<string, number>>('likes:release:counts', () => ({})).value = {}
   })
```

Чому одночасно: фабрика тепер тримає state під ключами `likes:release:*`. Якщо `beforeEach` ресетить старі ключі (`'likes'`/`'likes-loaded'`/`'like-counts'`), а composable пише в нові — тести між `it`-блоками протікатимуть і випадково падатимуть. Цей крок робить test-файл консистентним з production-кодом.

- [ ] **Step 2: Прогнати релевантні тести**

Run: `npm test -- tests/composables/useLikes.spec.ts`
Expected: 5 tests passed (load, defaults, optimistic add, rollback, login-redirect).

Якщо red:
- «load test fails: fetch not called» → composable не імпортує `createLikes` з правильного шляху або factory недоступна як auto-import. Перевір, що `createLikes.ts` лежить у `app/composables/`.
- «toggleLike test fails: state не змінюється» → ключі в composable і `beforeEach` НЕ збігаються. Перевір, що обидва використовують `likes:release:*`.
- «redirect test fails» → mock `navigateTo` не зачеплений. Перевір, що `tests/setup.ts` має `mockNuxtImport('navigateTo', ...)`.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors. `release/[id].vue` деструктурує `{ isLiked, toggleLike, likeCount, fetchCount }` — фабрика повертає всі ці методи.

- [ ] **Step 4: Перевірити call-sites grep-ом**

Run: `grep -rEn "useLikes\(\)" app --include="*.vue" --include="*.ts"`
Expected: одне використання — `app/pages/release/[id].vue:6`. Деструктуроване `{ isLiked, toggleLike, likeCount, fetchCount }` — усі чотири є в новому контракті.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useLikes.ts tests/composables/useLikes.spec.ts
git commit -m "refactor(likes): migrate useLikes to createLikes factory"
```

---

## Task 3: Перевести `useArtistLikes` на фабрику

**Files:**
- Modify: `app/composables/useArtistLikes.ts`
- Modify: `tests/composables/useArtistLikes.spec.ts` (синхронізація `beforeEach`)

- [ ] **Step 1: Замінити вміст composable + оновити `beforeEach` у spec-файлі**

`app/composables/useArtistLikes.ts`:
```ts
import { createLikes } from './createLikes'

export function useArtistLikes() {
  return createLikes({ entity: 'artist', endpoint: '/api/artist-likes' })
}
```

`tests/composables/useArtistLikes.spec.ts` — заміна `beforeEach`:

```diff
   beforeEach(() => {
-    useState<string[]>('artist-likes', () => []).value = []
-    useState<boolean>('artist-likes-loaded', () => false).value = false
-    useState<Record<string, number>>('artist-like-counts', () => ({})).value = {}
+    useState<string[]>('likes:artist:slugs', () => []).value = []
+    useState<boolean>('likes:artist:loaded', () => false).value = false
+    useState<Record<string, number>>('likes:artist:counts', () => ({})).value = {}
   })
```

- [ ] **Step 2: Прогнати релевантні тести**

Run: `npm test -- tests/composables/useArtistLikes.spec.ts tests/components/Item.spec.ts`
Expected: 5 + 4 = 9 tests passed.

Чому додатково `Item.spec.ts`: `Item.vue` через `mockNuxtImport('useArtistLikes', ...)` мокає composable і чекає контракт `{ isLiked, toggleLike, likeCount, fetchCount }`. Цей mock — наш «акцептанс-тест» на публічний API artist-likes. Якщо у фабриці один з цих методів відсутній — Item.spec.ts впаде з runtime-помилкою при destructuring.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Перевірити call-sites**

Run: `grep -rEn "useArtistLikes\(\)" app --include="*.vue" --include="*.ts"`
Expected: два використання — `app/pages/artist/[id].vue:6` і `app/components/Item.vue:10`. Деструктурування `{ isLiked, toggleLike, likeCount, fetchCount }` — все на місці.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useArtistLikes.ts tests/composables/useArtistLikes.spec.ts
git commit -m "refactor(likes): migrate useArtistLikes to createLikes factory"
```

---

## Task 4: Перевести `useEventLikes` на фабрику

**Files:**
- Modify: `app/composables/useEventLikes.ts`
- Modify: `tests/composables/useEventLikes.spec.ts` (синхронізація `beforeEach`)

- [ ] **Step 1: Замінити вміст composable + оновити `beforeEach` у spec-файлі**

`app/composables/useEventLikes.ts`:
```ts
import { createLikes } from './createLikes'

export function useEventLikes() {
  return createLikes({ entity: 'event', endpoint: '/api/event-likes' })
}
```

`tests/composables/useEventLikes.spec.ts` — заміна `beforeEach`:

```diff
   beforeEach(() => {
-    useState<string[]>('event-likes', () => []).value = []
-    useState<boolean>('event-likes-loaded', () => false).value = false
-    useState<Record<string, number>>('event-like-counts', () => ({})).value = {}
+    useState<string[]>('likes:event:slugs', () => []).value = []
+    useState<boolean>('likes:event:loaded', () => false).value = false
+    useState<Record<string, number>>('likes:event:counts', () => ({})).value = {}
   })
```

- [ ] **Step 2: Прогнати релевантні тести**

Run: `npm test -- tests/composables/useEventLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Перевірити call-sites**

Run: `grep -rEn "useEventLikes\(\)" app --include="*.vue" --include="*.ts"`
Expected: одне використання — `app/pages/event/[id].vue:6`. Контракт зберігається.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useEventLikes.ts tests/composables/useEventLikes.spec.ts
git commit -m "refactor(likes): migrate useEventLikes to createLikes factory"
```

---

## Task 5: Перевести `usePlaylistLikes` на фабрику

**Files:**
- Modify: `app/composables/usePlaylistLikes.ts`
- Modify: `tests/composables/usePlaylistLikes.spec.ts` (синхронізація `beforeEach`)

- [ ] **Step 1: Замінити вміст composable + оновити `beforeEach` у spec-файлі**

`app/composables/usePlaylistLikes.ts`:
```ts
import { createLikes } from './createLikes'

export function usePlaylistLikes() {
  return createLikes({ entity: 'playlist', endpoint: '/api/playlist-likes' })
}
```

`tests/composables/usePlaylistLikes.spec.ts` — заміна `beforeEach`:

```diff
   beforeEach(() => {
-    useState<string[]>('playlist-likes', () => []).value = []
-    useState<boolean>('playlist-likes-loaded', () => false).value = false
-    useState<Record<string, number>>('playlist-like-counts', () => ({})).value = {}
+    useState<string[]>('likes:playlist:slugs', () => []).value = []
+    useState<boolean>('likes:playlist:loaded', () => false).value = false
+    useState<Record<string, number>>('likes:playlist:counts', () => ({})).value = {}
   })
```

- [ ] **Step 2: Прогнати релевантні тести**

Run: `npm test -- tests/composables/usePlaylistLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Перевірити call-sites**

Run: `grep -rEn "usePlaylistLikes\(\)" app --include="*.vue" --include="*.ts"`
Expected: одне використання — `app/pages/playlist/[id].vue:6`.

- [ ] **Step 5: Commit**

```bash
git add app/composables/usePlaylistLikes.ts tests/composables/usePlaylistLikes.spec.ts
git commit -m "refactor(likes): migrate usePlaylistLikes to createLikes factory"
```

---

## Task 6: Перевести `useVideoLikes` на фабрику

**Files:**
- Modify: `app/composables/useVideoLikes.ts`
- Modify: `tests/composables/useVideoLikes.spec.ts` (синхронізація `beforeEach`)

- [ ] **Step 1: Замінити вміст composable + оновити `beforeEach` у spec-файлі**

`app/composables/useVideoLikes.ts`:
```ts
import { createLikes } from './createLikes'

export function useVideoLikes() {
  return createLikes({ entity: 'video', endpoint: '/api/video-likes' })
}
```

`tests/composables/useVideoLikes.spec.ts` — заміна `beforeEach`:

```diff
   beforeEach(() => {
-    useState<string[]>('video-likes', () => []).value = []
-    useState<boolean>('video-likes-loaded', () => false).value = false
-    useState<Record<string, number>>('video-like-counts', () => ({})).value = {}
+    useState<string[]>('likes:video:slugs', () => []).value = []
+    useState<boolean>('likes:video:loaded', () => false).value = false
+    useState<Record<string, number>>('likes:video:counts', () => ({})).value = {}
   })
```

- [ ] **Step 2: Прогнати релевантні тести**

Run: `npm test -- tests/composables/useVideoLikes.spec.ts`
Expected: 5 tests passed.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Перевірити call-sites**

Run: `grep -rEn "useVideoLikes\(\)" app --include="*.vue" --include="*.ts"`
Expected: одне використання — `app/pages/video/[id].vue:5`.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useVideoLikes.ts tests/composables/useVideoLikes.spec.ts
git commit -m "refactor(likes): migrate useVideoLikes to createLikes factory"
```

---

## Task 7: Перевести `useTrackLikes` з alias-mapper

`useTrackLikes` — єдиний з кастомним публічним API (`isTrackLiked` / `toggleTrackLike` / `trackLikeCount` / `setTrackCount` / `fetchTrackCount`). Call-sites уже використовують ці назви, тому переіменування ламає `release/[id].vue` і `track/[id].vue`. Тримаємо назви через alias.

**Files:**
- Modify: `app/composables/useTrackLikes.ts`
- Modify: `tests/composables/useTrackLikes.spec.ts` (синхронізація `beforeEach`)

- [ ] **Step 1: Замінити вміст composable + оновити `beforeEach` у spec-файлі**

`app/composables/useTrackLikes.ts`:
```ts
import { createLikes } from './createLikes'

export function useTrackLikes() {
  const base = createLikes({ entity: 'track', endpoint: '/api/track-likes' })
  return {
    isTrackLiked: base.isLiked,
    toggleTrackLike: base.toggleLike,
    trackLikeCount: base.likeCount,
    setTrackCount: base.setCount,
    fetchTrackCount: base.fetchCount,
  }
}
```

`tests/composables/useTrackLikes.spec.ts` — заміна `beforeEach`:

```diff
   beforeEach(() => {
-    useState<string[]>('track-likes', () => []).value = []
-    useState<boolean>('track-likes-loaded', () => false).value = false
-    useState<Record<string, number>>('track-counts', () => ({})).value = {}
+    useState<string[]>('likes:track:slugs', () => []).value = []
+    useState<boolean>('likes:track:loaded', () => false).value = false
+    useState<Record<string, number>>('likes:track:counts', () => ({})).value = {}
   })
```

Зверни увагу: оригінальний composable використовував `'track-counts'` (а НЕ `'track-like-counts'` як решта entities — це було inconsistency у legacy-коді). Фабрика уніфікує всі entities до `likes:<entity>:counts`. Тести тепер теж консистентні.

- [ ] **Step 2: Прогнати релевантні тести**

Run: `npm test -- tests/composables/useTrackLikes.spec.ts`
Expected: 5 tests passed.

Особлива увага в тесті `setTrackCount синхронно встановлює лічильник` — це найчутливіший тест на alias-mapper. Якщо забув `setTrackCount: base.setCount` у мапінгу, цей тест впаде з «`result.setTrackCount is not a function`». Це і є race-захист, про який згадано в Task 0.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors. Перевірити, що `track/[id].vue` (рядки 5–11 деструктурує всі п'ять методів) і `release/[id].vue:7` (чотири методи без `fetchTrackCount`) обидва компілюються.

- [ ] **Step 4: Перевірити call-sites**

Run: `grep -rEn "useTrackLikes\(\)" app --include="*.vue" --include="*.ts"`
Expected: два використання — `app/pages/release/[id].vue:7` і `app/pages/track/[id].vue:5-11`. Усі деструктуровані методи є в alias-mapper-і.

- [ ] **Step 5: Commit**

```bash
git add app/composables/useTrackLikes.ts tests/composables/useTrackLikes.spec.ts
git commit -m "refactor(likes): migrate useTrackLikes to createLikes factory with alias mapper"
```

---

## Task 8: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Прогнати весь test-suite**

Run: `npm test`
Expected (залежить від виконаних попередніх планів):
- **Якщо виконано тільки план 1 (vitest-setup):** 30 tests passed (5 useLikes + 25 з Task 0).
- **Якщо виконано плани 1+2 (server-route-tests):** 42 tests passed (+12 server).
- **Якщо виконано плани 1+2+3 (component-tests):** 60 tests passed (+18 component).
- **Якщо виконано всі 1+2+3+4:** 60 unit/component + 3 e2e (через `npm run test:e2e` окремо).

Всі тести зелені, час прогону <15s для unit/component. Якщо хоч один red — рефакторинг ввів регресію, дослідити перед merge.

- [ ] **Step 2: E2E прогон (якщо план 4 виконано)**

Run: `npm run test:e2e`
Expected: 3 tests passed (login+like, mobile menu × 2). Час ~30-60s. Це інтеграційне покриття — стверджує, що release like-cycle працює end-to-end через Supabase.

Skip цей крок, якщо план 4 не виконано.

- [ ] **Step 3: Type-check весь проєкт**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Підрахувати LOC після рефакторингу**

Run: `wc -l app/composables/use*Likes.ts app/composables/createLikes.ts`
Expected: п'ять `useXxxLikes.ts` ≤10 рядків кожен, `useTrackLikes.ts` ~12 рядків, `createLikes.ts` ~55 рядків. Загалом ~115 рядків замість оригінальних ~346 (≈67% скорочення).

- [ ] **Step 5: Manual sanity-check на одному flow** (опційно, якщо є сумніви)

Якщо тести зелені, цей крок можна пропустити. Корисний лише як «human-eyes» перевірка SSR-payload restoration:

Запустити `npm run dev -- --host`, залогінитись, відкрити `/release/<slug>`, натиснути heart, refresh — лайк збережений. Якщо не збережений — `useState`-payload не серіалізується між SSR і client. Це регресія, що тестами може не зловитись (тести викликають composable у unit-режимі без SSR-hydration).

- [ ] **Step 6: Перевірити білд**

Run: `npm run build`
Expected: build success без TS-errors.

- [ ] **Step 7: Final commit (якщо щось ще додалось)**

```bash
git status
# Якщо чисто — без коміту.
```

---

## Notes для виконавця

- **Не міняти серверні endpoint-и.** Якщо помітите, що `/api/likes` (release) НЕ симетричний з рештою (`/api/<entity>-likes`) — це окрема задача в backlog (можливо створення aliasу `/api/release-likes` з 301-редіректом). Зараз тримаємо існуючі URL.
- **Не змінювати публічний контракт композаблів.** Якщо побачите, що щось можна спростити (наприклад прибрати `setCount` де він не потрібен) — НЕ робіть цього в рамках цього плану. Кінцева мета — DRY-консолідація без поведінкових змін.
- **`useState` ключі.** Старі ключі (`likes`, `track-likes`, `like-counts`, `track-counts` тощо) НЕ повертати. Нові — `likes:<entity>:slugs|loaded|counts`. Це не персистентний стейт, тому міграція не потрібна.
- **Якщо TS-перевірка падає** на Task 1 — найімовірніша причина: composables auto-import у Nuxt 4 потребує, щоб файл лежав у `app/composables/`, а helper-функцію (не композабль) краще теж тримати поруч. Якщо `vue-tsc` скаржиться на не-знайдені імпорти `useState`/`useSupabaseUser` — додати `import { useState, watch, onMounted } from '#imports'` явно.
- **Якщо тест rollback падає у будь-якому Task 2-7** — фабрика не повертає state до попереднього при mock-rejected fetch. Перевір блок `.catch(() => {...})` у `createLikes.ts`. Це найкритичніша поведінка, тому має тест-координату на кожен entity.
- **Якщо `setTrackCount`-тест падає у Task 7** — alias-mapper забув `setTrackCount: base.setCount` рядок. Додати і повторити.
- **Якщо тест існує, але `npm test -- ...` повертає "0 tests"** — Vitest не знаходить файл за шляхом. Перевір, що шлях до spec-файлу правильний (`tests/composables/useLikes.spec.ts`, не `tests/use...`).
- **Fallback для виконання БЕЗ тестової інфраструктури.** Якщо плани 1-4 не виконані і ти все одно хочеш запустити цей рефакторинг — заміни кроки `npm test -- ...` у Tasks 2-7 на manual smoke у dev: `npm run dev -- --host`, відкрити `/release/<slug>` (або відповідну entity-сторінку), залогінитись, like-cycle (toggle/counter/refresh). Видали кроки заміни `beforeEach` (бо тестових файлів нема). Це не безпечно — рекомендується спершу виконати план vitest-setup. Але як explicit-fallback це робоче.
