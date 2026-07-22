# Mobile Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Підняти Lighthouse mobile Performance з 68 до ≥80 через lazy hydration нижньофолдних блоків, обмеження початкового DOM Swiper-а, passive/прибрані ripple-listeners і збільшені tap targets футера.

**Architecture:** Вимірювально-кероване виконання: baseline (`nuxi analyze` + Lighthouse) → чотири незалежні оптимізації, кожна з власною верифікацією → контрольний замір. Кожна оптимізація відкочується окремо, якщо не дає зсуву.

**Tech Stack:** Nuxt 4 lazy hydration (`hydrate-on-visible`), Swiper 14, v-wave, Lighthouse CI (вручну), `npx nuxi analyze`.

**Spec:** `docs/superpowers/specs/2026-07-19-mobile-performance-design.md`

## Global Constraints

- Гілка `json-to-yml`, без git worktrees; нових npm-залежностей не додавати.
- Кожна оптимізація — окремий коміт із зафіксованим у повідомленні вимірюванням.
- Базлайн тестів: `npm run test:unit` зелений до і після кожної таски; `npx nuxi typecheck` без помилок.
- Візуальна перевірка головної/списків після кожної зміни (web-debug + очі).

---

### Task 1: Baseline вимірювання

**Files:** — (лише артефакти вимірювань, у git не комітяться)

- [ ] **Step 1: Bundle baseline**

Run: `npx nuxi analyze`
Записати: розмір entry chunk, топ-5 найбільших client chunks (числа зберегти для PR-опису).

- [ ] **Step 2: Lighthouse baseline**

Run: задеплоїти поточну гілку на stage (`npm run deploy:stage`), прогріти 2–3 запитами, зняти Lighthouse mobile у чистому Chrome profile для `/`.
Записати: Performance, TBT, Speed Index, DOM size, список non-passive listeners (DevTools → Performance → Event listeners або Lighthouse audit `uses-passive-event-listeners` → якому чанку належить listener).

- [ ] **Step 3: Ідентифікувати джерело non-passive listener**

У DevTools Sources знайти код listener-а з аудиту (Lighthouse дає URL чанка і рядок). Зафіксувати: це `v-wave` (очікувано), Swiper чи інше. Результат визначає гілку Task 4.

---

### Task 2: Lazy hydration нижньофолдних блоків

**Files:**
- Modify: `app/layouts/default.vue` (рядки ~118–190: секції Swiper-ів, `Testimonials`, `Footer`)

**Interfaces:**
- Produces: усі нижньофолдні глобальні блоки гідратуються при появі у в'юпорті; перший видимий блок маршруту — без змін.

- [ ] **Step 1: Додати `hydrate-on-visible`**

У `app/layouts/default.vue`:

- для кожного `<LazySwiper …>` крім першого на маршруті (Releases — перший на `/`; на інших маршрутах порядок той самий, тому правило: Releases лишається як є, Artists/Videos/Playlists/Events отримують атрибут):

```html
      <LazySwiper hydrate-on-visible … />
```

- `<Testimonials />` → `<LazyTestimonials hydrate-on-visible />`;
- `<Footer />` → `<LazyFooter hydrate-on-visible />`.

(`AudioBottomPlayer` НЕ чіпати — глобальний стан плеєра має бути живим одразу.)

- [ ] **Step 2: Перевірити взаємодію**

Run: `npm run dev`, відкрити `/`, проскролити до кожного Swiper-а і футера.
Expected: слайдери реагують на drag/кнопки одразу після появи; тема/лінки футера працюють; у консолі немає hydration mismatch warnings.

- [ ] **Step 3: Тести + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: зелено.

- [ ] **Step 4: Commit**

```bash
git add app/layouts/default.vue
git commit -m "perf(layout): hydrate below-the-fold sections on visibility"
```

---

### Task 3: Обмежити початковий DOM Swiper-а

**Files:**
- Modify: `app/components/Swiper.vue` (цикл `v-for i in list`, рядки ~134–164)

**Interfaces:**
- Produces: Swiper рендерить перші 12 слайдів одразу, решту — після `requestIdleCallback` (фолбек `setTimeout 200ms`). Проп `list` і зовнішній контракт компонента незмінні.

- [ ] **Step 1: Додати відкладений дорендер**

У `<script setup>` `app/components/Swiper.vue` додати:

```ts
const INITIAL_SLIDES = 12
const renderAll = ref(false)

onMounted(() => {
  const reveal = () => { renderAll.value = true }
  if ('requestIdleCallback' in window) requestIdleCallback(reveal, { timeout: 1000 })
  else setTimeout(reveal, 200)
})

const visibleList = computed(() =>
  renderAll.value ? props.list : props.list.slice(0, INITIAL_SLIDES)
)
```

і замінити в шаблоні джерело циклу `list` → `visibleList` (обидва місця: звичайний цикл та секційний цикл артистів; для секційного — обрізати вже сплющений масив, зберігши розділювачі логіки секцій як є, якщо секції будуються з `visibleList`).

Якщо секційний цикл артистів будується не з плоского `list`, а з похідної структури — застосувати `visibleList` як вхід цієї похідної (обрізання до похідної, не після).

- [ ] **Step 2: Перевірити поведінку**

Run: dev, відкрити `/`: одразу після завантаження порахувати слайди в DOM (DevTools `$$('.swiper-slide').length`) — очікувано ≤ 12 на Swiper до idle; за ~1с — повний список; drag до кінця списку працює.

- [ ] **Step 3: Тести + typecheck + commit**

Run: `npm run test:unit && npx nuxi typecheck` → зелено.

```bash
git add app/components/Swiper.vue
git commit -m "perf(swiper): render first 12 slides eagerly, rest after idle"
```

---

### Task 4: Non-passive listeners

**Files:**
- Modify: `nuxt.config.ts` (конфіг `vWave`) — гілка A; або точкове виправлення знайденого джерела — гілка B.

- [ ] **Step 1: Виконати гілку за результатом Task 1 Step 3**

**Гілка A (джерело — v-wave, очікувано):** зняти директиву `v-wave` з елементів, що беруть участь у скролі списків (слайди `Item.vue` всередині Swiper — прибрати `v-wave` з кореневого `NuxtLink` в `app/components/Item.vue`; кнопки/меню поза скрол-контейнерами лишити). Ripple на картках дублюється hover/active-станами, втрати UX немає.

**Гілка B (джерело — інше):** виправити за фактом (наприклад, опція `passive` у власному listener-і; для стороннього коду — обмежити місце використання). Рішення і диф зафіксувати в коміт-повідомленні.

- [ ] **Step 2: Верифікація**

Повторити Lighthouse mobile локально (DevTools Lighthouse): аудит `uses-passive-event-listeners` — score 1 / зелений.

- [ ] **Step 3: Тести + commit**

Run: `npm run test:unit && npx nuxi typecheck` → зелено.

```bash
git add -A
git commit -m "perf: eliminate non-passive scroll/touch listeners (source: <зафіксувати>)"
```

---

### Task 5: Tap targets футера

**Files:**
- Modify: `app/components/Footer.vue` (соц-лінки YouTube/GitHub з аудиту)

- [ ] **Step 1: Збільшити клікабельну площу**

Для кожного соц-лінка футера додати до класів `NuxtLink`/`a`: `inline-flex items-center justify-center min-w-11 min-h-11` (44×44 px — WCAG/Lighthouse поріг). Іконку не збільшувати; за потреби компенсувати сусідні відступи (зменшити `gap`/`p` контейнера), щоб верстка не поїхала.

- [ ] **Step 2: Верифікація**

DevTools Lighthouse mobile: аудит tap targets = 100%. Візуально футер без зсувів в обох темах.

- [ ] **Step 3: Commit**

```bash
git add app/components/Footer.vue
git commit -m "fix(footer): 44px tap targets for social links"
```

---

### Task 6: Контрольний замір і фіксація

- [ ] **Step 1: Повна верифікація**

Run: `npm run test:unit && npx nuxi typecheck && node scripts/web-debug.mjs` (із запущеним dev) → усе зелено.

- [ ] **Step 2: Stage + Lighthouse**

Run: `npm run deploy:stage`, прогріти, зняти Lighthouse mobile для `/`.
Expected: Performance ≥ 80, TBT < 300 ms, tap-targets 100%. Якщо ціль не досягнута — зафіксувати фактичні числа по кожному коміту (git bisect по вимірюваннях) і визначити, який крок недопрацював; не мержити «наосліп».

- [ ] **Step 3: Оновити ROADMAP**

У `docs/roadmap/mobile-performance.md` оновити статус і фактичні числа; після повного завершення додати підсумок до `docs/roadmap/completed.md`.

```bash
git add docs/roadmap/mobile-performance.md docs/roadmap/completed.md
git commit -m "docs(roadmap): record mobile performance results"
```
