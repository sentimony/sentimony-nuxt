# Profile Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полагодити `/profile/tracks` (500 через дропнуті колонки, замаскований порожнім станом), дати всім шести колекціям окремий стан помилки й привести поверхню profile до дизайн-контракту проєкту: focus через `outline`, два текстові тири, токени замість парних `black/white`, `ui/button` замість шести рукописних кнопок.

**Architecture:** Серверний фікс ізольований в `entitySelect` одного хендлера й у розділенні типів `Track` / `ReleaseTrack`, дзеркальному до серверного `ReleaseTrackRow`. Стан помилки додається в `usePaginatedLikes` і `ProfileCollectionStatus`, тому закривається для всіх шести колекцій одразу. Класова міграція йде трьома комітами, і на кожному список `PROFILE_FILES` у греп-тесті розширюється рівно на ті файли, які цей коміт уже вичистив, тож дерево лишається зеленим після кожної таски.

**Tech Stack:** Nuxt 4, Tailwind v4 (`@theme` токени, без config-файлу), shadcn-vue primitives на reka-ui, cva, Supabase JS + PostgREST, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-26-profile-surface-design.md`
**Audit (знахідки й заміри):** `docs/audits/2026-07-26-profile-pages-audit.md`

## Global Constraints

- Гілка `main`, кожна таска — свій коміт. Не робити amend у попередні коміти: у дереві є незв'язані незакомічені зміни (`AGENTS.md`, `PRODUCT.md`, `app/pages/event/[id].vue`, `app/types/index.ts`, переміщення `docs/`), тому кожен `git add` перелічує файли явно, ніякого `git add -A`.
- Нових залежностей не додавати. Нових варіантів у `buttonVariants` не додавати.
- Dev-сервер піднімати **тільки** на порті 3100 через `python .agents/skills/web-debug/scripts/with_server.py`. Порти 3000-3002 належать користувачу; ніколи не запускати `pkill -f "nuxt dev"`.
- `sync:firebase` / `sync:supabase` не запускати: схема вже правильна, ламається саме код.
- Рівнів тексту рівно два: `text-foreground` і `text-muted-foreground`. Будь-яке `text-foreground/<число>` у файлах profile заборонене.
- Парні дублі `X-black/N dark:X-white/N` заборонені; замість них одинарне `X-foreground/N`.
- Безумовний `outline-none` і `focus-visible:ring-*` заборонені. Посилання покриває глобальне `a:focus-visible`, кнопки — база `buttonVariants`.
- Пастка Tailwind v4: `transition-colors` включає `outline-color`. Кожен елемент із focus-обведенням отримує явний список без `outline-color`.
- `@apply` у `<style scoped>` не використовувати.
- Коментарів у коді не додавати; якщо коментар неминучий — англійською.
- Канонічні колонки треку (звірено з `server/utils/catalogTracks.ts:5` і живою базою): `slug, title, artist_name, artist_slug, bpm, audio_url`.

---

### Task 1: Каталог треків у лайках і розділення типів

**Files:**
- Modify: `server/api/track-likes/tracks.get.ts:1`
- Modify: `app/types/index.ts:106-125`
- Modify: `app/pages/profile/tracks.vue:24`
- Create: `tests/unit/likedTracksColumns.test.ts`

**Interfaces:**
- Produces: `Track` без `release_slug` / `track_number`; новий `ReleaseTrack extends Track`. Споживають Task 6 і всі сторінки, що читають `TrackResponse`.

- [ ] **Step 1: Зафіксувати баг тестом**

Створити `tests/unit/likedTracksColumns.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('liked tracks endpoint', () => {
  it('selects only columns that exist on the tracks table', () => {
    const handler = readProjectFile('server/api/track-likes/tracks.get.ts')
    const select = handler.match(/entitySelect:\s*'([^']*)'/)?.[1] ?? ''
    const columns = select.split(',').map(column => column.trim()).filter(Boolean)

    expect(columns, 'dropped by 20260707_tracks_first_class.sql')
      .not.toContain('release_slug')
    expect(columns).not.toContain('track_number')
    expect(columns).toEqual(
      expect.arrayContaining(['slug', 'title', 'artist_name', 'artist_slug', 'bpm', 'audio_url']),
    )
  })

  it('links liked tracks to their own page, not to a release', () => {
    const page = readProjectFile('app/pages/profile/tracks.vue')

    expect(page).not.toContain('release_slug')
    expect(page).toContain('/track/')
  })
})
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/likedTracksColumns.test.ts`
Expected: FAIL — обидва тести, `release_slug` присутній і в хендлері, і на сторінці.

- [ ] **Step 3: Виправити `entitySelect`**

`server/api/track-likes/tracks.get.ts` — один рядок:

```ts
export default likedItemsHandler({ table: 'track_likes', slugCol: 'track_slug', entityTable: 'tracks', entitySelect: 'slug, title, artist_name, artist_slug, bpm, audio_url', defaultLimit: 20 })
```

- [ ] **Step 4: Розділити типи**

`app/types/index.ts` — `Track` втрачає два поля, додається `ReleaseTrack`:

```ts
export interface Track {
  slug: string
  title: string
  artist_slug: string
  artist_name: string
  bpm: number | null
  audio_url?: string | null
}

export interface ReleaseTrack extends Track {
  release_slug: string
  track_number: number
}
```

У `TrackResponse` поля `track`, `releaseTracks`, `similarTracks` стають `ReleaseTrack` / `ReleaseTrack[]`: `/api/track/[id].get.ts` віддає рядки, гідровані через `expandReleaseTracks`, тобто серверний `ReleaseTrackRow`.

- [ ] **Step 5: Виправити посилання на сторінці треків**

`app/pages/profile/tracks.vue` — `:to="`/release/${track.release_slug}`"` стає `:to="`/track/${track.slug}`"`.

- [ ] **Step 6: Прогнати typecheck і полагодити фолаут**

Run: `npm run typecheck`

Очікувано зачеплені call-sites: `app/pages/track/[id].vue:141,179` (`track.track_number`), `app/pages/release/[id].vue:257` (`t.track_number`). Локальні типи в `playlist/[id].vue:33-36`, `tracks.vue:31-34`, `artist/[id].vue:15` оголошують поля самі й мають лишитися незмінними. Якщо десь бракує полів — правильна дія це замінити `Track` на `ReleaseTrack` у місці споживання, **не** повертати поля в `Track`.

- [ ] **Step 7: Перевірити зеленим**

Run: `npx vitest run tests/unit/likedTracksColumns.test.ts && npm run test:unit && npm run typecheck`
Expected: PASS. Базова лінія `test:unit` — 41 файл / 185 тестів плюс новий файл.

- [ ] **Step 8: Коміт**

```
git add server/api/track-likes/tracks.get.ts app/types/index.ts app/pages/profile/tracks.vue tests/unit/likedTracksColumns.test.ts
git commit -m "fix(profile): select existing track columns for liked tracks"
```

`app/types/index.ts` уже має незакомічені зміни по `Event` (flyer-варіанти). Перед `git add` переглянути `git diff app/types/index.ts` і, якщо ці зміни не мають їхати в цьому коміті, застосувати `git add -p`.

---

### Task 2: Стан помилки для колекцій

**Files:**
- Modify: `app/composables/usePaginatedLikes.ts`
- Modify: `app/components/ProfileCollectionStatus.vue`
- Modify: `app/components/ProfileCollectionPage.vue:38-44`
- Modify: `app/pages/profile/tracks.vue:45-51`
- Create: `tests/unit/usePaginatedLikes.test.ts`

**Interfaces:**
- Produces: `usePaginatedLikes` повертає `error: Ref<boolean>` і `retry`; `ProfileCollectionStatus` приймає `error` і емітить `retry`.

- [ ] **Step 1: Написати падаючий тест композабла**

Створити `tests/unit/usePaginatedLikes.test.ts`. Композабл спирається на Vue auto-imports (`ref`, `computed`) і на `$fetch`, тому тест мокає їх через `globalThis` + `vi.resetModules()` з динамічним імпортом — референсний патерн у `tests/unit/likeCountersHandler.test.ts`:

```ts
import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function loadComposable(fetchImpl: () => Promise<unknown>) {
  vi.resetModules()
  Object.assign(globalThis, { ref, computed, $fetch: vi.fn(fetchImpl) })
  return (await import('../../app/composables/usePaginatedLikes')).usePaginatedLikes
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('usePaginatedLikes', () => {
  it('flags a failed load instead of reporting an empty collection', async () => {
    const usePaginatedLikes = await loadComposable(() => Promise.reject(new Error('boom')))
    const collection = usePaginatedLikes<{ slug: string }>('/api/track-likes/tracks', 25, 12)

    await collection.loadMore()

    expect(collection.error.value).toBe(true)
    expect(collection.items.value).toEqual([])
    expect(collection.total.value).toBe(12)
  })

  it('clears the error flag on a successful retry', async () => {
    let attempt = 0
    const usePaginatedLikes = await loadComposable(() => {
      attempt += 1
      return attempt === 1
        ? Promise.reject(new Error('boom'))
        : Promise.resolve({ data: [{ slug: 'a' }], total: 1 })
    })
    const collection = usePaginatedLikes<{ slug: string }>('/api/likes/releases', 25, 1)

    await collection.loadMore()
    await collection.retry()

    expect(collection.error.value).toBe(false)
    expect(collection.items.value).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/usePaginatedLikes.test.ts`
Expected: FAIL — `collection.error` не існує.

Якщо падіння інше (наприклад, `ref is not defined` уже на імпорті) — це сигнал, що набір `globalThis`-стабів неповний; дописати відсутні auto-imports, не змінюючи логіку тесту.

- [ ] **Step 3: Додати стан помилки в композабл**

У `app/composables/usePaginatedLikes.ts` додати `const error = ref(false)`, у `load()` виставляти `error.value = false` на старті й `error.value = true` у `catch`, у разі помилки **не** інкрементувати `page` і не приписувати порожній `res.data`. `retry` — тонка обгортка, яка викликає `load()` повторно для тієї самої сторінки. Повернути `error` і `retry` з композабла.

Ключова умова: після помилки `total` лишається попереднім (лічильник у навігації приходить з іншого джерела й лишається валідним).

- [ ] **Step 4: Додати стан помилки в `ProfileCollectionStatus`**

Пропси: додається `error?: boolean`. Емiти: додається `retry: []`. Порядок гілок у шаблоні строго `loading` → `error` → `empty` → `hasMore`, інакше при непорожньому `total` покажуться і помилка, і «Show more».

Розмітка гілки помилки: контейнер із `role="alert"`, текст «Could not load this collection» і кнопка `Try again`. Кнопка на цьому кроці лишається тим самим рукописним `<button>`, що й «Show more» — обидві переїжджають на `ui/button` у Task 3, щоб класова міграція жила в одному комiтi.

- [ ] **Step 5: Прокинути пропси з обох call-sites**

`ProfileCollectionPage.vue` і `profile/tracks.vue` передають `:error="collection.error.value"` та `@retry="collection.retry()"` поряд із наявними пропсами.

- [ ] **Step 6: Перевірити зеленим**

Run: `npx vitest run tests/unit/usePaginatedLikes.test.ts && npm run test:unit && npm run typecheck`

- [ ] **Step 7: Коміт**

```
git add app/composables/usePaginatedLikes.ts app/components/ProfileCollectionStatus.vue app/components/ProfileCollectionPage.vue app/pages/profile/tracks.vue tests/unit/usePaginatedLikes.test.ts
git commit -m "feat(profile): separate failed collection loads from empty ones"
```

---

### Task 3: Греп-охорона і міграція спільних компонентів

**Files:**
- Modify: `tests/unit/interactionStates.test.ts`
- Modify: `app/components/ProfileCollectionStatus.vue`
- Modify: `app/components/ProfileCollectionPage.vue`
- Modify: `app/pages/profile/tracks.vue`

**Interfaces:**
- Produces: блок `describe('profile surface')` зі списком `PROFILE_FILES`, який Tasks 4-5 розширюють.

- [ ] **Step 1: Написати падаючий греп-тест**

У `tests/unit/interactionStates.test.ts` додати блок після наявного `describe('auth surface')`, перевикористовуючи хелпери `readProjectFile` з початку файлу:

```ts
describe('profile surface', () => {
  const PROFILE_FILES = [
    'app/components/ProfileCollectionPage.vue',
    'app/components/ProfileCollectionStatus.vue',
    'app/pages/profile/tracks.vue',
  ]

  it('uses only the two semantic text tiers', () => {
    for (const file of PROFILE_FILES) {
      expect(readProjectFile(file), `${file} keeps an alpha text tier`)
        .not.toMatch(/text-foreground\/\d+/)
    }
  })

  it('has no paired black/white duplicates', () => {
    for (const file of PROFILE_FILES) {
      expect(readProjectFile(file), `${file} keeps a paired light/dark duplicate`)
        .not.toMatch(/-(?:black|white)\/\d+\s+dark:[a-z:-]*-(?:white|black)\/\d+/)
    }
  })

  it('leaves focus indicators to the global rule and the button base', () => {
    for (const file of PROFILE_FILES) {
      const source = readProjectFile(file)
      expect(source, `${file} kills the focus outline`).not.toContain('outline-none')
      expect(source, `${file} halves the ring token`).not.toContain('focus-visible:ring-')
    }
  })

  it('keeps technical labels at a legible size', () => {
    for (const file of PROFILE_FILES) {
      expect(readProjectFile(file), `${file} uses a 9px tier`).not.toContain('text-[9px]')
    }
  })

  it('has no hardcoded accent or status colours', () => {
    for (const file of PROFILE_FILES) {
      const source = readProjectFile(file)
      expect(source).not.toMatch(/(?:text|bg|border|ring)-red-\d+/)
      expect(source).not.toMatch(/(?:text|bg|border|ring)-blue-\d+/)
    }
  })
})
```

- [ ] **Step 2: Запустити і переконатися, що падає**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL на тирах (`ProfileCollectionStatus` має `/25`, `/30`, `/35`; `tracks.vue` — `/25` двічі) і на focus (`outline-none` в обох файлах).

- [ ] **Step 3: Мігрувати `ProfileCollectionStatus.vue`**

- `text-foreground/30`, `/25`, `/35` → `text-muted-foreground`;
- `hover:bg-black/5 dark:hover:bg-white/5` → `hover:bg-foreground/5`;
- «Show more» і `Try again` стають `<Button variant="default">` — `focus-visible` приходить із бази cva, тому локальні focus-класи, `rounded` і `transition-colors` знімаються повністю;
- `text-[10px] uppercase tracking-widest` лишається як мова технічних лейблів сайту.

- [ ] **Step 4: Мігрувати `profile/tracks.vue`**

- два `text-foreground/25` → `text-muted-foreground`, `/50` → `text-muted-foreground`, `/85` → `text-foreground`;
- `border-black/5 dark:border-white/5` → `border-foreground/5`, `hover:bg-black/5 dark:hover:bg-white/5` → `hover:bg-foreground/5`;
- знімаються `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50`: рядок треку це `NuxtLink`, обведення дає глобальне `a:focus-visible`;
- `transition-colors duration-150` → `transition-[background-color] duration-150`, інакше `outline-color` анімується від `currentColor`;
- `rounded` знімається (рядок списку не картка).

- [ ] **Step 5: Перевірити `ProfileCollectionPage.vue`**

Файл уже чистий; він у списку як охорона від регресій. Перевірити, що після Task 2 у ньому не з'явилося класів.

- [ ] **Step 6: Перевірити зеленим і глянути живцем**

Run: `npm run test:unit && npm run typecheck`

Далі dev-сервер на 3100 і прохід `Tab` по `/profile/tracks` у двох темах: обведення має бути видно на кожному рядку, колір однаковий одразу після `Tab` і після завершення переходу.

- [ ] **Step 7: Коміт**

```
git add tests/unit/interactionStates.test.ts app/components/ProfileCollectionStatus.vue app/components/ProfileCollectionPage.vue app/pages/profile/tracks.vue
git commit -m "refactor(profile): move shared collection views onto semantic tokens"
```

---

### Task 4: Навігація profile на `DefaultButton`

**Files:**
- Modify: `app/pages/profile.vue`
- Modify: `tests/unit/interactionStates.test.ts` (додати файл у `PROFILE_FILES`)

- [ ] **Step 1: Розширити список і побачити падіння**

Додати `'app/pages/profile.vue'` у `PROFILE_FILES`.

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL — `text-foreground/40` і `outline-none` у рядках 52-55.

- [ ] **Step 2: Замінити рукописні таби**

`<NuxtLink>` із власними класами замінюється на `<DefaultButton>`, який уже вміє все потрібне (`app/components/buttons/DefaultButton.vue:35,47`):

```vue
<DefaultButton
  v-for="section in profileNavItems"
  :key="section.key"
  :to="section.key === 'profile' ? '/profile' : `/profile/${section.key}`"
  :iconify="section.icon"
  :title="section.label"
  :count="section.count"
  small
  outline
/>
```

Разом із цим зникає `isSectionActive()`: активний стан дає `exactActiveClass` усередині `DefaultButton`.

- [ ] **Step 3: Показувати всі шість секцій**

`visibleSections` прибирається; `profileNavItems` будується з повного `profileSections`. Причина в спеці: зараз таб зникає з-під користувача, коли той знімає останній лайк, перебуваючи на сторінці секції, і навігація стрибає після кожного лайка. `GenreTabs` показує нульові таби — це патерн сайту.

`v-if="profileNavItems.length"` на `<nav>` стає зайвим і знімається.

- [ ] **Step 4: Одна ширина поверхні**

Контейнер `max-w-[112rem]` → `max-w-5xl`, щоб таби, overview і ґріди колекцій ділили одну сітку. `max-w-5xl` з `<nav>` знімається, бо тепер його дає контейнер.

- [ ] **Step 5: Перевірити зеленим і живцем**

Run: `npm run test:unit && npm run typecheck`

Dev-сервер на 3100: таби в обох темах, активний стан читається, обведення по `Tab` видно; 390px — таби переносяться і не ріжуться; ґрід колекції на `/profile/releases` не виглядає порожнім на новій ширині.

- [ ] **Step 6: Коміт**

```
git add app/pages/profile.vue tests/unit/interactionStates.test.ts
git commit -m "refactor(profile): reuse DefaultButton for collection navigation"
```

---

### Task 5: Overview на primitives і токени

**Files:**
- Modify: `app/pages/profile/index.vue`
- Modify: `tests/unit/interactionStates.test.ts` (додати файл у `PROFILE_FILES`)

Найбільша таска: 15 альфа-тирів, 48 парних утиліт, два хардкод-кольори, п'ять рукописних кнопок, рукописний інпут.

- [ ] **Step 1: Розширити список і побачити падіння**

Додати `'app/pages/profile/index.vue'` у `PROFILE_FILES`.

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL по всіх п'яти асертах блоку.

- [ ] **Step 2: Інпут імені на `<Input>`**

Рукописний `<input>` (`index.vue:141-147`) замінюється на `<Input>`; разом із ним зникають `border-white/20 bg-black/20 dark:bg-black/40` і синій `focus:*`. A11y-обв'язка дзеркалить `AuthForm.vue:111-114`:

```vue
<Input
  ref="nameInput"
  v-model="newName"
  type="text"
  :aria-invalid="!!nameError"
  :aria-describedby="nameError ? 'profile-name-error' : undefined"
  @keydown="handleNameKeydown"
/>
<span v-if="nameError" id="profile-name-error" role="alert" class="mt-1 block text-xs text-destructive">
  {{ nameError }}
</span>
```

`nameInput.value?.focus()` у `startEdit()` тепер цілить у компонент, а не в DOM-елемент: тип рефа стає `ComponentPublicInstance | null`, а фокус береться з `nameInput.value?.$el`. Перевірити живцем, що автофокус на кліку по олівцю не зламався.

- [ ] **Step 3: П'ять кнопок на `ui/button`**

| кнопка | заміна |
|---|---|
| Save | `<Button variant="submit" :disabled="saving" class="flex-1">` |
| Cancel, Edit (олівець) | `<Button variant="default" class="w-9 px-0">` |
| Upload, Sign out | `<Button variant="default">` |
| Remove avatar | `<Button variant="default" class="w-9 px-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">` |

Нових варіантів у `buttonVariants` не додається (рішення спеки). Разом із кнопками зникають їхні локальні `rounded-md`, `focus-visible:*`, `transition-colors`, `cursor-pointer` і всі `bg-white/10 hover:bg-white/20`. `aria-label` на іконкових кнопках зберігаються.

- [ ] **Step 4: Тири і парні утиліти**

- `text-foreground/70`, `/85` → `text-foreground`;
- `/45`, `/40`, `/35`, `/30`, `/25`, `/20` → `text-muted-foreground`;
- `text-red-400` зникає разом із рукописним текстом помилки (Step 2);
- `border-black/10 dark:border-white/10` → `border-foreground/10`;
- `bg-black/3 dark:bg-white/3` → `bg-foreground/3`;
- `bg-black/5 dark:bg-white/5` → `bg-foreground/5`, `hover:bg-black/10 dark:hover:bg-white/10` → `hover:bg-foreground/10`;
- `hover:bg-black/6 dark:hover:bg-white/6` і `hover:border-black/20 dark:hover:border-white/20` на картках секцій → одинарні `foreground`;
- сім `text-[9px]` → `text-[10px]`.

Картки секцій — це `NuxtLink`, тому їхні `focus-visible:outline-none focus-visible:ring-*` знімаються без заміни. Їхній `transition-[background-color,border-color,transform]` уже явний і `outline-color` не включає — лишити як є.

- [ ] **Step 5: Композиція**

- eyebrow «Collection overview» (`index.vue:237-239`) прибирається;
- шість рядків «Open collection» (`index.vue:272-274`) прибираються;
- `full_name || '—'` → `full_name || 'Not set'`;
- картка Name отримує `min-h-[…]`, що дорівнює висоті режиму редагування, щоб ряд ґріда не переверстувався на кліку по олівцю. Значення зняти з живої сторінки, не вгадувати;
- голий `rounded` не лишається: картки `rounded-lg`, контроли беруть `rounded-md` із primitives, аватар і кружок іконки — `rounded-full`.

- [ ] **Step 6: Перевірити зеленим і живцем**

Run: `npm run test:unit && npm run typecheck`

Dev-сервер на 3100, залогінений акаунт, обидві теми: редагування імені (успіх, порожнє значення, серверна помилка), завантаження аватара, вихід; `Tab` по всій сторінці; 390px.

- [ ] **Step 7: Коміт**

```
git add app/pages/profile/index.vue tests/unit/interactionStates.test.ts
git commit -m "refactor(profile): rebuild overview on button and input primitives"
```

---

### Task 6: Підтвердження видалення аватара

**Files:**
- Modify: `app/pages/profile/index.vue`

- [ ] **Step 1: Додати крок підтвердження**

`confirmingDelete = ref(false)`. Перший клік по кошику вмикає прапорець і показує пару `Remove?` / `Cancel` замість іконки; `deleteAvatar()` викликається лише з другого кроку. `Escape` і успішне видалення скидають прапорець. Без діалогу і без нової залежності.

- [ ] **Step 2: Перевірити живцем**

Клік по кошику → підтвердження → `Cancel` повертає початковий стан; підтвердження видаляє аватар і показує `toast.success`. `Escape` на кроці підтвердження скасовує. Перевірити, що ряд ґріда не стрибає (та сама причина, що й `min-h` у Task 5).

- [ ] **Step 3: Коміт**

```
git add app/pages/profile/index.vue
git commit -m "feat(profile): confirm avatar removal before deleting"
```

---

### Task 7: Наскрізна верифікація і документація

**Files:**
- Modify: `docs/initiatives/profile-surface.md`
- Modify: `docs/roadmap.md`
- Modify: `AGENTS.md` (секція Profile)

- [ ] **Step 1: Прогнати повний набір перевірок**

Run: `npm run test:unit && npm run typecheck && npm run typecheck:ts7`

- [ ] **Step 2: Ручна приймальна перевірка**

Dev-сервер на 3100, залогінений акаунт, обидві теми:

- `/profile/tracks` показує лайкнуті треки; кожне посилання відкриває `/track/<slug>`;
- тимчасово зламати `entitySelect` (локально, без коміту) і переконатися, що сторінка показує «Could not load this collection» із `Try again`, а не порожній стан; після повернення select `Try again` завантажує колекцію;
- прохід `Tab` по `/profile` і одній сторінці колекції: обведення видно на кожному табі, картці секції, кнопці й рядку треку; колір знятий одразу після `Tab` і після 300ms — однаковий;
- 390px: таби переносяться, картки акаунта в одну колонку, ґрід колекції не ріже картки;
- решта сайту не зачеплена: `/`, `/releases`, одна detail-сторінка — `DefaultButton` і `Input` спільні, тому короткий обхід обов'язковий.

- [ ] **Step 3: Оновити документацію**

- `docs/initiatives/profile-surface.md` → `Status: Implemented`, `Last reviewed: <дата>`;
- рядок у `docs/roadmap.md` → `Implemented`;
- `AGENTS.md`, секція **Profile**: додати, що поверхня profile тримає ті самі два текстові тири й outline-focus, що auth, і що її охороняє блок `profile surface` в `tests/unit/interactionStates.test.ts`; згадати `ReleaseTrack` як тип гідрованого треку поряд із канонічним `Track`.

- [ ] **Step 4: Коміт**

```
git add docs/initiatives/profile-surface.md docs/roadmap.md AGENTS.md
git commit -m "docs: record profile surface implementation"
```

`AGENTS.md` уже має незакомічені зміни в дереві — перед `git add` переглянути `git diff AGENTS.md` і за потреби використати `git add -p`.

---

## Порядок і залежності

Task 1 і Task 2 незалежні одна від одної та від решти — обидві можна робити першими. Tasks 3-5 йдуть строго послідовно: кожна розширює `PROFILE_FILES` і мусить лишити тест зеленим. Task 6 залежить від Task 5 (працює з уже мігрованою розміткою). Task 7 остання.

Мінімальний зріз, який можна віддати окремо, якщо решта відкладається: **Task 1 + Task 2**. Це продовий фікс плюс те, що не дасть такому бага знову сховатися.
