# Design System Validity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Замінити hardcoded black/white-класи семантичними токенами за конвенцією, полагодити light-тему у файлах без `dark:`-адаптації, закріпити регрес-тестом і конвенцією в AGENTS.md.

**Architecture:** Механічна конвенція мапінгу → міграція трьома кластерами за впливом (no-dark файли → Header/Sidebar states → парні дублі) → греп-тест проти регресу. Навмисні темні поверхні (Footer тощо) — явні винятки.

**Tech Stack:** Tailwind v4 tokens (`app/assets/css/tailwind.css`), Vitest (греп-тест).

**Spec:** `docs/superpowers/specs/2026-07-19-design-system-validity-design.md`

## Global Constraints

- Гілка `json-to-yml`; токени в `tailwind.css` НЕ змінюються.
- Мапінг: `X-black/N dark:X-white/N` → `X-foreground/N`; `bg-white/N dark:bg-black/N` → `bg-background/N`/`bg-card`; винятки позначаються коментарем `<!-- intentional dark surface -->`.
- Після кожного кластера — візуальна перевірка обох тем + `npm run test:unit`.
- `Footer.vue` — виняток (навмисно темний), не мігрується.

---

### Task 1: Регрес-тест конвенції (пише інвентар)

**Files:**
- Test: `tests/unit/designTokens.test.ts`

**Interfaces:**
- Produces: тест, що фейлиться на парних дублях поза списком винятків; список `INTENTIONAL_DARK` — файли-винятки. На старті тест позначає поточний стан як baseline через явний список `LEGACY_FILES` (файли, які ще не мігровані) — міграція = викреслювання з списку.

- [ ] **Step 1: Написати тест**

`tests/unit/designTokens.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import fg from 'fast-glob'

const PAIRED_RE = /(?:text|bg|border)-black\/\d+\s+dark:(?:hover:)?(?:text|bg|border)-white\/\d+|(?:text|bg|border)-white\/\d+\s+dark:(?:hover:)?(?:text|bg|border)-black\/\d+/

const INTENTIONAL_DARK = new Set([
  'app/components/Footer.vue',
])

// Files still awaiting migration; shrink this list task by task.
const LEGACY_FILES = new Set([
  'app/components/GenreTabs.vue',
  'app/components/Header.vue',
  'app/components/OpenSidebar.vue',
  'app/components/OpenImage.vue',
  'app/components/ReleasesFiltered.vue',
  'app/components/ThemeToggle.vue',
  'app/components/AudioTrackPlaylist.vue',
  'app/components/AudioBottomPlayer.vue',
  'app/components/Item.vue',
  'app/error.vue',
  'app/pages/news.vue',
  'app/pages/tracks.vue',
  'app/pages/artists/index.vue',
  'app/pages/artists/all.vue',
  'app/pages/releases/all.vue',
  'app/pages/profile/index.vue',
  'app/pages/release/[id].vue',
  'app/pages/artist/[id].vue',
  'app/pages/track/[id].vue',
  'app/pages/playlist/[id].vue',
  'app/pages/event/[id].vue',
])

describe('design tokens convention', () => {
  it('has no paired black/white duplicates outside legacy and intentional files', async () => {
    const files = await fg('app/**/*.vue', { dot: false })
    const offenders = files.filter((file) => {
      if (INTENTIONAL_DARK.has(file) || LEGACY_FILES.has(file)) return false
      return PAIRED_RE.test(readFileSync(file, 'utf-8'))
    })
    expect(offenders).toEqual([])
  })
})
```

(`fast-glob` — транзитивна залежність у node_modules; якщо імпорт недоступний — замінити на рекурсивний `readdirSync` хелпер у тесті, без нової залежності.)

Run: `npx vitest run tests/unit/designTokens.test.ts` → PASS (baseline зафіксовано списком).

- [ ] **Step 2: Commit**

```bash
git add tests/unit/designTokens.test.ts
git commit -m "test(design): token convention regression guard with legacy baseline"
```

---

### Task 2: Кластер (а) — файли без `dark:` (зламаний light)

**Files:**
- Modify: `app/components/GenreTabs.vue`, `app/components/ReleasesFiltered.vue`, `app/components/ThemeToggle.vue`, `app/error.vue`, `app/pages/news.vue`, `app/pages/tracks.vue`, `app/pages/artists/index.vue`, `app/pages/artists/all.vue`, `app/pages/releases/all.vue`
- Modify: `tests/unit/designTokens.test.ts` (викреслити мігровані з `LEGACY_FILES`)

- [ ] **Step 1: Міграція за мапінгом**

У кожному файлі замінити hardcoded класи токенними за конвенцією (типові заміни):

- `text-white/50` → `text-foreground/50`; `text-white/80` → `text-foreground/80`
- `bg-white/10` → `bg-foreground/10`; `hover:bg-white/20` → `hover:bg-foreground/15`
- `border-white/20` → `border-foreground/20`
- фіксований темний фон блока, який у light має бути світлим → `bg-card`/`bg-background` + `text-card-foreground`

Елементи поверх зображень/обкладинок (текст на фото, оверлеї) — навмисно фіксовані: позначити `<!-- intentional dark surface -->` і лишити.

- [ ] **Step 2: Візуальна перевірка**

Run: dev; кожен зачеплений екран у light і dark (перемикач теми): контраст читабельний, hover-стани видимі, нічого не «зникло». Порівняти з dark-виглядом до змін (він не повинен змінитися помітно).

- [ ] **Step 3: Тест + commit**

Викреслити мігровані файли з `LEGACY_FILES`; `npx vitest run tests/unit/designTokens.test.ts` → PASS.

```bash
git add -A
git commit -m "fix(theme): tokenize components lacking light-theme adaptation"
```

---

### Task 3: Кластер (б) — стани Header/OpenSidebar

**Files:**
- Modify: `app/components/Header.vue`, `app/components/OpenSidebar.vue`
- Modify: `tests/unit/designTokens.test.ts`

- [ ] **Step 1: Міграція**

Парні дублі (`border-black/20 dark:border-white/20` → `border-foreground/20`, `bg-white/80 dark:bg-black/80` → `bg-background/80`) і непарні hover-и (`hover:bg-white/30` без dark → `hover:bg-foreground/15`). Дропдаун/оверлеї сайдбара — ті самі правила.

- [ ] **Step 2: Верифікація**

Dev: hover по навігації видно в **обох** темах; дропдаун користувача читабельний; сайдбар відкривається без візуальних регресій. Викреслити обидва файли з `LEGACY_FILES`, тест зелений.

- [ ] **Step 3: Commit**

```bash
git add app/components/Header.vue app/components/OpenSidebar.vue tests/unit/designTokens.test.ts
git commit -m "fix(theme): tokenize header and sidebar interaction states"
```

---

### Task 4: Кластер (в) — парні дублі решти файлів

**Files:**
- Modify: `app/pages/profile/index.vue`, `app/pages/release/[id].vue`, `app/pages/artist/[id].vue`, `app/pages/track/[id].vue`, `app/pages/playlist/[id].vue`, `app/pages/event/[id].vue`, `app/components/AudioTrackPlaylist.vue`, `app/components/AudioBottomPlayer.vue`, `app/components/OpenImage.vue`, `app/components/Item.vue`
- Modify: `tests/unit/designTokens.test.ts`

- [ ] **Step 1: Міграція тим самим мапінгом**

Файл за файлом; оверлеї на обкладинках (`bg-black/50` під текстом на зображенні в `Item.vue`, `OpenImage.vue`) — intentional, позначити коментарем і лишити.

- [ ] **Step 2: Верифікація + спорожніти `LEGACY_FILES`**

Dev-прохід по detail-сторінках і плеєру в обох темах. `LEGACY_FILES` після цієї таски — порожній (усе або мігровано, або в `INTENTIONAL_DARK`).

Run: `npm run test:unit && npx nuxi typecheck` → зелено.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix(theme): tokenize remaining paired black/white duplicates"
```

---

### Task 5: Конвенція в AGENTS.md + Lighthouse + ROADMAP

**Files:**
- Modify: `AGENTS.md` (секція Styling)
- Modify: `docs/roadmap/design-system.md`

- [ ] **Step 1: AGENTS.md**

У секцію **Styling (Tailwind v4)** додати:

```markdown
Color usage: use semantic tokens (`text-foreground/N`, `bg-background`, `bg-card`, `border-foreground/N`) instead of hardcoded `white`/`black` utilities; paired `X-black/N dark:X-white/N` duplicates are forbidden (guarded by `tests/unit/designTokens.test.ts`). Intentional always-dark surfaces (e.g. `Footer.vue`, overlays on artwork) carry an `<!-- intentional dark surface -->` comment and live in the test's exception list.
```

- [ ] **Step 2: Lighthouse Accessibility**

DevTools Lighthouse (обидві теми, mobile): Accessibility залишається 100 на `/`, `/releases`, `/artists`, одній detail-сторінці, профілі.

- [ ] **Step 3: ROADMAP + commit**

Перенести P3 #12 у «Закрито» з підсумком (кількість замінених класів, файли-винятки).

```bash
git add AGENTS.md docs/roadmap/design-system.md
git commit -m "docs: token convention, close design system roadmap item"
```
