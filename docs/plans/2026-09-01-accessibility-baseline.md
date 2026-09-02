# Accessibility Baseline Implementation Plan

> **For agentic workers:** Use subagent-driven-development (recommended) or executing-plans to execute the plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Додати проєкту базовий рівень доступності — лендмарки, скіп-лінку, видимий фокус на всіх інтерактивних елементах, доступні імена й спроєктовані стани списків — не змінюючи композицію й візуальну мову.

**Architecture:** Усі зміни — семантичні (теги, атрибути, класи) плюс один новий компонент `CollectionStatus`, узагальнений з наявного `ProfileCollectionStatus`. Глобальне focus-правило лишається **поза `@layer`**, тому перебиває утиліти Tailwind незалежно від специфічності. Кожна зміна закріплюється юніт-тестом, який читає джерело як рядок — патерн `tests/unit/interactionStates.test.ts`.

**Tech Stack:** Nuxt 4, Vue 3 SFC, Tailwind v4 (`@tailwindcss/vite`, без конфігів), reka-ui, Vitest (`environment: node`, тести читають файли з диска).

**Спека:** [`docs/specs/2026-09-01-accessibility-baseline-design.md`](../specs/2026-09-01-accessibility-baseline-design.md)
**Аудит:** [`docs/audits/2026-09-01-frontend-crafting-audit.md`](../audits/2026-09-01-frontend-crafting-audit.md)

## Global Constraints

- **Мова:** коментарі в коді — англійською; commit-меседжі, заголовок і опис PR — англійською; спілкування — українською.
- **Коду не додавати понад перелічене.** Композиція, сітка, кольори поза списком V2 не міняються.
- **Tailwind v4:** немає `tailwind.config` і `postcss.config`. Токени — в `@theme` / `@theme inline` у `app/assets/css/tailwind.css`.
- **`@apply` заборонений у `<style scoped>`.** У `Swiper.vue` блок `<style>` не scoped і має `@reference "../assets/css/tailwind.css"` — там `@apply` працює.
- **Два текстові рівні:** `text-foreground` і `text-muted-foreground`. Рівнів `/25`, `/40`, `/50` не додавати.
- **Focus:** використовувати `outline-*`, не `ring-*`. Ніколи не додавати безумовний `outline-none`.
- **Файли закінчуються одним переносом рядка, без trailing whitespace, відступ — 2 пробіли.**
- **Перевірка після кожної задачі:** `npm run test:unit && npm run typecheck && npm run docs:check`.
- **Git:** `git add` лише з явним переліком файлів; **`git add -A` і `git add .` заборонені**.

## Контекст для виконавця

- **Робоче дерево брудне і це навмисно.** `package.json`, `package-lock.json`, `scripts/skills.sh` мають незв'язані зміни — вони **лишаються незастейдженими до кінця роботи**. Не комітити їх, не робити amend у чужі коміти.
- **Перед кожним `git commit` звіряти індекс:** `git diff --cached --name-only` має дорівнювати allowlist задачі. `git add <paths>` не рятує від того, що в індексі вже лежить чуже, застейджене раніше.
- **Гілка:** `a11y-baseline` від `main`. Коміт на задачу, у кінці — один squash-merge PR. Задача 8 (`CollectionStatus`) за спекою може їхати окремим PR.
- **Швидкий прогін одного тесту:** `npx vitest run tests/unit/<file>.test.ts` — обходить хук `pretest:unit` (`convert:yml`); JSON-експорт уже на диску. Повний `npm run test:unit` — перед комітом.
- **Не запускати `sync:*`** — вони пишуть у бойові Firebase/Supabase.
- **Не зупиняти чужі dev-сервери** на портах 3000–3002. Свій — на `--port 3100`.
- **Номери рядків у спеці подекуди застарілі** (вона писалась до кількох правок). Цей план містить перевірені номери; при розбіжності вірити плану, а перед правкою — перечитати файл.
- **Відхилення від спеки, свідоме:** спека кладе всі нові перевірки в `interactionStates.test.ts`; план заводить `landmarks.test.ts`, `accessibleNames.test.ts` і `collectionStatus.test.ts`, а `interactionStates` розширює лише для фокуса й текстових рівнів. Файл уже на 240+ рядках і тримає інваріанти стилів, а не структури; три тематичні файли легше читати й запускати поодинці. AGENTS.md у задачі 9 називає саме ці три файли.

---

## Задача 0. Precondition: закомітити документи сесії

**Files:**
- Commit: `docs/audits/2026-09-01-frontend-crafting-audit.md`, `docs/audits/README.md`, `docs/specs/2026-09-01-accessibility-baseline-design.md`, `docs/initiatives/accessibility-structure.md`, `docs/roadmap.md`, `docs/plans/2026-09-01-accessibility-baseline.md`

Аудит і спека — untracked, а `roadmap.md`, `accessibility-structure.md` і `audits/README.md` мають незакомічені зміни з тієї ж сесії (перенесення P2 → P1). Якщо їх не зафіксувати зараз, останній крок плану (`Status: Implemented`) застейджить їх разом зі своєю зміною і змішає дві не пов'язані правки в одному коміті.

- [x] **Step 1: Перевірити, що в індексі порожньо**

```bash
git diff --cached --name-only
```

Очікування: порожній вивід. Якщо ні — `git reset` (без `--hard`), він лише спорожнює індекс і не чіпає файли.

- [x] **Step 2: Створити гілку**

```bash
git checkout -b a11y-baseline
```

- [x] **Step 3: Застейджити тільки документи**

```bash
git add docs/audits/2026-09-01-frontend-crafting-audit.md docs/audits/README.md \
        docs/specs/2026-09-01-accessibility-baseline-design.md \
        docs/initiatives/accessibility-structure.md docs/roadmap.md \
        docs/plans/2026-09-01-accessibility-baseline.md
git diff --cached --name-only
```

Очікування: рівно шість шляхів вище. `package.json`, `package-lock.json`, `scripts/skills.sh` **не мають** з'явитися.

- [x] **Step 4: Перевірити docs і закомітити**

```bash
npm run docs:check
git commit -m "docs: add frontend audit, accessibility spec and implementation plan"
```

Очікування: `docs-check: ok (…)`, коміт створено.

---

## Задача 1. Лендмарки shell: `header`, `footer`, `nav`, `main`

**Files:**
- Modify: `app/layouts/default.vue:104-196` (шаблон)
- Modify: `app/components/Header.vue:34,57,168`
- Modify: `app/components/Footer.vue:13,17,28`
- Modify: `app/components/OpenSidebar.vue:74,86`
- Modify: `app/pages/profile.vue:32,52`
- Test: `tests/unit/landmarks.test.ts` (create)

**Interfaces:**
- Produces: `<main id="main" tabindex="-1">` у `app/layouts/default.vue` — ціль скіп-лінки із задачі 2. Три `<nav>` з іменами `Main`, `Footer`, `Mobile`.

**Контекст:** у проєкті **немає жодного `<nav>`** — грепом `<nav` по `app/` знаходиться тільки `app/pages/profile.vue:34` (`aria-label="Profile collection"`). Єдиний `<main>` — `app/pages/profile.vue:32`; він **віддає свій**, інакше на `/profile` буде два. Хелпер `tagClasses()` у наявних тестах шукає тег через `lastIndexOf('<', …)`, тому заміна `div` → `header`/`footer` його не ламає; `layout-loading.spec.ts` і `interactionStates.test.ts` тримаються за `data-testid`, який зберігається.

- [x] **Step 1: Написати падаючий тест**

Create `tests/unit/landmarks.test.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

const appSourceFiles = () =>
  (readdirSync(projectFile('app'), { recursive: true, encoding: 'utf8' }) as string[])
    .filter(file => file.endsWith('.vue'))
    .map(file => `app/${file}`)

describe('document landmarks', () => {
  it('declares exactly one main per rendered document', () => {
    const owners = appSourceFiles().filter(file => readProjectFile(file).includes('<main'))

    // error.vue renders outside NuxtLayout and gains its own <main> in Task 3.
    expect(owners.sort()).toEqual(['app/layouts/default.vue'])
  })

  it('gives the layout main the skip-link target id', () => {
    const layout = readProjectFile('app/layouts/default.vue')

    expect(layout).toMatch(/<main\s+id="main"\s+tabindex="-1"/)
  })

  it('wraps the header and footer in their own landmarks', () => {
    expect(readProjectFile('app/components/Header.vue')).toContain('<header data-testid="site-header"')
    expect(readProjectFile('app/components/Footer.vue')).toContain('<footer data-testid="site-footer"')
  })

  it('names every navigation region', () => {
    expect(readProjectFile('app/components/Header.vue')).toContain('<nav aria-label="Main"')
    expect(readProjectFile('app/components/Footer.vue')).toContain('<nav aria-label="Footer"')
    expect(readProjectFile('app/components/OpenSidebar.vue')).toContain('<nav aria-label="Mobile"')
    expect(readProjectFile('app/pages/profile.vue')).toContain('aria-label="Profile collection"')
  })
})
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/landmarks.test.ts
```

Очікування: FAIL. Перший тест дає `['app/pages/profile.vue']` замість очікуваного масиву; решта — на відсутніх рядках (у четвертому `it` рядок `aria-label="Profile collection"` уже є, падають три інші `expect`).

- [x] **Step 3: `default.vue` — обгорнути `<slot/>` у `<main>`**

У `app/layouts/default.vue` замінити блок на рядках 182-184:

```vue
        <div class="order-[2]">
          <slot/>
        </div>
```

на:

```vue
        <main id="main" tabindex="-1" class="order-[2]">
          <slot/>
        </main>
```

- [x] **Step 4: `Header.vue` — `<header>` і `<nav>`**

Рядок 34: `<div data-testid="site-header" class="sticky top-0 …">` → `<header data-testid="site-header" class="sticky top-0 …">` (класи без змін). Корінь закривається **останнім** `</div>` перед `</template>` — рядок 168, відступ два пробіли → `</header>`. Проміжні закривні теги на рядках 163-167 не чіпати.

Рядок 57: `<div class="hidden sm:flex gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">` → `<nav aria-label="Main" class="hidden sm:flex gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">`; парний `</div>` на рядку 70 → `</nav>`.

- [x] **Step 5: `Footer.vue` — `<footer>` і `<nav>`**

Рядок 13: `<div data-testid="site-footer" class="relative z-100 …">` → `<footer data-testid="site-footer" class="relative z-100 …">`; корінь закривається на рядку 91 (останній `</div>` перед `</template>`, відступ два пробіли) → `</footer>`.

Рядок 17: `<div class="flex justify-center flex-wrap overflow-hidden rounded-sm border border-white/10 ">` → `<nav aria-label="Footer" class="flex justify-center flex-wrap overflow-hidden rounded-sm border border-white/10 ">`; парний `</div>` на рядку 28 (з відступом вісім пробілів) → `</nav>`. Рядок 29 закриває зовнішню обгортку `mb-10 text-sm` і лишається `</div>`.

- [x] **Step 6: `OpenSidebar.vue` — `<nav>` у шухляді**

Рядок 74: `<div class="flex flex-col items-center gap-1 px-2 py-2">` (перший з двох однакових — той, що містить `v-for="i in getNav()"`) → `<nav aria-label="Mobile" class="flex flex-col items-center gap-1 px-2 py-2">`; його закривний `</div>` на рядку 86 → `</nav>`. **Другий** блок із тими самими класами (рядок 90, з кнопкою теми і Profile) не чіпати.

- [x] **Step 7: `profile.vue` — віддати `<main>`**

Рядок 32: `<main class="px-4 py-10 sm:py-12">` → `<div class="px-4 py-10 sm:py-12">`; рядок 52 `</main>` → `</div>`.

- [x] **Step 8: Прогнати новий тест і сусідні**

```bash
npx vitest run tests/unit/landmarks.test.ts tests/unit/interactionStates.test.ts tests/unit/profilePages.test.ts
```

Очікування: PASS усі три.

- [x] **Step 9: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add app/layouts/default.vue app/components/Header.vue app/components/Footer.vue \
        app/components/OpenSidebar.vue app/pages/profile.vue tests/unit/landmarks.test.ts
git diff --cached --name-only
git commit -m "feat(a11y): add header, footer, nav and main landmarks"
```

Очікування: зелено; в індексі рівно шість файлів.

---

## Задача 2. Скіп-лінка і `scroll-padding`

**Files:**
- Modify: `app/layouts/default.vue:104` (перший вузол шаблону)
- Modify: `app/assets/css/tailwind.css:119-123` (блок `html {}`)
- Test: `tests/unit/landmarks.test.ts` (доповнити)

**Interfaces:**
- Consumes: `<main id="main" tabindex="-1">` із задачі 1.

**Контекст:** дві пастки. Перша — `not-sr-only` виставляє `position: static`, і селектор `.focus\:not-sr-only:focus` (0,2,0) переб'є голий `fixed` (0,1,0); тому позиціювання теж має бути під варіантом `focus:`. Друга — після переходу браузер намалює власне обведення навколо всього `<main>`; глушимо його точково через `#main:focus { outline: none }` (це не порушує правило «не додавати безумовний `outline-none`»: елемент не інтерактивний, фокус на ньому — суто програмний). Значення `scroll-padding`: хедер `h-18` = 4.5rem + 1px бордюр → 5rem зверху; `GlobalPlayer` `min-h-[71px]` → 5rem знизу.

- [x] **Step 1: Дописати падаючі перевірки**

У `tests/unit/landmarks.test.ts` додати новий `describe` в кінець файлу:

```ts
describe('skip link', () => {
  it('is the first focusable node of the layout', () => {
    const layout = readProjectFile('app/layouts/default.vue')
    const templateStart = layout.indexOf('<template>')
    const skipIndex = layout.indexOf('href="#main"')
    const sidebarIndex = layout.indexOf('<OpenSidebar')

    expect(skipIndex).toBeGreaterThan(templateStart)
    expect(skipIndex, 'the burger button would otherwise take focus first').toBeLessThan(sidebarIndex)
  })

  it('positions itself only while focused', () => {
    const layout = readProjectFile('app/layouts/default.vue')

    expect(layout).toContain('sr-only focus:not-sr-only')
    expect(layout, 'not-sr-only resets position to static and beats a bare fixed').toContain('focus:fixed')
    expect(layout).toContain('focus:z-50')
  })

  it('offsets scrolling for both sticky bars', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')
    const htmlRule = cssBlock(css, '\nhtml {')

    expect(htmlRule).toContain('scroll-padding-top: 5rem')
    expect(htmlRule).toContain('scroll-padding-bottom: 5rem')
  })
})
```

Хелпер `cssBlock` у цьому файлі ще не визначений — додати його одразу після `readProjectFile` на початку файлу (копія робочої версії з `interactionStates.test.ts:8-13`):

```ts
const cssBlock = (source: string, opener: string) => {
  const start = source.indexOf(opener)
  expect(start, `${opener} block missing`).toBeGreaterThan(-1)
  const end = source.indexOf('\n}', start)
  return source.slice(start, end)
}
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/landmarks.test.ts
```

Очікування: FAIL на трьох нових перевірках; чотири з задачі 1 — PASS.

- [x] **Step 3: Додати скіп-лінку першим вузлом шаблону**

У `app/layouts/default.vue` перед рядком 104 (`<HomepageAtmosphere v-if="isIndex" />`), одразу після `<template>`:

```vue
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:border focus:border-foreground/30 focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
  >Skip to content</a>
```

Звичайний `<a>`, не `NuxtLink`: ціль — якір у поточному документі, роутер тут не потрібен.

- [x] **Step 4: Додати `scroll-padding` і погасити обведення цілі**

У `app/assets/css/tailwind.css` замінити блок на рядках 119-123:

```css
html {
  background-color: #ffffff;
  scrollbar-gutter: stable;
  overflow-x: hidden;
}
```

на:

```css
html {
  background-color: #ffffff;
  scrollbar-gutter: stable;
  overflow-x: hidden;
  /* Sticky header (4.5rem + border) and bottom player (71px) overlap anchor targets. */
  scroll-padding-top: 5rem;
  scroll-padding-bottom: 5rem;
}

/* The skip link moves focus here programmatically; the region itself is not interactive. */
#main:focus {
  outline: none;
}
```

- [x] **Step 5: Прогнати тести**

```bash
npx vitest run tests/unit/landmarks.test.ts tests/unit/interactionStates.test.ts
```

Очікування: PASS обидва файли.

- [x] **Step 6: Перевірити скіп-лінку живцем (руками, не тестом)**

Юніт-тест бачить лише класи; чи справді `focus:fixed` перебиває `position: static` із `not-sr-only`, показує тільки браузер. Перевіряти тут, а не в задачі 9, — інакше помилка в порядку утиліт проїде ще сім комітів.

```bash
npm run dev -- --port 3100
```

На `http://localhost:3100/`: натиснути `Tab` одразу після завантаження — першим має з'явитися видиме «Skip to content» у верхньому лівому куті (бургер сидить праворуч, `top-0 right-0`, тож перетину немає); `Enter` має перенести фокус на контент **під** липким хедером, без обведення навколо `<main>`. Зупинити **тільки цей** сервер. Порядок утиліт підтверджено компіляцією через `@tailwindcss/node` з репозиторію: `.focus\:not-sr-only:focus` виходить раніше за `.focus\:fixed:focus` і `.focus\:px-4:focus`, тож `fixed` і відступи виграють. Живцем перевіряється те, чого компіляція не покаже: відсутність обведення на `<main>` і приземлення під хедером завдяки `scroll-padding-top`. Якщо щось не так — зафіксувати спостереження й спитати, не вигадувати стилі на місці.

- [x] **Step 7: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add app/layouts/default.vue app/assets/css/tailwind.css tests/unit/landmarks.test.ts
git diff --cached --name-only
git commit -m "feat(a11y): add skip link and scroll padding for sticky bars"
```

---

## Задача 3. `<h1>` на головній і на сторінці помилки

**Files:**
- Modify: `app/components/Hero.vue:27`
- Modify: `app/error.vue:15-29`
- Test: `tests/unit/landmarks.test.ts` (доповнити)

**Контекст:** `error.vue` рендериться **поза** `NuxtLayout`, тому не отримує ні `<main>` із задачі 1, ні скіп-лінки. `lang` у нього є — оголошений у `nuxt.config.ts:24`, не в `app.vue`.

**Пастка навігації:** клієнтський перехід зі сторінки помилки **не скидає** саму помилку — `<NuxtLink to="/releases">` лишить користувача на тій самій сторінці помилки. Тому кожна кнопка викликає `clearError({ redirect })`. `PrimaryButton` для цього не годиться: він рендерить `<Button as-child>` навколо посилання й не має `@click`-обробника (`app/components/buttons/PrimaryButton.vue:26-33`) — беремо `DefaultButton`, який приймає `@click`.

- [x] **Step 1: Дописати падаючі перевірки**

У `tests/unit/landmarks.test.ts`, у кінець файлу:

Спершу оновити масив у тесті задачі 1 — `error.vue` тепер теж володіє лендмарком:

```ts
    expect(owners.sort()).toEqual(['app/error.vue', 'app/layouts/default.vue'])
```

Далі додати в кінець файлу:

```ts
describe('page title elements', () => {
  it('makes the homepage hero the h1', () => {
    const hero = readProjectFile('app/components/Hero.vue')

    expect(hero).toContain('<h1 v-html="heroTitle"/>')
  })

  it('gives the error page its own main and h1', () => {
    const errorPage = readProjectFile('app/error.vue')

    expect(errorPage).toContain('<main')
    expect(errorPage).toContain('<h1')
    expect(errorPage, 'client navigation does not clear the error state').not.toMatch(/<NuxtLink|:to="/)
    // One helper, three call sites: every exit must clear the error, not just navigate.
    expect(errorPage).toContain('const handleError = (redirect: string) => clearError({ redirect })')
    expect(errorPage.match(/@click="handleError\('/g) ?? []).toHaveLength(3)
  })

  it('drops the dead transition utility from the error page', () => {
    expect(readProjectFile('app/error.vue')).not.toContain('transition-background')
  })
})
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/landmarks.test.ts
```

Очікування: FAIL на трьох нових.

- [x] **Step 3: `Hero.vue` — підвищити рядок 27**

Замінити:

```vue
        <div v-html="heroTitle"/>
```

на:

```vue
        <h1 v-html="heroTitle"/>
```

Більше нічого в цьому файлі не чіпати. Preflight Tailwind скидає `font-size`, `font-weight` і `margin` у `h1`, тож візуально нічого не рухається — снапшот `homepage-theme.spec.ts` лишається валідним.

`heroTitle` дорівнює `'Sentimony<br>'`, тож доступне ім'я `<h1>` — «Sentimony», без «Records» (воно сидить у сусідньому `div` із `heroSubTitle`, розбите на літери). Спека свідомо обрала мінімальну правку «навколо наявного `heroTitle`, класи не змінюються»; тут це рішення виконується як є. Варіант із `<h1>` на зовнішній обгортці (внутрішні `div` → `span class="block"`) записаний у розділі «Що лишилось поза планом».

- [x] **Step 4: `error.vue` — переписати шаблон**

Замінити шаблон цілком (рядки 15-30, від `<template>` до `</template>` включно):

```vue
<template>
  <main class="max-w-sm flex flex-col justify-center min-h-screen mx-auto px-2 text-center text-foreground">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ error?.statusCode }}</h1>
    <p class="mb-6 text-muted-foreground">{{ error?.statusMessage }}</p>
    <div class="flex flex-wrap justify-center gap-2">
      <DefaultButton iconify="lucide:house" title="Go Home" @click="handleError('/')" />
      <DefaultButton iconify="lucide:disc-3" title="Releases" @click="handleError('/releases')" />
      <DefaultButton iconify="lucide:users" title="Artists" @click="handleError('/artists')" />
    </div>
  </main>
</template>
```

І в `<script setup>` замінити рядок 6:

```ts
const handleError = () => clearError({ redirect: '/' })
```

на:

```ts
const handleError = (redirect: string) => clearError({ redirect })
```

`transition-background` (неіснуюча утиліта Tailwind) зникає разом зі старою розміткою кнопки.

- [x] **Step 5: Прогнати тести**

```bash
npx vitest run tests/unit/landmarks.test.ts tests/unit/fractalAnimation.test.ts
```

Очікування: PASS обидва.

- [x] **Step 6: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add app/components/Hero.vue app/error.vue tests/unit/landmarks.test.ts
git diff --cached --name-only
git commit -m "feat(a11y): add h1 to homepage hero and rebuild the error page"
```

---

## Задача 4. Глобальний фокус на всіх інтерактивних елементах

**Files:**
- Modify: `app/assets/css/tailwind.css:107-110`
- Modify: `app/components/ThemeToggle.vue:9`
- Modify: `app/components/Header.vue:129,138`
- Modify: `tests/e2e/homepage-theme.spec.ts:185`
- Test: `tests/unit/interactionStates.test.ts:97-110`

**E2E-пастка:** `tests/e2e/homepage-theme.spec.ts:185` перевіряє `await expect(themeToggle).toHaveClass(/focus-visible:ring-2/)` — саме той клас, який крок 4 видаляє. Без правки задача 9 впаде на e2e, попри те що юніт-тести зелені. Playwright не в CI, тож локально це ніхто не помітить до ручного прогону.

**Контекст (важливо):** правило написане **поза `@layer`**, а всі утиліти Tailwind v4 лежать у `@layer utilities`. Нешарова декларація виграє в шарової **незалежно від специфічності** — тому після розширення селектора жоден компонент не зможе вбити фокус локальним `outline-none`. Це і є мета. Наслідок: два місця дадуть подвійну індикацію й чистяться руками. `ThemeToggle.vue:9` — єдине місце з `focus-visible:ring-*` у всьому `app/`; профільний тест (`interactionStates.test.ts:210`) такі класи вже забороняє, тож приводимо до спільного правила. `Header.vue:129,138` — мертвий `outline-none`, який правило вже сьогодні перебиває на `<a>`.

`focus:outline-none` у `OpenImage.vue:89` і `OpenSidebar.vue:66` **не чіпати** — це `DialogContent` reka-ui, програмний фокус на контейнері діалогу, не інтерактивний елемент.

- [x] **Step 1: Оновити тест під новий селектор**

У `tests/unit/interactionStates.test.ts` у першому `it` блоку `non-primitive focus` замінити **тільки рядки 98-104** (до порожнього рядка перед `passwordToggleFocusRule`; рядки 105-110 з перевірками `button.password-toggle` і закривним `})` лишаються як є — вони в тому самому `it`, не в окремому):

```ts
  it('replaces browser-default focus colours with the semantic ring token', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')

    const linkFocusRule = cssBlock(css, '\na:focus-visible {')
    expect(linkFocusRule).toContain('outline: 2px solid var(--ring)')
    expect(linkFocusRule).toContain('outline-offset: 2px')
```

на:

```ts
  it('replaces browser-default focus colours with the semantic ring token', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')

    const focusRule = cssBlock(css, '\n:is(a, button, [role="button"], input[type="range"], summary):focus-visible {')
    expect(focusRule).toContain('outline: 2px solid var(--ring)')
    expect(focusRule).toContain('outline-offset: 2px')

    // Unlayered declarations outrank anything in @layer utilities regardless of
    // specificity; wrapping this rule in a layer would silently disable it.
    // tailwind.css has no @layer today, so any earlier @layer means it moved.
    const ruleIndex = css.indexOf(':is(a, button, [role="button"], input[type="range"], summary):focus-visible')
    const enclosingLayer = css.lastIndexOf('@layer', ruleIndex)
    expect(enclosingLayer, 'the rule must stay unlayered').toBe(-1)
```

Після заміни `it` виглядає так: новий блок вище, порожній рядок, чотири незмінені `expect(passwordToggleFocusRule…)`, `})`. Перевірка на `@layer` навмисно груба (спрацює й на закритий `@layer` вище по файлу) — у `tailwind.css` його нема взагалі, і це прийнятна ціна за простоту.

І додати новий `it` у той самий `describe`:

```ts
  it('lets no component suppress the shared focus indicator', () => {
    for (const file of ['app/components/ThemeToggle.vue', 'app/components/Header.vue']) {
      const source = readProjectFile(file)
      expect(source, `${file} keeps a dead outline-none`).not.toContain('outline-none')
      expect(source, `${file} draws a ring on top of the outline`).not.toContain('focus-visible:ring-')
    }
  })
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/interactionStates.test.ts
```

Очікування: FAIL — блок за новим опенером не знайдено, і `ThemeToggle` містить `outline-none`.

- [x] **Step 3: Розширити селектор**

У `app/assets/css/tailwind.css` замінити рядки 107-110:

```css
a:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

на:

```css
/* Unlayered on purpose: Tailwind utilities live in @layer utilities, so this
   outranks any local outline-none and no component can suppress focus. */
:is(a, button, [role="button"], input[type="range"], summary):focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

- [x] **Step 4: Прибрати ring із `ThemeToggle`**

`app/components/ThemeToggle.vue:9` — з `class` видалити чотири класи: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`. Результат:

```vue
    class="flex items-center justify-center transition-[background-color] ease-in-out duration-300 hover:bg-white/30 size-9 rounded-md"
```

- [x] **Step 5: Прибрати мертвий `outline-none` у `Header`**

`app/components/Header.vue:129` — видалити ` outline-none` з рядка класів (лишається `… hover:bg-black/10 dark:hover:bg-white/10 data-[highlighted]:bg-black/10 …`).
`app/components/Header.vue:138` — так само видалити ` outline-none`.

- [x] **Step 6: Оновити e2e-перевірку фокуса на перемикачі теми**

У `tests/e2e/homepage-theme.spec.ts` замінити рядок 185:

```ts
  await expect(themeToggle).toHaveClass(/focus-visible:ring-2/)
```

на:

```ts
  // Focus styling now comes from the unlayered global rule, not per-component classes.
  await expect(themeToggle).not.toHaveClass(/focus-visible:ring-/)
```

Не перевіряти тут `getComputedStyle(...).outlineStyle`: тест фокусує кнопку через `.focus()` після кліків мишею, тож Chromium не гарантує збіг `:focus-visible`, і перевірка була б нестабільною. Видимість обведення тримає юніт-тест на нешарове правило зі Step 1.

- [x] **Step 7: Прогнати тести**

```bash
npx vitest run tests/unit/interactionStates.test.ts tests/unit/landmarks.test.ts tests/unit/authPages.test.ts
```

Очікування: PASS усі три.

- [x] **Step 8: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add app/assets/css/tailwind.css app/components/ThemeToggle.vue app/components/Header.vue \
        tests/unit/interactionStates.test.ts tests/e2e/homepage-theme.spec.ts
git diff --cached --name-only
git commit -m "feat(a11y): extend the focus rule to buttons, ranges and summaries"
```

Очікування: в індексі рівно п'ять файлів.

- [x] **Step 9: Візуальна перевірка повзунків (руками, не тестом)**

Тест цього не покриває: `.player-range` (`tailwind.css:217-258`) перевизначає `appearance` і власного `:focus-visible` не має, тож дефолтне обведення обгорне весь трек повзунка.

```bash
npm run dev -- --port 3100
```

Відкрити `http://localhost:3100/releases/`, `Tab`-ом дійти до повзунка гучності в нижньому плеєрі, перевірити вигляд обведення у **світлій і темній** темі (перемикач у хедері). Зупинити **тільки цей** сервер (Ctrl+C у його вікні). Якщо обведення виглядає прийнятно — далі за планом; якщо ні — зафіксувати спостереження і винести окремим питанням, **не** вигадуючи стилі на місці.

---

## Задача 5. Доступні імена: `OpenImage`, `Tabs`, стрілки свайпера

**Files:**
- Modify: `app/components/OpenImage.vue:12-13,59-82`
- Modify: `app/components/Tabs.vue:25-33`
- Modify: `app/components/Swiper.vue:78-84,167-175`
- Test: `tests/unit/accessibleNames.test.ts` (create)

**Контекст:** три P0/P1 з аудиту в одній задачі, бо всі три — «елемент без імені або без ролі».

- **T3 `OpenImage`:** прев'ю — це `<div @click>` (рядок 62), тобто з клавіатури повноекранне зображення не відкрити взагалі. Всередині кнопки **не можна** лишати `<div>` — контентна модель `<button>` забороняє блокові нащадки; обидва внутрішні `div` стають `<span class="block …">`. Логіку `if (props.image_xl)` з `open()` переносимо в `:disabled`. Після цього `isOpen`/`open` не потрібні — стан веде `DialogRoot` через `DialogTrigger`. `openImage.test.ts` тримається за `thumb(props.image_th)`, `v-if="previewImage"` і `:src="previewImage"` — усе зберігається.
- **T4 `Tabs`:** при п'яти й більше табах (`hideTitles`) підпис ховається і тригер лишається чистою іконкою без імені; на `release/[id].vue` табів рівно п'ять — дефект живий у продакшені.
- **T10 `Swiper`:** кнопки стрілок без `type` і без імені. Заодно свайпер отримує `<section :aria-label="title">` — за рішенням 3 спеки заголовок **лишається `<div>`** (підвищення до `<h2>` дало б `h2` перед `<h1>` сторінки).

- [x] **Step 1: Написати падаючий тест**

Create `tests/unit/accessibleNames.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('OpenImage trigger', () => {
  const source = () => readProjectFile('app/components/OpenImage.vue')

  it('opens the dialog from a real button', () => {
    expect(source()).toContain('<DialogTrigger as-child>')
    expect(source()).toContain('<button')
    expect(source()).toContain(':aria-label="`Open full-size image: ${alt || \'image\'}`"')
  })

  it('disables the trigger instead of guarding the click handler', () => {
    expect(source()).toContain(':disabled="!image_xl"')
    expect(source(), 'DialogRoot owns the open state now').not.toContain('const isOpen = ref(false)')
    expect(source()).not.toContain('@click="open"')
  })

  it('keeps only phrasing content inside the button', () => {
    const templateStart = source().indexOf('<DialogTrigger as-child>')
    const templateEnd = source().indexOf('</DialogTrigger>')
    const trigger = source().slice(templateStart, templateEnd)

    expect(trigger, 'div inside button is invalid content').not.toContain('<div')
  })

  it('still derives the preview from the thumbnail variant', () => {
    expect(source()).toContain('thumb(props.image_th)')
    expect(source()).toContain('v-if="previewImage"')
  })
})

describe('icon-only tabs', () => {
  it('names the trigger when the label is hidden', () => {
    const tabs = readProjectFile('app/components/Tabs.vue')

    expect(tabs).toContain(':aria-label="hideTitles ? plainTitle(tab.info.title) : undefined"')
  })
})

describe('swiper controls', () => {
  const source = () => readProjectFile('app/components/Swiper.vue')

  it('names the navigation buttons and types them', () => {
    expect(source()).toContain('aria-label="Previous"')
    expect(source()).toContain('aria-label="Next"')
    expect(source().match(/type="button"/g) ?? []).toHaveLength(2)
  })

  it('groups the carousel in a named region without breaking heading order', () => {
    expect(source()).toMatch(/<section\s+:aria-label="title"/)
    expect(source(), 'a swiper heading would render before the page h1').not.toContain('<h2')
  })
})
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/accessibleNames.test.ts
```

Очікування: FAIL на всіх блоках.

- [x] **Step 3: `OpenImage.vue` — тригер стає кнопкою**

У `<script setup>` видалити рядки 12-13:

```ts
const isOpen = ref(false)
const open = () => { if (props.image_xl) isOpen.value = true }
```

і прибрати `ref` з імпорту на рядку 2 (`import { computed } from 'vue'`) — `ref` більше ніде у файлі не використовується.

У шаблоні замінити рядки 60-82:

```vue
  <DialogRoot v-model:open="isOpen">

    <div
      class="cursor-pointer w-fit mr-4 mb-2 p-[5px] md:p-[10px] rounded-sm transition-[background-color] duration-200 ease-in-out hover:bg-black/10 dark:hover:bg-white/30"
      v-wave
      @click="open"
    >
      <div :class="boxClass" class="shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-black/30">
        <img
          v-if="previewImage"
          :src="previewImage"
          :alt="alt"
          class="block w-full h-auto object-contain"
          :width="imgWidth"
          loading="lazy"
        />
        <div
          v-else
          class="aspect-square flex items-center justify-center"
          v-html="comingImage"
        />
      </div>
    </div>
```

на:

```vue
  <DialogRoot>

    <DialogTrigger as-child>
      <button
        type="button"
        :disabled="!image_xl"
        :aria-label="`Open full-size image: ${alt || 'image'}`"
        class="block cursor-pointer w-fit mr-4 mb-2 p-[5px] md:p-[10px] rounded-sm transition-[background-color] duration-200 ease-in-out hover:bg-black/10 dark:hover:bg-white/30 disabled:cursor-default"
        v-wave
      >
        <span :class="boxClass" class="block shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm overflow-hidden bg-black/30">
          <img
            v-if="previewImage"
            :src="previewImage"
            :alt="alt"
            class="block w-full h-auto object-contain"
            :width="imgWidth"
            loading="lazy"
          />
          <span
            v-else
            class="aspect-square flex items-center justify-center"
            v-html="comingImage"
          />
        </span>
      </button>
    </DialogTrigger>
```

`comingImage` (рядок 24) теж містить `<div>` — замінити його на `<span class="block …">`:

```ts
const comingImage = '<span class="block p-4 text-[12px] text-muted-foreground">Image is<br>coming ⛄</span>'
```

(заодно закриває один пункт V2 — `text-white/50` тут був третім текстовим рівнем.)

- [x] **Step 4: `Tabs.vue` — ім'я для іконкового тригера**

У `app/components/Tabs.vue` на `<TabsTrigger>` (рядок 25) додати атрибут одразу після `:value="tab.id"`:

```vue
                :aria-label="hideTitles ? plainTitle(tab.info.title) : undefined"
```

- [x] **Step 5: `Swiper.vue` — секція і назви стрілок**

Рядок 78-80 — корінь стає `<section>`:

```vue
  <section
    :aria-label="title"
    :class="['relative overflow-hidden h-[174px] md:h-[284px] lg:h-[292px] ', 'swiper-' + category]"
  >
```

(дублікат `class="overflow-hidden"` на рядку 78 прибирається — той самий клас уже є в масиві.) Закривний `</div>` на рядку 179 → `</section>`.

Рядки 167-175 — кнопки:

```vue
        <button
          type="button"
          aria-label="Next"
          class="swiper-button-next"
          v-wave
        />

        <button
          type="button"
          aria-label="Previous"
          class="swiper-button-prev"
          v-wave
        />
```

- [x] **Step 6: Прогнати тести**

```bash
npx vitest run tests/unit/accessibleNames.test.ts tests/unit/openImage.test.ts tests/unit/tabs.test.ts
```

Очікування: PASS усі три.

- [x] **Step 7: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add app/components/OpenImage.vue app/components/Tabs.vue app/components/Swiper.vue \
        tests/unit/accessibleNames.test.ts
git diff --cached --name-only
git commit -m "feat(a11y): give the image trigger, icon tabs and swiper arrows accessible names"
```

---

## Задача 6. Live-region для зміни треку

**Files:**
- Modify: `app/components/player/GlobalPlayer.vue:113,116`
- Test: `tests/unit/audioBottomPlayer.test.ts` (доповнити)

**Контекст і пастка:** вміст плеєра має `:aria-hidden="!revealed" :inert="!revealed"` (рядки 121-122), а `revealed` вмикається лише після `load` **і** шестисекундної фрактальної інтро (рядки 105-112). Live-region усередині цієї обгортки мовчатиме, якщо відтворення почалося раніше. Тому регіон іде на **зовнішній** `sticky bottom-0` div (рядок 116), поза вузлом із `aria-hidden`.

Порожній `current` дає порожній рядок, а не « - »: інакше при кожному завантаженні сторінки зчитувач озвучував би роздільник.

- [x] **Step 1: Дописати падаючий тест**

У `tests/unit/audioBottomPlayer.test.ts` додати в кінець `describe('GlobalPlayer.vue', …)`:

```ts
  it('announces track changes outside the aria-hidden wrapper', () => {
    const liveIndex = component.indexOf('aria-live="polite"')
    const hiddenIndex = component.indexOf(':aria-hidden="!revealed"')

    expect(liveIndex).toBeGreaterThan(-1)
    expect(liveIndex, 'a live region inside the hidden wrapper stays silent').toBeLessThan(hiddenIndex)
    expect(component).toContain('aria-atomic="true"')
    expect(component).toContain('{{ nowPlayingLabel }}')
  })

  it('keeps the announcement empty while nothing plays', () => {
    expect(component).toContain("if (!c) return ''")
  })
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/audioBottomPlayer.test.ts
```

Очікування: FAIL на двох нових.

- [x] **Step 3: Додати computed**

У `app/components/player/GlobalPlayer.vue` після `nameSegments` (після рядка 73) додати:

```ts
const nowPlayingLabel = computed(() => {
  const c = current.value
  if (!c) return ''
  const { artist, name } = trackParts.value
  return name ? `${artist} - ${name}` : artist
})
```

- [x] **Step 4: Додати регіон у шаблон**

Замінити рядок 116:

```vue
  <div class="sticky bottom-0 z-[110]">
```

на:

```vue
  <div class="sticky bottom-0 z-[110]">
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ nowPlayingLabel }}</p>
```

(закривний тег на рядку 214 лишається без змін — новий `<p>` самозакривається всередині.)

- [x] **Step 5: Прогнати тести**

```bash
npx vitest run tests/unit/audioBottomPlayer.test.ts tests/unit/useAudioPlayer.test.ts
```

Очікування: PASS обидва.

- [x] **Step 6: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add app/components/player/GlobalPlayer.vue tests/unit/audioBottomPlayer.test.ts
git diff --cached --name-only
git commit -m "feat(a11y): announce the current track in a live region"
```

---

## Задача 7. Два текстові рівні в каталозі (V2)

**Files:**
- Modify: `app/pages/release/[id].vue:115-141`, `track/[id].vue:134-141`, `artist/[id].vue:140-157`, `event/[id].vue:117-135`, `video/[id].vue:65,80`, `playlist/[id].vue:89`, `tracks.vue:103`, `news.vue:98,102`
- Modify: `app/components/EntityLinks.vue:47`, `app/components/Swiper.vue:141,188,191`
- Modify: `app/components/ui/button/index.ts:20`
- Test: `tests/unit/interactionStates.test.ts:183-234` (розширити список файлів)

**Контекст:** AGENTS.md фіксує два семантичні рівні тексту й прямо каже, що `/40` і `/50` не проходять WCAG AA у світлій темі. Правило вже захищене тестом — але тільки для auth і profile, тому рівень і повернувся в каталог.

**Чого не чіпати:**
- `app/pages/ui.vue` — внутрішній UI-kit, поза публічним скоупом (9 входжень).
- `text-foreground/60` і `/70` — проходять поріг аудиту 2026-07-25 і лишаються.

**Явне рішення по `ui/button/index.ts:20`:** це варіант `soft`, на якому побудований `<LikeButton>` малого розміру, тобто зміна видно на **кожній картці каталогу**. Замінюємо `text-foreground/40` → `text-muted-foreground` (з 40% до 62% альфи — контрастніше, не тьмяніше), `hover:border-foreground/40` лишається як бордюр, не текст.

**У візуальний чек-лист:** `Swiper.vue:141` — розділювач секцій артистів іде з `/25` на 62%; його `bg-current` лінії потемнішають разом із текстом. Перевірити разом із повзунком із задачі 4.

- [x] **Step 1: Розширити тест на каталог**

У `tests/unit/interactionStates.test.ts` додати новий `describe` після блоку `profile surface` (після рядка 234):

```ts
describe('catalog surface', () => {
  const CATALOG_FILES = [
    'app/pages/release/[id].vue',
    'app/pages/track/[id].vue',
    'app/pages/artist/[id].vue',
    'app/pages/event/[id].vue',
    'app/pages/video/[id].vue',
    'app/pages/playlist/[id].vue',
    'app/pages/tracks.vue',
    'app/pages/news.vue',
    'app/components/EntityLinks.vue',
    'app/components/Swiper.vue',
    'app/components/ui/button/index.ts',
  ]

  it('uses only the two semantic text tiers', () => {
    for (const file of CATALOG_FILES) {
      expect(readProjectFile(file), `${file} keeps a sub-AA text tier`)
        .not.toMatch(/text-foreground\/(?:25|30|35|40|45|50)\b/)
    }
  })
})
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/interactionStates.test.ts
```

Очікування: FAIL з переліком файлів, які ще мають тьмяний рівень.

- [x] **Step 3: Замінити рівні пакетно**

```bash
cd /Users/ihororlovskyi/work/github/ihororlovskyi/sentimony-nuxt
for f in "app/pages/release/[id].vue" "app/pages/track/[id].vue" "app/pages/artist/[id].vue" \
         "app/pages/event/[id].vue" "app/pages/video/[id].vue" "app/pages/playlist/[id].vue" \
         "app/pages/tracks.vue" "app/pages/news.vue" "app/components/EntityLinks.vue" \
         "app/components/Swiper.vue" "app/components/ui/button/index.ts"; do
  perl -pi -e 's/text-foreground\/(?:25|40|50)\b/text-muted-foreground/g' "$f"
done
git diff --stat
```

`perl -pi -e` замість `sed -i` — на macOS BSD `sed` вимагає аргумент до `-i` і мовчки створює бекапи.

- [x] **Step 4: Перевірити, що `hover:` не постраждав**

```bash
grep -rn "hover:text-foreground/\|group-hover:text-foreground/" app/pages/news.vue app/components/Swiper.vue
```

Очікування: `news.vue:102` зберігає `group-hover:text-foreground/70`, `Swiper.vue:191` — `hover:text-foreground/80`. Регекс має `\b` і не чіпає `/70`, `/80`; префікси `hover:`/`group-hover:` теж мали б лишитись, бо мінялася тільки частина `text-foreground/NN`. Якщо десь вийшло `hover:text-muted-foreground` — це коректно (був `/40` чи `/50`), але звірити візуально в diff.

- [x] **Step 5: Прогнати тести**

```bash
npx vitest run tests/unit/interactionStates.test.ts tests/unit/likeButtons.test.ts
```

Очікування: PASS обидва. `likeButtons.test.ts` не згадує `text-foreground/40` (перевірено грепом), тож зміна варіанта `soft` його не зачіпає — прогін тут як регресійна страховка, бо `<LikeButton>` побудований саме на цьому варіанті.

- [x] **Step 6: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add "app/pages/release/[id].vue" "app/pages/track/[id].vue" "app/pages/artist/[id].vue" \
        "app/pages/event/[id].vue" "app/pages/video/[id].vue" "app/pages/playlist/[id].vue" \
        app/pages/tracks.vue app/pages/news.vue \
        app/components/EntityLinks.vue app/components/Swiper.vue app/components/ui/button/index.ts \
        tests/unit/interactionStates.test.ts
git diff --cached --name-only
git commit -m "feat(a11y): keep catalog metadata on the two semantic text tiers"
```

---

## Задача 8. `CollectionStatus`: порожній і помилковий стан списків (V3)

**Files:**
- Create: `app/components/CollectionStatus.vue`
- Delete: `app/components/ProfileCollectionStatus.vue`
- Modify: `app/components/ProfileCollectionPage.vue:38-47`, `app/pages/profile/tracks.vue:45`
- Modify: `app/pages/releases/index.vue`, `videos.vue`, `events.vue`, `playlists.vue`, `friends.vue`, `news.vue`, `artists/index.vue`, `app/components/ReleasesFiltered.vue`
- Modify: `tests/unit/profileCollectionStatus.test.ts`, `tests/unit/interactionStates.test.ts:186`
- Test: `tests/unit/collectionStatus.test.ts` (create)

**Interfaces:**
- Produces: `<CollectionStatus>` з пропсами `loading: boolean`, `loaded: boolean`, `hasMore?: boolean`, `remaining?: number`, `empty?: boolean`, `error?: boolean`, `emptyText?: string`; емітить `loadMore` і `retry`.
- Consumes: нічого з попередніх задач — може їхати окремим PR.

**Контекст:** це **єдина поведінкова зміна** плану; решта — семантика й стилі. `ProfileCollectionStatus` уже вміє три стани (error з `role="alert"` і кнопкою повтору, loading, empty) — узагальнюємо його, а не пишемо новий. Компонент використовується у 10+ місцях, тож правило «no new abstractions unless used in 2+ places» виконано.

Композабли віддають повний результат `useAsyncData` (перевірено на `useReleases` — `app/composables/useReleases.ts` повертає його напряму), тож `status` і `error` доступні без змін API. Прив'язка на сторінках списку: `loading = status === 'pending'`, `loaded = status === 'success'`, `error = !!error`, `empty = loaded && list.length === 0`, `@retry="refresh()"`. `hasMore`/`remaining` для них не потрібні — пагінації немає, тому пропси опційні.

`emptyText` потрібен, бо «Nothing saved here yet» — профільна копія; для `/releases/ungrouped` порожній результат штатний і має свій рядок.

- [x] **Step 1: Написати падаючий тест**

Create `tests/unit/collectionStatus.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string) =>
  readFileSync(fileURLToPath(new URL(`../../${path}`, import.meta.url)), 'utf8')

describe('CollectionStatus', () => {
  const source = () => readProjectFile('app/components/CollectionStatus.vue')

  it('keeps retry ahead of loading so a failure is not masked', () => {
    expect(source().indexOf('v-if="error"')).toBeLessThan(
      source().indexOf('v-else-if="loading && !loaded"'),
    )
    expect(source()).toContain('role="alert"')
  })

  it('keeps both actions mounted while they load', () => {
    expect(source()).toContain("{{ loading ? 'Retrying…' : 'Try again' }}")
    expect(source()).toContain("{{ loading ? 'Loading…' : `Show more · ${remaining} left` }}")
    expect(source().match(/:disabled="loading"/g)).toHaveLength(2)
  })

  it('takes an overridable empty message and optional pagination props', () => {
    expect(source()).toContain('emptyText?: string')
    expect(source()).toContain('hasMore?: boolean')
    expect(source()).toContain('remaining?: number')
    expect(source()).toContain("emptyText: 'Nothing saved here yet'")
  })
})

describe('list pages report their state', () => {
  const LIST_FILES = [
    'app/pages/releases/index.vue',
    'app/pages/videos.vue',
    'app/pages/events.vue',
    'app/pages/playlists.vue',
    'app/pages/friends.vue',
    'app/pages/news.vue',
    'app/pages/artists/index.vue',
    'app/components/ReleasesFiltered.vue',
  ]

  it('mounts the shared status on every list surface', () => {
    for (const file of LIST_FILES) {
      const source = readProjectFile(file)
      expect(source, `${file} renders no empty or error state`).toContain('<CollectionStatus')
      expect(source, `${file} never reads the request status`).toContain("status === 'pending'")
      expect(source, `${file} offers no retry`).toContain('@retry="refresh()"')
    }
  })

  it('gives the genre filter its own empty line', () => {
    expect(readProjectFile('app/components/ReleasesFiltered.vue'))
      .toContain('empty-text="No releases in this genre yet"')
  })

  it('leaves no reference to the profile-only component name', () => {
    for (const file of [...LIST_FILES, 'app/components/ProfileCollectionPage.vue', 'app/pages/profile/tracks.vue']) {
      expect(readProjectFile(file)).not.toContain('ProfileCollectionStatus')
    }
  })
})
```

- [x] **Step 2: Прогнати — має впасти**

```bash
npx vitest run tests/unit/collectionStatus.test.ts
```

Очікування: FAIL — `app/components/CollectionStatus.vue` не існує (`ENOENT`).

- [x] **Step 3: Створити `CollectionStatus.vue`**

Create `app/components/CollectionStatus.vue`:

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  loading: boolean
  loaded: boolean
  hasMore?: boolean
  remaining?: number
  empty?: boolean
  error?: boolean
  emptyText?: string
}>(), {
  hasMore: false,
  remaining: 0,
  emptyText: 'Nothing saved here yet',
})

defineEmits<{
  loadMore: []
  retry: []
}>()
</script>

<template>
  <div
    v-if="error"
    role="alert"
    class="py-16 text-center"
  >
    <p class="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      Could not load this collection
    </p>
    <Button
      type="button"
      variant="default"
      :disabled="loading"
      class="mx-auto mt-6 text-[10px] uppercase tracking-widest"
      @click="$emit('retry')"
    >
      {{ loading ? 'Retrying…' : 'Try again' }}
    </Button>
  </div>

  <div v-else-if="loading && !loaded" class="flex justify-center py-10">
    <span class="animate-pulse text-[10px] uppercase tracking-widest text-muted-foreground motion-reduce:animate-none">
      Loading
    </span>
  </div>

  <p
    v-else-if="empty"
    class="py-16 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
  >
    {{ emptyText }}
  </p>

  <Button
    v-else-if="hasMore"
    type="button"
    variant="default"
    :disabled="loading"
    class="mx-auto mt-6 text-[10px] uppercase tracking-widest"
    @click="$emit('loadMore')"
  >
    {{ loading ? 'Loading…' : `Show more · ${remaining} left` }}
  </Button>
</template>
```

- [x] **Step 4: Переключити profile і видалити старий компонент**

```bash
cd /Users/ihororlovskyi/work/github/ihororlovskyi/sentimony-nuxt
perl -pi -e 's/ProfileCollectionStatus/CollectionStatus/g' \
  app/components/ProfileCollectionPage.vue app/pages/profile/tracks.vue \
  tests/unit/profileCollectionStatus.test.ts tests/unit/interactionStates.test.ts
git rm app/components/ProfileCollectionStatus.vue
```

`interactionStates.test.ts:186` мав `'app/components/ProfileCollectionStatus.vue'` у `PROFILE_FILES` — після заміни там `'app/components/CollectionStatus.vue'`, шлях валідний. `profileCollectionStatus.test.ts` після заміни читає новий файл; його три перевірки дублюють нові — це нормально, лишаємо обидва (профільний перевіряє інтеграцію зі сторінками profile).

- [x] **Step 5: Прогнати — profile має лишитись зеленим**

```bash
npx vitest run tests/unit/collectionStatus.test.ts tests/unit/profileCollectionStatus.test.ts tests/unit/interactionStates.test.ts tests/unit/profilePages.test.ts
```

Очікування: `collectionStatus.test.ts` — перший `describe` PASS, другий (`list pages`) FAIL; решта файлів PASS.

- [x] **Step 6: Підключити до простих списків**

Патерн однаковий для `releases/index.vue`, `videos.vue`, `events.vue`, `playlists.vue`. Приклад для `app/pages/releases/index.vue` — у `<script setup>` замінити рядок 4:

```ts
const { data: releasesRaw } = await useReleases()
```

на:

```ts
const { data: releasesRaw, status, error, refresh } = await useReleases()
```

і в шаблоні після закривного `</div>` сітки (рядок 38) додати:

```vue
    <CollectionStatus
      :loading="status === 'pending'"
      :loaded="status === 'success'"
      :error="!!error"
      :empty="status === 'success' && releasesSortedByDate.length === 0"
      empty-text="No releases published yet"
      @retry="refresh()"
    />
```

Для решти — те саме з відповідними іменами: `videos.vue` (`useVideos`, `videosSortedByDate`, «No videos published yet»), `events.vue` (`useEvents`, `eventsSortedByDate`, «No events announced yet»), `playlists.vue` (`usePlaylists`, `playlistsSortedByDate`, «No playlists published yet»), `friends.vue` (`useFriends`, `friendsSortedByDate`, «No friends listed yet»).

- [x] **Step 7: Підключити до складених списків**

`app/components/ReleasesFiltered.vue` — рядок 10 → `const { data: releasesRaw, status, error, refresh } = await useReleases()`; у шаблоні після сітки (рядок 33):

```vue
    <CollectionStatus
      :loading="status === 'pending'"
      :loaded="status === 'success'"
      :error="!!error"
      :empty="status === 'success' && filtered.length === 0"
      empty-text="No releases in this genre yet"
      @retry="refresh()"
    />
```

`app/pages/artists/index.vue` — чотири `<h2>`-секції при порожньому результаті лишаються заголовками без вмісту, тому статус іде **перед** ними, а самі секції ховаються. Порожнечу міряти по `artistsSortedForCatalog`, не по `artists`: `sortArtistsForCatalog()` (`app/utils/artists.ts:22`) відкидає `visible: false`, тож каталог із самими прихованими артистами інакше показав би чотири порожні секції замість стану.

Рядок 5 → `const { data: artistsRaw, status, error, refresh } = await useArtists()`.

У шаблоні одразу після `<h1>` (рядок 40) додати:

```vue
    <CollectionStatus
      :loading="status === 'pending'"
      :loaded="status === 'success'"
      :error="!!error"
      :empty="status === 'success' && artistsSortedForCatalog.length === 0"
      empty-text="No artists listed yet"
      @retry="refresh()"
    />
```

І обгорнути всі чотири пари `<h2>` + сітка (рядки 42-80) одним блоком, не чіпаючи їхній вміст:

```vue
    <template v-if="status === 'success' && artistsSortedForCatalog.length">
      <!-- чотири наявні пари <h2> + <div class="flex flex-wrap …"> без змін -->
    </template>
```

`artistsPage.test.ts` тримається за порядок `v-for="i in artistsSortedByCategoryId…"` і рядок `sortArtistsForCatalog(artists.value)` — обгортка їх не рухає.

Кнопки `All Releases` / `All Artists` (рядки 82-85) лишаються **поза** цим `v-if` — вони працюють і при порожньому каталозі.

`app/pages/news.vue` — три джерела (`useReleases`, `useEvents`, `useVideos`). Деструктуризувати всі три з аліасами й звести:

```ts
const { data: releasesRaw, status: releasesStatus, error: releasesError, refresh: refreshReleases } = await useReleases()
const { data: eventsRaw, status: eventsStatus, error: eventsError, refresh: refreshEvents } = await useEvents()
const { data: videosRaw, status: videosStatus, error: videosError, refresh: refreshVideos } = await useVideos()

const status = computed(() => {
  const all = [releasesStatus.value, eventsStatus.value, videosStatus.value]
  if (all.includes('pending')) return 'pending'
  if (all.includes('error')) return 'error'
  if (all.every(s => s === 'success')) return 'success'
  return 'idle'
})
const error = computed(() => releasesError.value || eventsError.value || videosError.value)
const refresh = () => Promise.all([refreshReleases(), refreshEvents(), refreshVideos()])
```

і в шаблоні після закривного `</div>` списку `divide-y` (`news.vue:106`), перед `</div>` контейнера — рядки нижче дослівно, бо `collectionStatus.test.ts` шукає `status === 'pending'` і `@retry="refresh()"` як текст:

```vue
    <CollectionStatus
      :loading="status === 'pending'"
      :loaded="status === 'success'"
      :error="!!error"
      :empty="status === 'success' && newsItems.length === 0"
      empty-text="Nothing published yet"
      @retry="refresh()"
    />
```

Сторінки списків роблять `await useXxx()`, тож на SSR `status` уже `success` і гілка `loading` видима лише при клієнтській навігації — це очікувано, не «відсутній стан на першому рендері».

- [x] **Step 8: Прогнати всі релевантні тести**

```bash
npx vitest run tests/unit/collectionStatus.test.ts tests/unit/profileCollectionStatus.test.ts tests/unit/releasesApi.test.ts tests/unit/artistsPage.test.ts
```

Очікування: PASS усі чотири.

- [x] **Step 9: Повна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add app/components/CollectionStatus.vue \
        app/components/ProfileCollectionPage.vue app/components/ReleasesFiltered.vue \
        app/pages/profile/tracks.vue app/pages/releases/index.vue app/pages/videos.vue \
        app/pages/events.vue app/pages/playlists.vue app/pages/friends.vue \
        app/pages/news.vue app/pages/artists/index.vue \
        tests/unit/collectionStatus.test.ts tests/unit/profileCollectionStatus.test.ts \
        tests/unit/interactionStates.test.ts
git diff --cached --name-only
git commit -m "feat(a11y): design empty and error states for every list surface"
```

Очікування: в індексі 14 шляхів із `git add` плюс рядок `D app/components/ProfileCollectionStatus.vue`.

`ProfileCollectionStatus.vue` **не** перелічувати в `git add`: після `git rm` шляху немає ні в дереві, ні в робочій копії, і `git add` впаде з `fatal: pathspec … did not match any files`, обірвавши всю команду. Видалення вже застейджене самим `git rm` — воно має з'явитися в `git diff --cached --name-only` як `D`.

---

## Задача 9. E2E-перевірка, AGENTS.md і закриття ініціативи

**Files:**
- Modify: `AGENTS.md:150` (абзац «Text tiers and focus states») + новий абзац про лендмарки, `Last reviewed`
- Modify: `docs/initiatives/accessibility-structure.md` (`Status:`)
- Modify: `docs/roadmap.md` (статус рядка)
- Modify: `docs/completed.md` (новий запис)

**Контекст:** Playwright не в CI, тому e2e ганяються руками. Очікування, яке треба підтвердити: снапшоти `homepage-theme.spec.ts` **не зсуваються**, бо скіп-лінка `sr-only` до фокуса, а класи `Hero` не змінювались (preflight скидає стилі `h1`); перевірка фокуса на перемикачі теми вже переписана в задачі 4. `layout-loading.spec.ts` тримається за `data-testid`, який зберігся при заміні `div` → `header`/`footer`.

`AGENTS.md` зараз не згадує ні лендмарків, ні скіп-лінки, а абзац на рядку 150 описує старий стан («кнопки — через утиліти `focus-visible:outline-*`, auth-лінки й кнопка пароля — окреме правило в `tailwind.css`»). Після задачі 4 це неправда, а інваріант «правило має лишатися поза `@layer`» — саме той тип пастки, для якого AGENTS.md існує.

- [x] **Step 1: Прогнати e2e**

```bash
npm run test:e2e
```

Очікування: PASS. Якщо снапшот усе ж зсунувся — **не оновлювати наосліп**: подивитися diff, і лише переконавшись, що зміна очікувана, зробити `npm run test:e2e:update`.

- [x] **Step 2: Перевірити скіп-лінку живцем і зняти Lighthouse Accessibility**

```bash
npm run dev -- --port 3100
```

На `http://localhost:3100/`: натиснути `Tab` одразу після завантаження — першим має з'явитися видиме «Skip to content» у верхньому лівому куті; `Enter` має перенести фокус на контент **під** липким хедером (не під нього). Це повтор перевірки із задачі 2 — регресія після решти правок.

Критерій завершення ініціативи — «Lighthouse Accessibility 100», а `npm run perf:lighthouse` збирає тільки `performance` (`scripts/lighthouse-baseline.mjs:45`), тож категорію доступності знімаємо окремо. **Не** на dev-сервері: `nuxt dev` домальовує Nuxt DevTools, чиї вузли Lighthouse може позначити й дати хибний результат нижче 100. Зупинити dev, зібрати й підняти preview на тому ж порту:

```bash
npm run build && PORT=3100 npm run preview
```

```bash
for p in / /releases/ /release/va-fantazma/ /artists/; do
  npx lighthouse@12 "http://localhost:3100$p" --only-categories=accessibility \
    --chrome-flags="--headless=new" --quiet --output=json --output-path=stdout \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);console.log(r.finalDisplayedUrl, r.categories.accessibility.score*100, r.audits ? Object.values(r.audits).filter(a=>a.score===0).map(a=>a.id).join(",") : "")})'
done
```

(`va-fantazma` — перший видимий реліз в експорті; підійде будь-який наявний slug.) Очікування: `100` на кожній адресі. Якщо менше — у виводі перелік аудитів зі `score 0`; зафіксувати їх у PR-описі й **не** латати наосліп поза скоупом плану. Зупинити **тільки цей** сервер.

- [x] **Step 3: Оновити AGENTS.md**

У `AGENTS.md` рядок 150, у реченні «Focus-стан кнопок та інпутів використовує `outline` (…); auth-лінки й кнопка видимості пароля отримують еквівалентне правило в `tailwind.css`.» замінити другу частину на опис нового стану:

```markdown
Focus-стан усіх інтерактивних елементів (`a`, `button`, `[role="button"]`, `input[type="range"]`, `summary`) задає **одне нешарове** правило `:is(…):focus-visible` у `tailwind.css`: воно поза `@layer`, тому перебиває будь-який локальний `outline-none` чи `focus-visible:ring-*` незалежно від специфічності — **не** загортати його в `@layer` і не додавати компонентам власні focus-класи (буде подвійна індикація).
```

Решту абзацу (про `outline-none`, `ring-*` на інпуті, `--card`) лишити. Далі додати новий абзац одразу після нього:

```markdown
**Landmarks.** `<main id="main" tabindex="-1">` живе в `app/layouts/default.vue` навколо `<slot/>` — сторінки **не** додають власний `<main>` (виняток — `app/error.vue`, який рендериться поза `NuxtLayout` і має свій `<main>` + `<h1>`). Скіп-лінка — перший вузол шаблону layout, ціль `#main`; `scroll-padding-top/bottom: 5rem` у `html` компенсує липкий хедер і нижній плеєр. Три `<nav>` мають імена `Main` (Header), `Footer`, `Mobile` (шухляда); свайпери — `<section :aria-label="title">` без власного `<h2>`, бо рендеряться до `<h1>` сторінки. Списки показують loading/empty/error через `<CollectionStatus>` (колишній `ProfileCollectionStatus`). Guarded by `tests/unit/landmarks.test.ts`, `accessibleNames.test.ts`, `collectionStatus.test.ts`.
```

І оновити `- Last reviewed:` на дату виконання. Файл має лишитися під ~250 рядків — перевірити `wc -l AGENTS.md`.

- [x] **Step 4: Оновити статус ініціативи**

У `docs/initiatives/accessibility-structure.md` змінити `- Status: Planned` на `- Status: Implemented` і `Last reviewed` на дату виконання.

- [x] **Step 5: Оновити roadmap і completed**

У `docs/roadmap.md` знайти рядок ініціативи (секція `## P1`) і змінити статус на `Implemented`.

У `docs/completed.md`, у кінець списку `## Документовані реалізації`, додати запис у наявному форматі (маркер, посилання в дужках, опис із малої літери):

```markdown
- [Accessibility baseline](specs/2026-09-01-accessibility-baseline-design.md) за
  [аудитом 2026-09-01](audits/2026-09-01-frontend-crafting-audit.md): лендмарки й
  скіп-лінка, видимий фокус на кнопках і повзунках, доступні імена для
  іконкових табів і стрілок свайпера, два текстові рівні в каталозі та
  спроєктовані порожній і помилковий стани списків.
```

Шляхи відносні до `docs/`, як і решта посилань у файлі; нові документи лежать у `docs/specs/` і `docs/audits/`, не в `docs/superpowers/`.

- [x] **Step 6: Перевірити структуру docs**

```bash
npm run docs:check
```

Очікування: `docs-check: ok (…)`. Скрипт звіряє `Priority:`/`Status:` у файлі ініціативи з рядком roadmap — розбіжність упаде саме тут.

- [x] **Step 7: Фінальна перевірка й коміт**

```bash
npm run test:unit && npm run typecheck && npm run docs:check
git add AGENTS.md docs/initiatives/accessibility-structure.md docs/roadmap.md docs/completed.md \
        docs/plans/2026-09-01-accessibility-baseline.md
git diff --cached --name-only
git commit -m "docs: mark the accessibility baseline initiative implemented"
```

Файл плану теж іде в цей коміт: якщо виконавець відмічав кроки як `- [x]`, ці зміни інакше лишаться незакоміченими і зіпсують перевірку в наступному кроці.

- [x] **Step 8: Переконатися, що чуже не поїхало**

```bash
git status --short
```

Очікування: у виводі лишилися **тільки** `M package.json`, `M package-lock.json`, `M scripts/skills.sh` — незв'язані зміни, які були тут до початку роботи.

---

## Що лишилось поза планом

Свідомо не входить (з причинами — у розділі «Скоуп» спеки):

- **CTA на головній** (друга половина V1) — продуктове рішення, окрема ініціатива.
- **V4** (метадані на картці каталогу) — потребує візуальної перевірки сітки й свайпера.
- **V5** (розмір і роль розділювачів свайпера) — з нього взято лише колір, у складі задачі 7.
- **T7** (контраст футера) — спершу реальний замір, потім рішення.
- **T8** (токени кольорів), **T11** (`height` прев'ю) — не доступність.
- **`app/layouts/empty.vue`** — мертвий файл (нуль сторінок із `layout: 'empty'`); видаляти чи ні — окреме рішення.
- **`app/pages/ui.vue`** — внутрішній UI-kit, `text-foreground/50` там лишається (текстовий рівень у ньому знімається в задачі 7 лише там, де файл і так у списку).
- **`app/pages/tracks.vue` у складі V3** — попри те, що аудит згадує його серед прочитаних, це не сторінка одного списку, а зведення з **семи** джерел (`useReleases`, `useFetch('/api/tracks')`, `useArtists`, `useVideos`, `usePlaylists`, `useEvents`, `useFriends`) зі статистикою. Один `CollectionStatus` не описує його стан коректно, а сім — це вже інша задача. Текстовий рівень (V2) у ньому виправляється, стани списку — ні.
- **`<h1>` «Sentimony Records» замість «Sentimony»** — після задачі 3 ім'я заголовка головної обривається на `heroTitle`. Повна версія: `<h1>` на зовнішній обгортці (`uppercase mb-[0.2em] text-[40px] …`), внутрішні `div` → `span class="block"` / `span class="tracking-normal flex …"`, бо `h1` приймає лише phrasing content. Візуально нічого не рухається, але це змінює рішення спеки («навколо наявного `heroTitle`») — окремим комітом після візуальної звірки снапшота.
- **`button.password-toggle:focus-visible` у `tailwind.css`** — після задачі 4 дублює глобальне правило (`button` тепер у селекторі). Прибрати разом із перевіркою в `interactionStates.test.ts` і згадкою в AGENTS.md — окремою дрібною правкою, щоб не змішувати з розширенням селектора.

Три пункти перевіряються оком, а не тестом: скіп-лінка після фокуса (задача 2, крок 6), вигляд дефолтного обведення на `.player-range` (задача 4, крок 9) і потемніння розділювачів свайпера після переходу з `/25` на `text-muted-foreground` (задача 7).
