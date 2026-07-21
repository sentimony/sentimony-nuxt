# Release Artist/Title Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Рендерити виконавця та назву релізу окремими рядками, виводячи їх із наявного `release.title` (`Виконавець «Назва» [EP|Single]`) чистою утилітою, без змін API/БД/export.

**Architecture:** Чиста функція `splitReleaseTitle()` в `app/utils/releaseTitle.ts` (auto-import) → застосування у трьох точках рендеру (`Item.vue`, `RelativeItem.vue`, `release/[id].vue`). `title` лишається канонічним; SEO, alt-атрибути, DTO — без змін. Fallback: рядок без гільметів рендериться як зараз.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind v4, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-19-release-artist-title-split-design.md`

## Global Constraints

- Гілка `json-to-yml`, без git worktrees (AGENTS.md).
- Стиль: 2 пробіли, один trailing newline, без trailing whitespace; коментарі в коді — англійською й лише для неочевидного.
- Базлайн тестів до змін: `npm run test:unit` → 39 files / 161 tests. Typecheck: `npx nuxi typecheck` (локальні Supabase env warnings — норма).
- Не запускати `sync:*`; нових npm-залежностей не додавати.
- SEO (`useSeoMeta`) і alt-атрибути продовжують використовувати повний `item.title`.

---

### Task 1: Утиліта `splitReleaseTitle`

**Files:**
- Create: `app/utils/releaseTitle.ts`
- Test: `tests/unit/releaseTitle.test.ts`

**Interfaces:**
- Produces: `splitReleaseTitle(title: string | null | undefined): ReleaseTitleParts`, де `ReleaseTitleParts = { artist: string | null, name: string, edition: string | null }`. Auto-import у компонентах (директорія `app/utils`), явний відносний імпорт у тестах.

- [ ] **Step 1: Написати падаючий тест**

`tests/unit/releaseTitle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { splitReleaseTitle } from '../../app/utils/releaseTitle'

describe('splitReleaseTitle', () => {
  it('splits a plain artist-title release', () => {
    expect(splitReleaseTitle('Sphingida «Origin»')).toEqual({
      artist: 'Sphingida',
      name: 'Origin',
      edition: null,
    })
  })

  it('keeps VA as the display artist', () => {
    expect(splitReleaseTitle('VA «Fantazma»')).toEqual({
      artist: 'VA',
      name: 'Fantazma',
      edition: null,
    })
  })

  it('supports collaborations and inner punctuation', () => {
    expect(splitReleaseTitle('Cifroteca & Roof Raiser «Wild Storm»')).toEqual({
      artist: 'Cifroteca & Roof Raiser',
      name: 'Wild Storm',
      edition: null,
    })
    expect(splitReleaseTitle('VA «Ocean Scenes: Higher Titans»')).toEqual({
      artist: 'VA',
      name: 'Ocean Scenes: Higher Titans',
      edition: null,
    })
  })

  it('extracts the EP/Single edition suffix', () => {
    expect(splitReleaseTitle('Hypnotriod «Seven Heavenly Edges» EP')).toEqual({
      artist: 'Hypnotriod',
      name: 'Seven Heavenly Edges',
      edition: 'EP',
    })
  })

  it('falls back gracefully when there are no guillemets', () => {
    expect(splitReleaseTitle('Plain Future Title')).toEqual({
      artist: null,
      name: 'Plain Future Title',
      edition: null,
    })
  })

  it('handles empty input', () => {
    expect(splitReleaseTitle('')).toEqual({ artist: null, name: '', edition: null })
    expect(splitReleaseTitle(null)).toEqual({ artist: null, name: '', edition: null })
    expect(splitReleaseTitle(undefined)).toEqual({ artist: null, name: '', edition: null })
  })
})
```

- [ ] **Step 2: Переконатися, що тест падає**

Run: `npx vitest run tests/unit/releaseTitle.test.ts`
Expected: FAIL — `Cannot find module '../../app/utils/releaseTitle'`.

- [ ] **Step 3: Реалізувати утиліту**

`app/utils/releaseTitle.ts`:

```ts
export interface ReleaseTitleParts {
  artist: string | null
  name: string
  edition: string | null
}

// Release titles in the catalog follow `Artist «Name»` with an optional
// trailing edition (`EP`, `Single`); verified against all current releases.
const RELEASE_TITLE_RE = /^(.*?)\s*«(.+)»\s*(.*)$/

export function splitReleaseTitle(title: string | null | undefined): ReleaseTitleParts {
  const source = title ?? ''
  const match = source.match(RELEASE_TITLE_RE)
  if (!match) return { artist: null, name: source, edition: null }
  return {
    artist: match[1] || null,
    name: match[2] ?? '',
    edition: match[3] || null,
  }
}
```

- [ ] **Step 4: Прогнати тест**

Run: `npx vitest run tests/unit/releaseTitle.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add app/utils/releaseTitle.ts tests/unit/releaseTitle.test.ts
git commit -m "feat(releases): add splitReleaseTitle util for artist/name/edition"
```

---

### Task 2: Дворядковий заголовок у картці `Item.vue`

**Files:**
- Modify: `app/components/Item.vue` (script setup + рядок 93)

**Interfaces:**
- Consumes: `splitReleaseTitle` (auto-import з `app/utils`).
- Поведінка: розбиття вмикається лише для `category === 'release'`; інші сутності та релізи без гільметів рендеряться одним рядком, як зараз.

- [ ] **Step 1: Додати обчислення частин**

У `<script setup>` `app/components/Item.vue` після `props` додати:

```ts
const titleParts = computed(() =>
  props.category === 'release' ? splitReleaseTitle(props.i.title) : null
)
```

- [ ] **Step 2: Замінити рендер заголовка**

Замінити рядок:

```html
    <div class="line-clamp-2 tracking-tight text-center">{{ i.title }}</div>
```

на:

```html
    <div v-if="titleParts?.artist" class="tracking-tight text-center">
      <div class="text-[10px] md:text-xs text-foreground/60 truncate">{{ titleParts.artist }}</div>
      <div class="line-clamp-2">{{ titleParts.name }}<span v-if="titleParts.edition" class="text-foreground/60"> {{ titleParts.edition }}</span></div>
    </div>
    <div v-else class="line-clamp-2 tracking-tight text-center">{{ i.title }}</div>
```

- [ ] **Step 3: Typecheck**

Run: `npx nuxi typecheck`
Expected: без помилок (Supabase env warnings — ок).

- [ ] **Step 4: Live smoke списку релізів**

Run: `npm run dev` (фоном), потім:

```bash
curl -s http://localhost:3000/releases | grep -o 'Sphingida' | head -1
curl -s http://localhost:3000/releases | grep -c '«'
```

Expected: `Sphingida` присутній; кількість `«` у SSR-розмітці сторінки релізів — 0 (гільмети більше не рендеряться в картках; заголовок сторінки/меню їх не містять). Артисти/відео/події виглядають без змін (`/artists` рендерить однорядкові заголовки).

- [ ] **Step 5: Commit**

```bash
git add app/components/Item.vue
git commit -m "feat(releases): render artist above release name in catalog cards"
```

---

### Task 3: Компактний варіант у `RelativeItem.vue`

**Files:**
- Modify: `app/components/RelativeItem.vue` (script setup + рядок 43)

**Interfaces:**
- Consumes: `splitReleaseTitle`.
- Поведінка: та сама умова `category === 'release'`; рік рендериться поруч із назвою, як зараз.

- [ ] **Step 1: Додати обчислення частин**

У `<script setup>` `app/components/RelativeItem.vue` після `year` додати:

```ts
const titleParts = computed(() =>
  props.category === 'release' ? splitReleaseTitle(props.i.title) : null
)
```

- [ ] **Step 2: Замінити рендер заголовка**

Замінити рядок:

```html
      <span v-if="i.title" class="mr-1">{{ i.title }}</span>
```

на:

```html
      <span v-if="titleParts?.artist" class="mr-1 inline-flex flex-col leading-tight">
        <small class="text-foreground/60">{{ titleParts.artist }}</small>
        <span>{{ titleParts.name }}<small v-if="titleParts.edition" class="text-foreground/60"> {{ titleParts.edition }}</small></span>
      </span>
      <span v-else-if="i.title" class="mr-1">{{ i.title }}</span>
```

- [ ] **Step 3: Typecheck + smoke**

Run: `npx nuxi typecheck`
Expected: без помилок.
Smoke: `curl -s http://localhost:3000/release/va-fantazma | grep -c '«'` → 0 у секції related (допустимі входження з `information`-HTML самого релізу, якщо там є гільмети — перевірити очима на сторінці, related-картки мають бути дворядковими).

- [ ] **Step 4: Commit**

```bash
git add app/components/RelativeItem.vue
git commit -m "feat(releases): split artist and name in related release items"
```

---

### Task 4: `<h1>` detail-сторінки релізу

**Files:**
- Modify: `app/pages/release/[id].vue` (рядок 137; script setup)

**Interfaces:**
- Consumes: `splitReleaseTitle`.
- Незмінне: `useSeoMeta` (рядки 118–129), `PageDescription`, alt-атрибути, `:title` iframe-ів — усі на повному `item.title`.

- [ ] **Step 1: Додати обчислення частин**

У `<script setup>` поруч із `year` додати:

```ts
const titleParts = computed(() => splitReleaseTitle(item.value?.title))
```

- [ ] **Step 2: Замінити `<h1>`**

Замінити:

```html
        <h1 class="text-center text-2xl md:text-4xl my-4 md:my-6">{{ item.title }}</h1>
```

на:

```html
        <div class="text-center my-4 md:my-6">
          <div v-if="titleParts.artist" class="text-sm md:text-lg text-foreground/60">{{ titleParts.artist }}</div>
          <h1 class="text-2xl md:text-4xl">{{ titleParts.artist ? titleParts.name : item.title }}<span v-if="titleParts.edition" class="text-foreground/60 text-lg md:text-2xl"> {{ titleParts.edition }}</span></h1>
        </div>
```

- [ ] **Step 3: Typecheck + smoke**

Run: `npx nuxi typecheck`
Expected: без помилок.
Smoke:

```bash
curl -s http://localhost:3000/release/va-fantazma | grep -o '<h1[^>]*>[^<]*' | head -1
curl -s http://localhost:3000/release/va-fantazma | grep -o '<title>[^<]*' | head -1
```

Expected: `<h1>` містить `Fantazma` без `«»` і без `VA` (він у div над h1); `<title>` містить повний `VA «Fantazma»` (SEO незмінний).

- [ ] **Step 4: Commit**

```bash
git add "app/pages/release/[id].vue"
git commit -m "feat(releases): split artist line above release name in detail h1"
```

---

### Task 5: Повна верифікація

**Files:** —

- [ ] **Step 1: Повна сюїта**

Run: `npm run test:unit`
Expected: 40 files / 167 tests, PASS (базлайн + новий файл на 6 тестів).

- [ ] **Step 2: Typecheck**

Run: `npx nuxi typecheck`
Expected: без помилок.

- [ ] **Step 3: Visual smoke (web-debug)**

Run: `node scripts/web-debug.mjs` при запущеному dev-сервері.
Expected: усі маршрути 2xx/3xx. Очима: головна (Swiper релізів), `/releases`, `/release/va-fantazma`, `/artists` (без регресій), профіль-колекція релізів.

- [ ] **Step 4: Зупинити dev-сервер**
