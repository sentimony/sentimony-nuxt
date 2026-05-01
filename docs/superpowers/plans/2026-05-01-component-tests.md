# Component Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Покрити component-тестами чотири нетривіальні компоненти: `Item.vue` (умовні бейджі + like-кнопка), `Tabs.vue` (клавіатурна навігація + ARIA), `OpenImage.vue` (Esc + backdrop-click), `OpenSidebar.vue` (Esc + body scroll-lock + ARIA). Тести фіксують поведінку, що ми вже додали в попередніх правках, як safety-net від регресії.

**Architecture:** `mountSuspended` з `@nuxt/test-utils/runtime` для Nuxt-aware рендерингу (підтягує auto-imports, `<NuxtLink>`, `<Icon>`, `v-wave` директиву через `v-wave/nuxt`-модуль). Для непростих залежностей — `mockNuxtImport` (мок `useArtistLikes` для `Item.vue`). Клавіатурні події — через `wrapper.trigger('keydown')` для локальних handler-ів; для глобальних `window`-listener-ів (Esc у модалках) — `window.dispatchEvent(new KeyboardEvent('keydown', ...))`. Body scroll-lock перевіряємо через `document.body.style.overflow`.

**Tech Stack:** Vitest 3.x · @nuxt/test-utils 3.x · @vue/test-utils 2.x · happy-dom · Vue 3 · TypeScript.

---

## Context для виконавця

**Передумова:** Плани `2026-05-01-vitest-setup.md` і `2026-05-01-server-route-tests.md` уже виконані. `npm test` прогонить ~17 тестів зеленими. `tests/setup.ts` і `tests/utils/withSetup.ts` існують.

**Які компоненти і чому саме вони:**

| Компонент | Що нетривіальне | Покриваємо |
|---|---|---|
| `app/components/Item.vue` | Умовні бейджі (`coming_soon`/`new`); like-кнопка лише для `category='artist'`; aria-pressed; залежить від `useArtistLikes`. | 4 тести: бейдж "Coming Soon", бейдж "Out Now", відсутність бейджів за замовчуванням, like-button only for artists. |
| `app/components/Tabs.vue` | Власна імплементація tablist з ARIA (`role`, `aria-selected`, керованим `tabindex`) і keyboard navigation (`ArrowLeft/Right` циклічний, `Home/End`). Patterns з DESIGN.md §8. | 6 тестів: initial selection, click, ArrowRight cyclic, ArrowLeft cyclic, Home/End, ARIA + tabindex. |
| `app/components/OpenImage.vue` | Глобальний `window` keydown listener для Esc; backdrop-click closes; `@click.stop` на content. | 4 тести: модалка не відкривається без `image_xl`, click thumbnail відкриває, Esc закриває, backdrop-click закриває (а content-click — ні). |
| `app/components/OpenSidebar.vue` | Esc + scroll-lock (`document.body.style.overflow`) + ARIA (`role="dialog"`, `aria-modal`, `inert`). | 4 тести: initial closed + body unlocked, toggle open + body locked, Esc closes + body unlocked, panel `inert` keeping. |

**Загалом 18 тестів.**

**Чому НЕ тестуємо тут:** `Header.vue`, `Footer.vue`, `BtnPrimary.vue`, `RelativeItem.vue`, `Swiper.vue`, `Hero.vue`, `Fractal.vue`, `SvgTriangle.vue`, `Testimonials.vue`. Вони або декларативні (без conditional logic), або мають side-effects, що не впливають на user-visible behavior, або інтегруються тільки в e2e-сценаріях. Для них достатньо visual regression або e2e-smoke (поза цим планом).

**Mock-стратегія:**

1. **`useArtistLikes`** (для `Item.vue`) — `mockNuxtImport` повертає stub з `isLiked: () => false`, `toggleLike: vi.fn()`, `likeCount: () => 0`, `fetchCount: vi.fn()`. Тест верифікує вплив пропсів на DOM, не саму likes-логіку (це вже покрито в `useLikes.spec.ts`).
2. **`<NuxtLink>`** — `mountSuspended` рендерить її як справжню (з Nuxt-router-stub). Якщо це викликає проблеми — global stub `{ NuxtLink: { template: '<a><slot /></a>' } }`.
3. **`<Icon>`** з `@nuxt/icon` — auto-loaded в `nuxt`-environment. Якщо рендериться як комплекс — global stub `{ Icon: true }` рендерить як `<icon-stub>`, що не заважає тестам, які перевіряють DOM-атрибути зовні.
4. **`<ClientOnly>`** у `Tabs.vue` — у тестах інколи не рендерить slot. Stub `{ ClientOnly: { template: '<div><slot /><slot name="default" /></div>' } }` робить її pass-through.
5. **`v-wave`** директива — зареєстрована через `v-wave/nuxt` модуль (`nuxt.config.ts:88`). У `nuxt`-environment auto-loaded. Якщо буде ламати — stub `directives: { wave: () => {} }`.

**Глобальний test-environment в `tests/setup.ts`** додамо `vi.stubGlobal` для глобального `Document` (vi vs happy-dom вже надає), без зміни оригінального файлу setup-у з попередніх планів.

**Особливості тестування модалок:**
- `OpenImage.vue` і `OpenSidebar.vue` слухають **`window` keydown**, а не елементи всередині. Тому `wrapper.trigger('keydown', ...)` НЕ спрацює — потрібно `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`.
- Listener реєструється в `onMounted` і знімається в `onBeforeUnmount`. Перед `wrapper.unmount()` listener активний; після — ні. Тести мають викликати dispatch ДО unmount.
- Body scroll-lock — `document.body.style.overflow` пишеться напряму, перевірка `expect(document.body.style.overflow).toBe('hidden')` / `''`.
- Між тестами треба ресетати `document.body.style.overflow = ''` у `beforeEach`, бо Vue-component `onBeforeUnmount` чистить тільки якщо ми викликаємо `wrapper.unmount()`.

**TDD-нюанс:** як і в попередніх планах, тестуємо існуючий код — тести мають зеленіти одразу. Якщо red — debug тест/моки, не код.

---

## File Structure

**Create:**
- `tests/utils/mountWithStubs.ts` — обгортка над `mountSuspended` з нашими дефолтними stubs.
- `tests/components/Item.spec.ts` — 4 тести.
- `tests/components/Tabs.spec.ts` — 6 тестів.
- `tests/components/OpenImage.spec.ts` — 4 тести.
- `tests/components/OpenSidebar.spec.ts` — 4 тести.

**Modify:**
- `tests/setup.ts` — додати `beforeEach` reset `document.body.style.overflow = ''` (для модалок).

**Не змінюємо:**
- Жоден код у `app/` — тільки тести.

---

## Task 1: Створити `mountWithStubs` helper + reset body-scroll у setup

**Files:**
- Create: `tests/utils/mountWithStubs.ts`
- Modify: `tests/setup.ts`

- [ ] **Step 1: Створити helper**

`tests/utils/mountWithStubs.ts`:
```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'

type MountOptions = Parameters<typeof mountSuspended>[1]

export function mountWithStubs<T>(component: T, options: MountOptions = {}) {
  return mountSuspended(component as Parameters<typeof mountSuspended>[0], {
    ...options,
    global: {
      ...options?.global,
      stubs: {
        ClientOnly: { template: '<div><slot /></div>' },
        Icon: { template: '<i class="icon-stub" :data-name="name"></i>', props: ['name', 'size'] },
        ...options?.global?.stubs,
      },
      directives: {
        wave: () => {},
        ...options?.global?.directives,
      },
    },
  })
}
```

Цей helper:
- Stub `<ClientOnly>` як pass-through, щоб slot завжди рендериться (інакше `<Tabs>` під SSR-fallback не покаже діти).
- Stub `<Icon>` як `<i class="icon-stub" data-name="...">` — дозволяє тестам перевіряти, які іконки рендеряться (`wrapper.find('[data-name="heroicons:heart-solid"]')`), не залежачи від реального `@nuxt/icon`.
- Stub `v-wave` як no-op директива — на випадок, якщо `v-wave/nuxt` модуль не активований у тестовому Nuxt.
- Дозволяє overriding-нути будь-який з цих stubs через `options.global.stubs` у конкретному тесті.

- [ ] **Step 2: Додати reset body-scroll у `tests/setup.ts`**

В існуючий `beforeEach` у `tests/setup.ts` додати один рядок (відразу після `vi.stubGlobal('$fetch', vi.fn())`):
```ts
document.body.style.overflow = ''
```

Файл `tests/setup.ts` має виглядати так після правки:
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
  document.body.style.overflow = ''
})
```

- [ ] **Step 3: Тип-чек і прогін існуючих тестів**

Run: `npx vue-tsc --noEmit && npm test`
Expected: 0 type errors. Усі попередні 17 тестів — зелені (5 useLikes + 12 server). Жодного нового тесту тут немає, ми лише додали helper.

- [ ] **Step 4: Commit**

```bash
git add tests/utils/mountWithStubs.ts tests/setup.ts
git commit -m "test(component): add mountWithStubs helper and body-scroll reset"
```

---

## Task 2: `Item.vue` — умовні бейджі + like-кнопка

**Files:**
- Create: `tests/components/Item.spec.ts`

- [ ] **Step 1: Створити test-файл з 4 тестами**

`tests/components/Item.spec.ts`:
```ts
import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mountWithStubs } from '../utils/mountWithStubs'
import Item from '~/components/Item.vue'

mockNuxtImport('useArtistLikes', () => () => ({
  isLiked: () => false,
  toggleLike: vi.fn(),
  likeCount: () => 0,
  fetchCount: vi.fn(),
}))

describe('Item.vue', () => {
  const baseItem = {
    slug: 'test-slug',
    title: 'Test Title',
    cover_th: 'http://example.com/cover.jpg',
    visible: true,
    date: '2024-01-01',
  }

  it('показує бейдж "Coming Soon" коли coming_soon=true', async () => {
    const wrapper = await mountWithStubs(Item, {
      props: { i: { ...baseItem, coming_soon: true }, category: 'release' },
    })

    const badge = wrapper.find('.bg-green-600')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Coming Soon')
  })

  it('показує бейдж "Out Now" коли new=true', async () => {
    const wrapper = await mountWithStubs(Item, {
      props: { i: { ...baseItem, new: true }, category: 'release' },
    })

    const badge = wrapper.find('.bg-red-600')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Out Now')
  })

  it('не показує бейдж за замовчуванням', async () => {
    const wrapper = await mountWithStubs(Item, {
      props: { i: baseItem, category: 'release' },
    })

    expect(wrapper.find('.bg-green-600').exists()).toBe(false)
    expect(wrapper.find('.bg-red-600').exists()).toBe(false)
  })

  it('like-кнопка з`являється лише для category="artist"', async () => {
    const releaseWrapper = await mountWithStubs(Item, {
      props: { i: baseItem, category: 'release' },
    })
    expect(releaseWrapper.find('button[aria-pressed]').exists()).toBe(false)

    const artistWrapper = await mountWithStubs(Item, {
      props: { i: baseItem, category: 'artist' },
    })
    const likeBtn = artistWrapper.find('button[aria-pressed]')
    expect(likeBtn.exists()).toBe(true)
    expect(likeBtn.attributes('aria-label')).toContain('Test Title')
  })
})
```

- [ ] **Step 2: Запустити**

Run: `npm test -- tests/components/Item.spec.ts`
Expected: 4 tests passed.

Якщо red:
- «Cannot resolve '~/components/Item.vue'» → fallback `'../../app/components/Item.vue'`.
- «`useArtistLikes` is not a function» → переконатись, що `mockNuxtImport` фабрика повертає функцію, що повертає об'єкт (`() => () => ({...})`), а не одразу об'єкт.
- Якщо badge не знайдено за класом — перевірити, що `Item.vue` рендерить саме `bg-green-600` для Coming Soon і `bg-red-600` для Out Now (рядки 64-65 у компоненті).

- [ ] **Step 3: Прогон усіх тестів — переконатись, що нічого не зламали**

Run: `npm test`
Expected: 21 tests passed (17 + 4 нові).

- [ ] **Step 4: Commit**

```bash
git add tests/components/Item.spec.ts
git commit -m "test(component): cover Item.vue badges and like-button visibility"
```

---

## Task 3: `Tabs.vue` — keyboard navigation + ARIA

**Files:**
- Create: `tests/components/Tabs.spec.ts`

- [ ] **Step 1: Створити test-файл з 6 тестами**

`tests/components/Tabs.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mountWithStubs } from '../utils/mountWithStubs'
import Tabs from '~/components/Tabs.vue'
import Tab from '~/components/Tab.vue'

const TabsHarness = {
  components: { Tabs, Tab },
  template: `
    <Tabs>
      <Tab title="A">Content A</Tab>
      <Tab title="B">Content B</Tab>
      <Tab title="C">Content C</Tab>
    </Tabs>
  `,
}

describe('Tabs.vue', () => {
  it('перший таб селектний при першому рендері', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    expect(buttons).toHaveLength(3)
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
    expect(buttons[1]?.attributes('aria-selected')).toBe('false')
    expect(buttons[2]?.attributes('aria-selected')).toBe('false')
  })

  it('клік по табу робить його активним', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[2]?.trigger('click')

    expect(buttons[0]?.attributes('aria-selected')).toBe('false')
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')
  })

  it('ArrowRight циклічно перемикає вперед, з останнього на перший', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[0]?.trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[1]?.attributes('aria-selected')).toBe('true')

    await buttons[1]?.trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')

    await buttons[2]?.trigger('keydown', { key: 'ArrowRight' })
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
  })

  it('ArrowLeft циклічно перемикає назад, з першого на останній', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[0]?.trigger('keydown', { key: 'ArrowLeft' })
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')

    await buttons[2]?.trigger('keydown', { key: 'ArrowLeft' })
    expect(buttons[1]?.attributes('aria-selected')).toBe('true')
  })

  it('Home переходить на перший, End — на останній', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    await buttons[0]?.trigger('click')
    await buttons[0]?.trigger('keydown', { key: 'End' })
    expect(buttons[2]?.attributes('aria-selected')).toBe('true')

    await buttons[2]?.trigger('keydown', { key: 'Home' })
    expect(buttons[0]?.attributes('aria-selected')).toBe('true')
  })

  it('tabindex керований: 0 для активного, -1 для решти', async () => {
    const wrapper = await mountWithStubs(TabsHarness)
    const buttons = wrapper.findAll('[role="tab"]')

    expect(buttons[0]?.attributes('tabindex')).toBe('0')
    expect(buttons[1]?.attributes('tabindex')).toBe('-1')
    expect(buttons[2]?.attributes('tabindex')).toBe('-1')

    await buttons[1]?.trigger('click')
    expect(buttons[0]?.attributes('tabindex')).toBe('-1')
    expect(buttons[1]?.attributes('tabindex')).toBe('0')
  })
})
```

- [ ] **Step 2: Запустити**

Run: `npm test -- tests/components/Tabs.spec.ts`
Expected: 6 tests passed.

Якщо red:
- «buttons.length === 0» → `<ClientOnly>` blocks render. Перевірити, що stub `ClientOnly` у `mountWithStubs` працює (рендерить slot).
- «aria-selected відсутній» → перевірити, що `Tabs.vue` рендерить `<button role="tab">` (а не `<span>`) — це є після нашої правки hover-only тасків.

- [ ] **Step 3: Прогон усіх тестів**

Run: `npm test`
Expected: 27 tests passed (21 + 6).

- [ ] **Step 4: Commit**

```bash
git add tests/components/Tabs.spec.ts
git commit -m "test(component): cover Tabs.vue keyboard navigation and ARIA"
```

---

## Task 4: `OpenImage.vue` — Esc + backdrop-click

**Files:**
- Create: `tests/components/OpenImage.spec.ts`

- [ ] **Step 1: Створити test-файл з 4 тестами**

`tests/components/OpenImage.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mountWithStubs } from '../utils/mountWithStubs'
import OpenImage from '~/components/OpenImage.vue'

const xlImage = 'http://example.com/full.jpg'
const thImage = 'http://example.com/thumb.jpg'

describe('OpenImage.vue', () => {
  it('не відкриває модалку якщо image_xl відсутній', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, alt: 'no-xl' },
    })

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('клік по thumbnail відкриває модалку', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, image_xl: xlImage, alt: 'cover' },
    })

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
    expect(wrapper.find(`img[src="${xlImage}"]`).exists()).toBe(true)
  })

  it('Esc закриває відкриту модалку', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, image_xl: xlImage, alt: 'cover' },
    })

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('клік по бекдропу закриває; клік по контенту — ні', async () => {
    const wrapper = await mountWithStubs(OpenImage, {
      props: { image_th: thImage, image_xl: xlImage, alt: 'cover' },
    })

    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)

    await wrapper.find(`img[src="${xlImage}"]`).trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)

    const backdrop = wrapper.find('.absolute.inset-0.bg-black\\/30')
    expect(backdrop.exists()).toBe(true)
    await backdrop.trigger('click')
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Запустити**

Run: `npm test -- tests/components/OpenImage.spec.ts`
Expected: 4 tests passed.

Якщо red:
- «window.dispatchEvent — модалка не закривається» → перевірити, що happy-dom коректно delivers event у `window` listener. Можлива причина: listener реєструється в `onMounted`, який викликається після `mountSuspended`, але awaitable. Якщо потрібно — додати `await wrapper.vm.$nextTick()` перед dispatch-ом.
- «`.absolute.inset-0.bg-black\\/30` не знайдено» — клас має escape-ovaний `/`, тому `\\/30`. Якщо все одно не знайдено — використати `wrapper.findAll('div').filter(d => d.classes().includes('bg-black/30'))[0]`.
- Якщо `<Transition>` повільно завершує leave-анімацію (200ms) і `.fixed.inset-0` все ще існує під час expect — додати `await new Promise(r => setTimeout(r, 250))` перед expect-ом, або у `vitest.config.ts` встановити `test.fakeTimers` і `vi.advanceTimersByTime(250)`.

- [ ] **Step 3: Прогон усіх тестів**

Run: `npm test`
Expected: 31 tests passed (27 + 4).

- [ ] **Step 4: Commit**

```bash
git add tests/components/OpenImage.spec.ts
git commit -m "test(component): cover OpenImage.vue Esc and backdrop close"
```

---

## Task 5: `OpenSidebar.vue` — Esc + body scroll-lock + ARIA

**Files:**
- Create: `tests/components/OpenSidebar.spec.ts`

- [ ] **Step 1: Створити test-файл з 4 тестами**

`tests/components/OpenSidebar.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mountWithStubs } from '../utils/mountWithStubs'
import OpenSidebar from '~/components/OpenSidebar.vue'

describe('OpenSidebar.vue', () => {
  it('закрита за замовчуванням, body unlocked, panel inert', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)

    expect(document.body.style.overflow).toBe('')
    const panel = wrapper.find('#mobile-sidebar')
    expect(panel.exists()).toBe(true)
    expect(panel.attributes('inert')).toBeDefined()
  })

  it('toggle button відкриває sidebar і блокує body-scroll', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)

    const toggle = wrapper.find('button[aria-controls="mobile-sidebar"]')
    expect(toggle.exists()).toBe(true)
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper.find('#mobile-sidebar').attributes('inert')).toBeUndefined()
  })

  it('Esc закриває відкритий sidebar і знімає scroll-lock', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)
    const toggle = wrapper.find('button[aria-controls="mobile-sidebar"]')

    await toggle.trigger('click')
    expect(document.body.style.overflow).toBe('hidden')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(document.body.style.overflow).toBe('')
  })

  it('panel має role="dialog" + aria-modal + aria-label', async () => {
    const wrapper = await mountWithStubs(OpenSidebar)
    const panel = wrapper.find('#mobile-sidebar')

    expect(panel.attributes('role')).toBe('dialog')
    expect(panel.attributes('aria-modal')).toBe('true')
    expect(panel.attributes('aria-label')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Запустити**

Run: `npm test -- tests/components/OpenSidebar.spec.ts`
Expected: 4 tests passed.

Якщо red:
- «toggle button не знайдено за aria-controls» → перевірити, що `OpenSidebar.vue` має `aria-controls="mobile-sidebar"` на кнопці (це є після нашої правки модалок).
- «document.body.style.overflow не міняється» → перевірити, що watch(isOpen, ...) активний у component-середовищі. Watch реєструється в `<script setup>` і має працювати в тестах.
- Якщо `inert`-атрибут у happy-dom не підтримується — перевірити, що рендер дав `inert` як boolean attribute. Тест використовує `expect(...).toBeDefined()` для open і `toBeUndefined()` для closed — це працює, бо Vue ставить `inert=""` коли true і прибирає коли false.

- [ ] **Step 3: Прогон усіх тестів**

Run: `npm test`
Expected: 35 tests passed (31 + 4).

- [ ] **Step 4: Commit**

```bash
git add tests/components/OpenSidebar.spec.ts
git commit -m "test(component): cover OpenSidebar.vue Esc, scroll-lock and ARIA"
```

---

## Task 6: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Прогнати весь test-suite**

Run: `npm test`
Expected:
- `tests/composables/useLikes.spec.ts` — 5 passed.
- `tests/server/api/likes.spec.ts` — 12 passed.
- `tests/components/Item.spec.ts` — 4 passed.
- `tests/components/Tabs.spec.ts` — 6 passed.
- `tests/components/OpenImage.spec.ts` — 4 passed.
- `tests/components/OpenSidebar.spec.ts` — 4 passed.
- **Загалом 35 tests, 0 failed.** Час < 15s.

- [ ] **Step 2: Двічі підряд для перевірки на state-leak**

Run: `npm test && npm test`
Expected: обидва прогона зелені.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build success. `tests/` не потрапляють у Nuxt-build.

- [ ] **Step 5: LOC sanity**

Run: `wc -l tests/components/*.spec.ts tests/utils/mountWithStubs.ts`
Expected: усі spec-файли разом ~250 рядків. Інженер бачить, що шаблон витриманий, файли не роздуті.

- [ ] **Step 6: Final commit (якщо щось додалось)**

```bash
git status
# Якщо чисто — без коміту.
```

---

## Notes для виконавця

**Якщо `mountSuspended` падає з «cannot resolve component':**
Це може статися, якщо Nuxt-environment не підняв повний `<NuxtApp>`-stub. Двa fallback-и:

1. У тесті явно зареєструвати глобальний компонент:
   ```ts
   global: { components: { NuxtLink: { template: '<a><slot /></a>' } } }
   ```
2. Замість `mountSuspended` використати звичайний `mount` з @vue/test-utils + повний stubs:
   ```ts
   import { mount } from '@vue/test-utils'
   const wrapper = mount(Component, { global: { stubs: { NuxtLink: true, ... } } })
   ```
   Це втрачає Nuxt auto-imports у компоненті — якщо компонент юзає `useState` чи `useSupabaseUser`, потрібен ще `mockNuxtImport`. Тому це останній resort.

**Якщо тести Esc для OpenImage/OpenSidebar бачать listener, що залишився від попереднього тесту:**
Listener реєструється в `onMounted` і знімається в `onBeforeUnmount`. `mountSuspended` сам викликає cleanup між тестами через wrapper-tracking. Якщо все одно протікає — у `afterEach` свого spec-файлу додати `wrapper?.unmount()` (де `wrapper` — let-змінна, що зберігає попередній mount).

**Якщо `<Transition>` (у `OpenImage`) затягує закриття:**
Vue `<Transition>` має `enter-active-class`/`leave-active-class`. У тестах CSS не застосовується (happy-dom не парсить style), тому transition-callback може спрацьовувати миттєво або зависати. Якщо тест нестабільний, замінити `<Transition>` через global stub:
```ts
global: { stubs: { Transition: { template: '<div><slot /></div>' } } }
```
Це робить Transition pass-through — слот рендериться/видаляється миттєво за `v-if`.

**Якщо хочеш покрити focus-keeping (фокус повертається на тригер після закриття модалки):**
Це вже за межами цього плану. Додати окремий тест: `triggerButton.element === document.activeElement` після close. Це A11y-best-practice, але не реалізовано в компонентах поки — окрема задача.

**Що далі (поза цим планом):**

1. **Покрити решту нав-патернів** — `Header.vue` social tooltip (focus-within), Footer соцмережі. Поведінка вже задокументована в DESIGN.md §3.8 і §8.
2. **Покрити пагіновані секції profile-сторінки** — `usePaginatedLikes` композабль (як юніт) + `LikedSection`-компонент (коли його витягнемо як рефакторинг 21).
3. **Snapshot-тести** для брендових моментів (`Hero.vue`, `Item.vue` cover-bg). Низький ROI — лишити на пізніше або винести в Playwright visual-regression.
4. **Storybook замість тестів** для дизайн-системи — overkill для цього проєкту.
5. **CI integration** — `.github/workflows/test.yml`, що запускає `npm test` + `vue-tsc` + `npm run build` на кожен PR.
6. **Підготовка до `defineLikesHandler` рефакторингу** — з юніт-тестами на сервері (план 2) і композаблями (план 1) ми тепер маємо safety-net. Можна сміливо виконувати фабрику `createLikes` з плану `2026-05-01-likes-factory.md` без страху регресій.
