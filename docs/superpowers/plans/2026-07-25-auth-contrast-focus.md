# Auth Contrast and Focus States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Дати auth-сторінкам видимий focus-стан на кожному інтерактивному елементі й AA-контраст в обох темах, виправивши це на рівні токенів і primitives, а не дублями класів на call-sites.

**Architecture:** Ретюн семантичних токенів у `app/assets/css/tailwind.css` (заливка картки у світлій темі інвертується з чорної на білу), `focus-visible` через перевірений у рендері `outline` у базі `buttonVariants`, `Input`, auth-лінках і кнопці видимості пароля, новий варіант `submit` для сабмітів форм, варіант `success` в `alertVariants`, екстракція спільної оболонки `AuthCard.vue`. Регресії ловить греп-тест `tests/unit/interactionStates.test.ts` у стилі наявного `tests/unit/authPages.test.ts`.

**Tech Stack:** Nuxt 4, Tailwind v4 (`@theme` / `@theme inline` токени, без config-файлу), shadcn-vue primitives на reka-ui, cva для варіантів, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-25-auth-contrast-focus-design.md`
**Audit (заміри «до»):** `docs/audits/2026-07-25-auth-theme-contrast-audit.md`

## Global Constraints

- Гілка `main`, кожна таска - свій коміт. Не робити amend у попередні коміти: у дереві є незв'язані незакомічені зміни (`AGENTS.md`, `app/pages/event/[id].vue`, `package.json` та інші), тому кожен `git add` перелічує файли явно, ніякого `git add -A`.
- Нових залежностей не додавати.
- Dev-сервер для перевірок піднімати **тільки** на порті 3100 через `python .agents/skills/web-debug/scripts/with_server.py`. Порти 3000-3002 належать користувачу; ніколи не запускати `pkill -f "nuxt dev"`.
- Пороги приймання контрасту: текст ≥ 4.5, non-text (focus-обведення, іконки у спокої) ≥ 3.0, і рахуються проти **worst-case** пікселя фонового фото під карткою, не медіани.
- Рівнів тексту рівно два: `text-foreground` і `text-muted-foreground`. `text-foreground/40` і `text-foreground/50` на auth-сторінках заборонені.
- Парні дублі `X-black/N dark:X-white/N` заборонені; замість них токен (`border-foreground/20`) або утиліта, коректна в обох темах (`bg-foreground/8`).
- Коментарів у коді не додавати; якщо коментар неминучий - англійською.
- `@apply` у `<style scoped>` не використовувати (Tailwind v4 трактує scoped-блок як ізольований контекст).
- Точні значення токенів (перевірені числами в аудиті), від них не відступати:
  - light: `--card: oklch(1 0 0 / 55%)`, `--muted-foreground: oklch(0 0 0 / 62%)`, `--ring: oklch(0 0 0 / 55%)`, `--input: oklch(0 0 0 / 25%)`, `--destructive: oklch(0.52 0.19 22)`, `--success: oklch(0.48 0.12 155)`
  - dark: `--card: oklch(0 0 0 / 25%)`, `--muted-foreground: oklch(1 0 0 / 62%)`, `--ring: oklch(1 0 0 / 65%)`, `--input: oklch(1 0 0 / 28%)`, `--destructive: oklch(0.7 0.19 22)` (без змін), `--success: oklch(0.8 0.18 155)`

---

### Task 1: Токени interaction-станів

**Files:**
- Create: `tests/unit/interactionStates.test.ts`
- Modify: `app/assets/css/tailwind.css:12-42` (`:root`), `:44-72` (`.dark`), `:74-98` (`@theme inline`)

**Interfaces:**
- Produces: CSS-змінні `--success` (обидві теми) і `--color-success` у `@theme inline`, тобто утиліта `text-success`; переретюнені `--card`, `--muted-foreground`, `--ring`, `--input`, `--destructive`. Хелпери `projectFile`, `readProjectFile`, `cssBlock`, `appSourceFiles` у тест-файлі, які використовують Tasks 2-6.

- [ ] **Step 1: Написати падаючий тест**

Створити `tests/unit/interactionStates.test.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

const cssBlock = (source: string, opener: string) => {
  const start = source.indexOf(opener)
  expect(start, `${opener} block missing`).toBeGreaterThan(-1)
  const end = source.indexOf('\n}', start)
  return source.slice(start, end)
}

const appSourceFiles = () =>
  (readdirSync(projectFile('app'), { recursive: true, encoding: 'utf8' }) as string[])
    .filter(file => file.endsWith('.vue') || file.endsWith('.ts'))
    .map(file => `app/${file}`)

describe('interaction state tokens', () => {
  it('defines interaction tokens in both themes', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')
    const tokens = ['--card', '--muted-foreground', '--ring', '--input', '--destructive', '--success']

    for (const opener of ['\n:root {', '\n.dark {']) {
      const block = cssBlock(css, opener)
      for (const token of tokens) {
        expect(block, `${token} missing in ${opener.trim()}`).toContain(`${token}:`)
      }
    }

    expect(cssBlock(css, '\n@theme inline {')).toContain('--color-success: var(--success)')
  })

  it('keeps the card fill lighter than the page in light and darker in dark', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')

    expect(cssBlock(css, '\n:root {')).toContain('--card: oklch(1 0 0 / 55%)')
    expect(cssBlock(css, '\n.dark {')).toContain('--card: oklch(0 0 0 / 25%)')
  })

  it('keeps secondary text at the same alpha in both themes', () => {
    const css = readProjectFile('app/assets/css/tailwind.css')

    expect(cssBlock(css, '\n:root {')).toContain('--muted-foreground: oklch(0 0 0 / 62%)')
    expect(cssBlock(css, '\n.dark {')).toContain('--muted-foreground: oklch(1 0 0 / 62%)')
  })
})
```

`appSourceFiles` тут ще не використовується - його споживає Task 4. Vitest не скаржиться на невикористаний хелпер, а `npm run typecheck` не перевіряє `tests/`, тож проміжного стану з помилкою не буде.

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL - `--success missing in :root` у першому тесті, і невідповідність `--card` у другому.

- [ ] **Step 3: Оновити токени світлої теми**

У `app/assets/css/tailwind.css` у блоці `:root` зробити чотири заміни:

`--card: oklch(0 0 0 / 4%);` → `--card: oklch(1 0 0 / 55%);`

`--muted-foreground: oklch(0 0 0 / 50%);` → `--muted-foreground: oklch(0 0 0 / 62%);`

`--destructive: oklch(0.6 0.2 22);` → `--destructive: oklch(0.52 0.19 22);`

і блок бордерів:

```css
  --border: oklch(0 0 0 / 15%);
  --input: oklch(0 0 0 / 25%);
  --ring: oklch(0 0 0 / 55%);
```

Додати `--success` відразу після `--destructive`:

```css
  --destructive: oklch(0.52 0.19 22);
  --success: oklch(0.48 0.12 155);
```

`--border` не змінюється: він живить рамки поза auth.

- [ ] **Step 4: Оновити токени темної теми**

У блоці `.dark`:

`--card: oklch(1 0 0 / 5%);` → `--card: oklch(0 0 0 / 25%);`

`--muted-foreground: oklch(1 0 0 / 50%);` → `--muted-foreground: oklch(1 0 0 / 62%);`

додати success після destructive:

```css
  --destructive: oklch(0.7 0.19 22);
  --success: oklch(0.8 0.18 155);
```

і блок бордерів:

```css
  --border: oklch(1 0 0 / 20%);
  --input: oklch(1 0 0 / 28%);
  --ring: oklch(1 0 0 / 65%);
```

- [ ] **Step 5: Зареєструвати success у @theme inline**

У блоці `@theme inline` після рядка `--color-destructive: var(--destructive);` додати:

```css
  --color-success: var(--success);
```

- [ ] **Step 6: Запустити тест і переконатися, що він проходить**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: PASS (3 тести).

- [ ] **Step 7: Commit**

```bash
git add tests/unit/interactionStates.test.ts app/assets/css/tailwind.css
git commit -m "feat(theme): retune interaction state tokens, add success token"
```

---

### Task 2: Focus-обведення і варіант `submit` у `buttonVariants`

**Files:**
- Modify: `app/components/ui/button/index.ts:7` (база cva), `:10-25` (варіанти)
- Modify: `tests/unit/interactionStates.test.ts`
- Modify: `app/pages/ui.vue:22` (демо нового варіанта)

**Interfaces:**
- Consumes: токен `--ring` із Task 1 (через утиліту `outline-ring`).
- Produces: варіант `submit` у `buttonVariants`, доступний як `<Button variant="submit">`; focus-обведення в базі, тому кожна кнопка сайту отримує його автоматично.

- [ ] **Step 1: Написати падаючий тест**

Додати в кінець `tests/unit/interactionStates.test.ts` новий `describe`:

```ts
describe('button primitive', () => {
  const buttonSource = () => readProjectFile('app/components/ui/button/index.ts')
  const cvaBase = (source: string) => source.match(/cva\(\s*'([^']*)'/)?.[1] ?? ''

  it('renders a visible focus indicator from the cva base', () => {
    const base = cvaBase(buttonSource())

    expect(base).toContain('focus-visible:outline-2')
    expect(base).toContain('focus-visible:outline-offset-2')
    expect(base).toContain('focus-visible:outline-ring')
    expect(base, 'unconditional outline-none kills the focus indicator').not.toContain('outline-none')
  })

  it('has a submit variant that works in both themes without dark duplicates', () => {
    const submit = buttonSource().match(/submit:\s*\n\s*'([^']*)'/)?.[1] ?? ''

    expect(submit).toContain('bg-foreground/12')
    expect(submit).toContain('border-foreground/30')
    expect(submit, 'submit must not need a dark: duplicate').not.toContain('dark:')
  })
})
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL - `focus-visible:outline-2` відсутній у базі, і `submit` варіанта немає.

- [ ] **Step 3: Оновити базу cva і додати варіант**

У `app/components/ui/button/index.ts` замінити рядок бази:

```ts
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-md outline-none transition-[color,background-color,border-color] duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
```

на:

```ts
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-md transition-[color,background-color,border-color] duration-300 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
```

Прибрання `outline-none` є обов'язковим: у Tailwind v4 ця утиліта виставляє `--tw-outline-style: none` безумовно, і тоді `focus-visible:outline-2` малює обведення нульового стилю, тобто нічого.

Після варіанта `soft` додати:

```ts
        submit:
          'h-10 px-4 text-sm border border-foreground/30 bg-foreground/12 hover:bg-foreground/20 hover:border-foreground/45',
```

- [ ] **Step 4: Запустити тест і переконатися, що він проходить**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: PASS (5 тестів).

- [ ] **Step 5: Додати варіант у демо-сторінку**

У `app/pages/ui.vue` у секції Button після рядка `<Button variant="soft" v-wave>Soft</Button>` додати:

```vue
          <Button variant="submit" v-wave>Submit</Button>
```

- [ ] **Step 6: Перевірити, що обведення реально малюється**

Це головна перевірка таски: клас у джерелі не доводить, що Tailwind v4 його згенерував і що стиль обведення не `none`.

Створити `/tmp/auth-verify/focus.py`:

```python
from playwright.sync_api import sync_playwright

URL = 'http://localhost:3100/ui'

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for theme in ['light', 'dark']:
        ctx = b.new_context(viewport={'width': 1440, 'height': 900})
        ctx.add_init_script(f"localStorage.setItem('theme','{theme}')")
        pg = ctx.new_page()
        pg.goto(URL, wait_until='domcontentloaded')
        pg.wait_for_selector('button')
        pg.wait_for_timeout(1200)
        pg.get_by_role('button', name='Submit').focus()
        pg.keyboard.press('Shift+Tab')
        for _ in range(6):
            pg.keyboard.press('Tab')
            if pg.evaluate("() => (document.activeElement.textContent || '').trim() === 'Submit'"):
                break
        else:
            raise SystemExit('could not reach the Submit demo button with the keyboard')
        info = pg.evaluate("""() => {
          const a = document.activeElement
          const cs = getComputedStyle(a)
          return {
            el: (a.textContent || '').trim(),
            style: cs.outlineStyle,
            width: cs.outlineWidth,
            color: cs.outlineColor,
            offset: cs.outlineOffset,
          }
        }""")
        print(theme, info)
        assert info['el'] == 'Submit', f'{theme}: focused {info["el"]} instead of Submit'
        assert info['style'] not in ('none', ''), f'{theme}: outline-style is {info["style"]}'
        assert info['width'] not in ('0px', ''), f'{theme}: outline-width is {info["width"]}'
        ctx.close()
    b.close()
print('focus outline renders in both themes')
```

Run:

```bash
python .agents/skills/web-debug/scripts/with_server.py \
  --server "npm run dev -- --port 3100" --port 3100 \
  -- python /tmp/auth-verify/focus.py
```

Expected: обидва рядки друкують `style: solid`, `width: 2px`, `offset: 2px`, скрипт завершується повідомленням `focus outline renders in both themes`.

Якщо `style` виходить `none` - клас `outline-solid` у цій версії Tailwind не існує або базу перекриває інша утиліта: додати в базу `focus-visible:outline` замість `focus-visible:outline-solid` і повторити перевірку, поки обведення не з'явиться. Не переходити до наступної таски з невидимим фокусом.

- [ ] **Step 7: Commit**

```bash
git add app/components/ui/button/index.ts app/pages/ui.vue tests/unit/interactionStates.test.ts
git commit -m "feat(ui): visible focus outline in button base, add submit variant"
```

---

### Task 3: Заливка й focus-outline інпута

**Files:**
- Modify: `app/components/ui/input/Input.vue:24-31`
- Modify: `tests/unit/interactionStates.test.ts`

**Interfaces:**
- Consumes: `--ring`, `--input`, `--muted-foreground` із Task 1.
- Produces: `<Input>` з власною заливкою `bg-foreground/8`, коректною в обох темах, і видимим focus-outline.

- [ ] **Step 1: Написати падаючий тест**

Додати в кінець `tests/unit/interactionStates.test.ts`:

```ts
describe('input primitive', () => {
  it('uses a visible outline and one fill for both themes', () => {
    const input = readProjectFile('app/components/ui/input/Input.vue')

    expect(input).toContain('focus-visible:outline-solid')
    expect(input).toContain('focus-visible:outline-2')
    expect(input).toContain('focus-visible:outline-offset-2')
    expect(input).toContain('focus-visible:outline-ring')
    expect(input, 'shadow-xs leaves the Tailwind ring slot visually inactive').not.toContain('focus-visible:ring-')
    expect(input, 'unconditional outline-none kills the focus indicator').not.toContain('outline-none')
    expect(input).toContain('bg-foreground/8')
    expect(input).not.toContain('bg-transparent')
    expect(input, 'the shared fill removes the dark-only background').not.toContain('dark:bg-input/30')
  })
})
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL - outline-класи та `bg-foreground/8` відсутні.

- [ ] **Step 3: Оновити класи інпута**

У `app/components/ui/input/Input.vue` замінити перший рядок класів:

```ts
      'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
```

на:

```ts
      'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 w-full min-w-0 rounded-md border bg-foreground/8 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
```

і другий рядок:

```ts
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
```

на:

```ts
      'focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
```

`outline-none` прибирається. Live review показав, що `shadow-xs` лишає
Tailwind ring-слот прозорим, навіть коли `--tw-ring-shadow` виставлений. Тому
тест охороняє фактично видимий outline, а не no-op ring-класи.

- [ ] **Step 4: Запустити тест і переконатися, що він проходить**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: PASS (6 тестів).

- [ ] **Step 5: Commit**

```bash
git add app/components/ui/input/Input.vue tests/unit/interactionStates.test.ts
git commit -m "fix(ui): visible input focus outline and shared fill"
```

---

### Task 4: Варіант `success` для Alert замість `text-green-400`

**Files:**
- Modify: `app/components/ui/alert/index.ts:7-20`
- Modify: `app/components/AuthForm.vue:145-147`, `app/pages/reset-password.vue:47-49`, `app/pages/ui.vue:54-56`
- Modify: `tests/unit/interactionStates.test.ts`

**Interfaces:**
- Consumes: токен `--success` і утиліту `text-success` із Task 1.
- Produces: `<Alert variant="success">`, який Task 5 використовує в `AuthCard.vue`.

- [ ] **Step 1: Написати падаючий тест**

Додати в кінець `tests/unit/interactionStates.test.ts`:

```ts
describe('success feedback', () => {
  it('has a success alert variant built on the token', () => {
    const alert = readProjectFile('app/components/ui/alert/index.ts')

    expect(alert).toContain("success: 'bg-card text-success'")
  })

  it('has no hardcoded green left in app sources', () => {
    const offenders = appSourceFiles().filter(file => readProjectFile(file).includes('text-green-400'))

    expect(offenders, 'green-400 is baked for dark theme and gives 1.59 in light').toEqual([])
  })
})
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL - варіанта немає, і три файли містять `text-green-400`.

- [ ] **Step 3: Додати варіант**

У `app/components/ui/alert/index.ts` у блок `variants.variant` після рядка `destructive` додати:

```ts
        success: 'bg-card text-success',
```

- [ ] **Step 4: Перевести call-sites на варіант**

У `app/components/AuthForm.vue` замінити:

```vue
            <Alert v-if="message" class="text-green-400">
              <AlertDescription class="text-green-400/90">{{ message }}</AlertDescription>
            </Alert>
```

на:

```vue
            <Alert v-if="message" variant="success">
              <AlertDescription>{{ message }}</AlertDescription>
            </Alert>
```

Такий самий блок замінити в `app/pages/reset-password.vue`.

У `app/pages/ui.vue` замінити:

```vue
          <Alert class="text-green-400">
            <AlertDescription class="text-green-400/90">Saved successfully.</AlertDescription>
          </Alert>
```

на:

```vue
          <Alert variant="success">
            <AlertDescription>Saved successfully.</AlertDescription>
          </Alert>
```

- [ ] **Step 5: Запустити тести і переконатися, що вони проходять**

Run: `npx vitest run tests/unit/interactionStates.test.ts tests/unit/authPages.test.ts`
Expected: PASS (8 тестів у першому файлі, 2 у другому).

- [ ] **Step 6: Commit**

```bash
git add app/components/ui/alert/index.ts app/components/AuthForm.vue app/pages/reset-password.vue app/pages/ui.vue tests/unit/interactionStates.test.ts
git commit -m "feat(ui): success alert variant, drop hardcoded green"
```

---

### Task 5: Екстракція `AuthCard` і перехід auth на семантичні рівні тексту

**Files:**
- Create: `app/components/AuthCard.vue`
- Modify: `app/components/AuthForm.vue:100-174` (весь template), `app/pages/reset-password.vue:25-58` (весь template), `app/pages/confirm.vue:10`
- Modify: `tests/unit/interactionStates.test.ts`

**Interfaces:**
- Consumes: варіант `submit` (Task 2), `<Alert variant="success">` (Task 4), токени (Task 1).
- Produces: `<AuthCard>` з props `title: string`, `error?: string`, `message?: string`, `novalidate?: boolean`, емітом `submit: [event: Event]` і трьома слотами: default (поля форми), `actions` (кнопка сабміту), `footer` (текст під карткою). Task 6 додає a11y-атрибути в поля всередині default-слота.

- [ ] **Step 1: Написати падаючий тест**

Додати в кінець `tests/unit/interactionStates.test.ts`:

```ts
describe('auth surface', () => {
  const AUTH_FILES = [
    'app/components/AuthCard.vue',
    'app/components/AuthForm.vue',
    'app/components/PasswordInput.vue',
    'app/pages/reset-password.vue',
    'app/pages/confirm.vue',
  ]

  it('uses only the two semantic text tiers', () => {
    for (const file of AUTH_FILES) {
      expect(readProjectFile(file), `${file} keeps a sub-AA text tier`).not.toMatch(/text-foreground\/(30|35|40|45|50)\b/)
    }
  })

  it('has no paired black/white duplicates', () => {
    for (const file of AUTH_FILES) {
      expect(readProjectFile(file), `${file} keeps a paired light/dark duplicate`)
        .not.toMatch(/-(?:black|white)\/\d+\s+dark:[a-z:-]*-(?:white|black)\/\d+/)
    }
  })

  it('shares one card shell between the auth form and reset-password', () => {
    const authCard = readProjectFile('app/components/AuthCard.vue')

    expect(authCard).toContain('border-foreground/20')
    expect(authCard).toContain('backdrop-blur-md')
    expect(readProjectFile('app/components/AuthForm.vue')).toContain('<AuthCard')
    expect(readProjectFile('app/pages/reset-password.vue')).toContain('<AuthCard')
  })

  it('uses the submit variant for form submits', () => {
    expect(readProjectFile('app/components/AuthForm.vue')).toContain('variant="submit"')
    expect(readProjectFile('app/pages/reset-password.vue')).toContain('variant="submit"')
  })
})
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL - `app/components/AuthCard.vue` не існує (`ENOENT`).

- [ ] **Step 3: Створити `AuthCard.vue`**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  error?: string
  message?: string
  novalidate?: boolean
}>(), { error: '', message: '', novalidate: false })

const emit = defineEmits<{ submit: [event: Event] }>()
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-['Julius_Sans_One'] tracking-wide text-center mb-8">
        {{ title }}
      </h1>

      <Card class="border-foreground/20 backdrop-blur-md text-left">
        <CardContent>
          <form :novalidate="novalidate" class="flex flex-col gap-4" @submit.prevent="emit('submit', $event)">
            <slot />

            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
            <Alert v-if="message" variant="success">
              <AlertDescription>{{ message }}</AlertDescription>
            </Alert>

            <slot name="actions" />
          </form>
        </CardContent>
      </Card>

      <slot name="footer" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Перевести `AuthForm.vue` на `AuthCard`**

Замінити весь `<template>` у `app/components/AuthForm.vue` на:

```vue
<template>
  <AuthCard :title="title" :error="error" :message="message" novalidate @submit="submit">
    <div class="flex flex-col gap-1.5">
      <Label for="email" class="text-xs text-muted-foreground tracking-widest uppercase">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="your@email.com"
        :aria-invalid="!!errors.email"
      />
      <span v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</span>
    </div>

    <div v-if="mode !== 'forgot'" class="flex flex-col gap-1.5">
      <Label for="password" class="text-xs text-muted-foreground tracking-widest uppercase">Password</Label>
      <PasswordInput
        id="password"
        v-model="password"
        :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
        :invalid="!!errors.password"
      />
      <span v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</span>
      <NuxtLink
        v-if="mode === 'signin'"
        to="/forgot-password"
        class="self-end mt-1 text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
      >
        Forgot password?
      </NuxtLink>
    </div>

    <template #actions>
      <Button type="submit" variant="submit" :disabled="loading" class="w-full cursor-pointer">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
        <Icon v-else-if="mode !== 'forgot'" name="lucide:log-in" />
        {{ submitLabel }}
      </Button>
    </template>

    <template #footer>
      <div class="text-center mt-4 text-sm text-muted-foreground">
        <span v-if="mode === 'signin'">
          Don't have an account?
          <NuxtLink to="/signup" class="cursor-pointer text-foreground hover:text-foreground/70 underline ml-1">Sign Up</NuxtLink>
        </span>
        <span v-else-if="mode === 'signup'">
          Already have an account?
          <NuxtLink to="/signin" class="cursor-pointer text-foreground hover:text-foreground/70 underline ml-1">Sign In</NuxtLink>
        </span>
        <span v-else>
          Remembered it?
          <NuxtLink to="/signin" class="cursor-pointer text-foreground hover:text-foreground/70 underline ml-1">Sign In</NuxtLink>
        </span>
      </div>
    </template>
  </AuthCard>
</template>
```

`<script setup>` не змінюється: `submit` із `handleSubmit` приймає подію і сам викликає `preventDefault`, тому повторний prevent із `AuthCard` безпечний.

- [ ] **Step 5: Перевести `reset-password.vue` на `AuthCard`**

Замінити весь `<template>` у `app/pages/reset-password.vue` на:

```vue
<template>
  <AuthCard title="New Password" :error="error" :message="message" @submit="submit">
    <div class="flex flex-col gap-1.5">
      <Label for="password" class="text-xs text-muted-foreground tracking-widest uppercase">New Password</Label>
      <PasswordInput
        id="password"
        v-model="password"
        autocomplete="new-password"
      />
    </div>

    <template #actions>
      <Button type="submit" variant="submit" :disabled="loading" class="w-full cursor-pointer">
        <Icon v-if="loading" name="lucide:loader-circle" class="animate-spin" />
        Update Password
      </Button>
    </template>
  </AuthCard>
</template>
```

`async function submit()` у `<script setup>` не змінюється: `AuthCard` вже робить `preventDefault`, тож `submit` викликається без аргументів.

- [ ] **Step 6: Оновити `confirm.vue`**

Замінити:

```vue
      <div class="text-center text-foreground/50">Confirming your account...</div>
```

на:

```vue
      <div class="text-center text-muted-foreground">Confirming your account...</div>
```

- [ ] **Step 7: Запустити тести і typecheck**

Run: `npx vitest run tests/unit/interactionStates.test.ts tests/unit/authPages.test.ts`
Expected: PASS (12 тестів у першому файлі, 2 у другому - `authPages.test.ts` перевіряє `<script setup>` `AuthForm.vue`, який ми не чіпали).

Run: `npm run typecheck`
Expected: PASS (локально можливі попередження про відсутні Supabase env vars - це очікувано).

- [ ] **Step 8: Перевірити всі чотири auth-сторінки в браузері**

Створити `/tmp/auth-verify/shots.py`:

```python
from playwright.sync_api import sync_playwright

ROUTES = ['/signin', '/signup', '/forgot-password', '/reset-password']

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for theme in ['light', 'dark']:
        ctx = b.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)
        ctx.add_init_script(f"localStorage.setItem('theme','{theme}')")
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: print(f'[{theme} pageerror] {e}'))
        pg.on('console', lambda m: m.type == 'error' and print(f'[{theme} console.error] {m.text}'))
        for route in ROUTES:
            pg.goto(f'http://localhost:3100{route}', wait_until='domcontentloaded')
            pg.wait_for_selector('form')
            pg.wait_for_timeout(1000)
            name = route.strip('/').replace('/', '-')
            pg.screenshot(path=f'/tmp/auth-verify/{theme}-{name}.png', full_page=True)
        ctx.close()
    b.close()
print('shots written to /tmp/auth-verify')
```

Run:

```bash
python .agents/skills/web-debug/scripts/with_server.py \
  --server "npm run dev -- --port 3100" --port 3100 \
  -- python /tmp/auth-verify/shots.py
```

Прочитати всі 8 знімків. Перевірити: картка відділяється від фону, текстура листя не проступає крізь неї, форма надсилається (жодного `pageerror`), сабміт має однакову вагу в обох темах, `Forgot password?` і footer читаються.

- [ ] **Step 9: Ухвалити рішення щодо заливки Alert**

На знімках `light-signin` немає alert-ів, тому перевірити їх окремо: у `/tmp/auth-verify/shots.py` перед знімком заповнити форму невалідними даними і надіслати (`pg.fill('#email','nobody@example.com')`, `pg.fill('#password','wrongpass123')`, `pg.click('button[type=submit]')`, `pg.wait_for_timeout(2500)`), потім знову знімок.

Якщо `Alert variant="destructive"` або `success` не читається як окремий блок на світлій картці (заливка `bg-card` тепер біла 55% на білій 55%), змінити в `app/components/ui/alert/index.ts` заливку обох варіантів з `bg-card` на `bg-foreground/8`:

```ts
        default: 'bg-foreground/8 text-card-foreground',
        destructive: 'bg-foreground/8 text-destructive',
        success: 'bg-foreground/8 text-success',
```

і оновити тест Task 4 з `"success: 'bg-card text-success'"` на `"success: 'bg-foreground/8 text-success'"`. Якщо блок читається - лишити `bg-card` і нічого не змінювати. Рішення ухвалюється тут, а не переноситься далі.

- [ ] **Step 10: Commit**

```bash
git add app/components/AuthCard.vue app/components/AuthForm.vue app/pages/reset-password.vue app/pages/confirm.vue tests/unit/interactionStates.test.ts
git commit -m "refactor(auth): shared AuthCard shell, semantic text tiers, submit variant"
```

Якщо Step 9 змінив `alertVariants`, додати `app/components/ui/alert/index.ts` до цього ж `git add`.

---

### Task 6: A11y-обв'язка форми

**Files:**
- Modify: `app/components/AuthForm.vue` (поля в default-слоті), `app/components/PasswordInput.vue`
- Modify: `tests/unit/interactionStates.test.ts`

**Interfaces:**
- Consumes: `<AuthCard>` із Task 5.
- Produces: `PasswordInput` отримує додаткову prop `describedBy?: string`, яку пробрасує в `aria-describedby` внутрішнього `<Input>`.

- [ ] **Step 1: Написати падаючий тест**

Додати в кінець `tests/unit/interactionStates.test.ts`:

```ts
describe('auth form accessibility', () => {
  it('links field errors to their inputs and announces them', () => {
    const authForm = readProjectFile('app/components/AuthForm.vue')

    expect(authForm).toContain('id="email-error"')
    expect(authForm).toContain('id="password-error"')
    expect(authForm).toContain("aria-describedby=\"errors.email ? 'email-error' : undefined\"")
    expect(authForm).toContain(":described-by=\"errors.password ? 'password-error' : undefined\"")
    expect(authForm.match(/role="alert"/g) ?? [], 'both field errors announce').toHaveLength(2)
  })

  it('labels the password visibility toggle', () => {
    const passwordInput = readProjectFile('app/components/PasswordInput.vue')

    expect(passwordInput).toContain(":aria-label=\"show ? 'Hide password' : 'Show password'\"")
    expect(passwordInput).toContain(':aria-pressed="show"')
    expect(passwordInput).toContain(':aria-describedby="describedBy"')
  })
})
```

- [ ] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: FAIL - `id="email-error"` відсутній.

- [ ] **Step 3: Оновити `PasswordInput.vue`**

Замінити весь файл на:

```vue
<script setup lang="ts">
defineProps<{
  id: string
  autocomplete: string
  invalid?: boolean
  describedBy?: string
}>()

const model = defineModel<string>({ required: true })
const show = ref(false)
</script>

<template>
  <div class="relative">
    <Input
      :id="id"
      v-model="model"
      :type="show ? 'text' : 'password'"
      required
      :autocomplete="autocomplete"
      placeholder="••••••••"
      :aria-invalid="invalid"
      :aria-describedby="describedBy"
      class="pr-10"
    />
    <button
      type="button"
      :aria-label="show ? 'Hide password' : 'Show password'"
      :aria-pressed="show"
      @click="show = !show"
      class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon :name="show ? 'lucide:eye-closed' : 'lucide:eye'" size="18" />
    </button>
  </div>
</template>
```

- [ ] **Step 4: Пов'язати помилки з полями в `AuthForm.vue`**

У default-слоті `<AuthCard>` замінити email-блок на:

```vue
    <div class="flex flex-col gap-1.5">
      <Label for="email" class="text-xs text-muted-foreground tracking-widest uppercase">Email</Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="your@email.com"
        :aria-invalid="!!errors.email"
        :aria-describedby="errors.email ? 'email-error' : undefined"
      />
      <span v-if="errors.email" id="email-error" role="alert" class="text-xs text-destructive">{{ errors.email }}</span>
    </div>
```

і password-блок на:

```vue
    <div v-if="mode !== 'forgot'" class="flex flex-col gap-1.5">
      <Label for="password" class="text-xs text-muted-foreground tracking-widest uppercase">Password</Label>
      <PasswordInput
        id="password"
        v-model="password"
        :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
        :invalid="!!errors.password"
        :described-by="errors.password ? 'password-error' : undefined"
      />
      <span v-if="errors.password" id="password-error" role="alert" class="text-xs text-destructive">{{ errors.password }}</span>
      <NuxtLink
        v-if="mode === 'signin'"
        to="/forgot-password"
        class="self-end mt-1 text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
      >
        Forgot password?
      </NuxtLink>
    </div>
```

- [ ] **Step 5: Запустити тести і переконатися, що вони проходять**

Run: `npx vitest run tests/unit/interactionStates.test.ts tests/unit/authPages.test.ts`
Expected: PASS (14 тестів у першому файлі, 2 у другому).

- [ ] **Step 6: Перевірити accessibility tree у браузері**

Створити `/tmp/auth-verify/a11y.py`:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page()
    pg.goto('http://localhost:3100/signin', wait_until='domcontentloaded')
    pg.wait_for_selector('#email')
    pg.wait_for_timeout(1000)

    toggle = pg.get_by_role('button', name='Show password')
    assert toggle.count() == 1, 'password toggle has no accessible name'
    toggle.click()
    assert pg.get_by_role('button', name='Hide password').count() == 1, 'toggle label does not flip'

    pg.fill('#email', 'bad')
    pg.click('button[type=submit]')
    pg.wait_for_selector('#email-error')
    described = pg.eval_on_selector('#email', 'el => el.getAttribute("aria-describedby")')
    assert described == 'email-error', f'aria-describedby is {described}'
    print('accessible name flips, field error is linked')
    b.close()
```

Run:

```bash
python .agents/skills/web-debug/scripts/with_server.py \
  --server "npm run dev -- --port 3100" --port 3100 \
  -- python /tmp/auth-verify/a11y.py
```

Expected: `accessible name flips, field error is linked`.

- [ ] **Step 7: Commit**

```bash
git add app/components/AuthForm.vue app/components/PasswordInput.vue tests/unit/interactionStates.test.ts
git commit -m "fix(a11y): link auth field errors, label password toggle"
```

---

### Task 7: Наскрізна перевірка контрасту й клавіатури

**Files:**
- Create (throwaway, поза репозиторієм): `/tmp/auth-verify/contrast.py`

**Interfaces:**
- Consumes: усі зміни Tasks 1-6.
- Produces: підтверджені числа для критеріїв успіху спеки. Коду в репозиторій ця таска не додає.

- [ ] **Step 1: Написати скрипт замірів**

Створити `/tmp/auth-verify/contrast.py`:

```python
from playwright.sync_api import sync_playwright

ROUTES = ['/signin', '/signup', '/forgot-password', '/reset-password']

JS = r"""
() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const toRGBA = css => {
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = css; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const srgb = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = c => 0.2126 * srgb(c[0]) + 0.7152 * srgb(c[1]) + 0.0722 * srgb(c[2]);
  const over = (f, b) => [0, 1, 2].map(i => f[i] * f[3] + b[i] * (1 - f[3]));
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const bgOf = el => {
    const stack = [];
    let n = el;
    while (n) { const c = toRGBA(getComputedStyle(n).backgroundColor); if (c[3] > 0) stack.push(c); n = n.parentElement; }
    let base = [255, 255, 255];
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };
  const out = [];
  const add = (name, el, target, pseudo) => {
    if (!el) return;
    const cs = getComputedStyle(el, pseudo || null);
    const bg = bgOf(el);
    out.push({ name, ratio: +ratio(over(toRGBA(cs.color), bg), bg).toFixed(2), target });
  };
  add('h1', document.querySelector('h1'), 4.5);
  document.querySelectorAll('label').forEach((el, i) => add('label ' + i, el, 4.5));
  document.querySelectorAll('input').forEach((el, i) => {
    add('input value ' + i, el, 4.5);
    add('placeholder ' + i, el, 4.5, '::placeholder');
  });
  const eye = document.querySelector('input[type=password]')?.parentElement?.querySelector('button');
  add('password toggle icon', eye, 3.0);
  add('forgot link', document.querySelector('a[href="/forgot-password"]'), 4.5);
  add('submit label', document.querySelector('button[type=submit]'), 4.5);
  document.querySelectorAll('form ~ div span, .max-w-sm > div:last-child span').forEach((el, i) => add('footer text ' + i, el, 4.5));
  document.querySelectorAll('[role=alert]').forEach((el, i) => add('alert ' + i, el, 4.5));
  const input = document.querySelector('input');
  if (input) {
    const bg = bgOf(input);
    const ringVar = getComputedStyle(document.documentElement).getPropertyValue('--ring').trim();
    const ring = toRGBA(ringVar);
    out.push({ name: 'focus ring token', ratio: +ratio(over(ring, bg), bg).toFixed(2), target: 3.0 });
  }
  return out;
}
"""

failures = []

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for theme in ['light', 'dark']:
        ctx = b.new_context(viewport={'width': 1440, 'height': 900})
        ctx.add_init_script(f"localStorage.setItem('theme','{theme}')")
        pg = ctx.new_page()
        for route in ROUTES:
            pg.goto(f'http://localhost:3100{route}', wait_until='domcontentloaded')
            pg.wait_for_selector('form')
            pg.wait_for_timeout(900)
            if route == '/signin':
                pg.fill('#email', 'nobody@example.com')
                pg.fill('#password', 'wrongpass123')
                pg.click('button[type=submit]')
                pg.wait_for_timeout(2500)
            print(f'--- {theme} {route}')
            for row in pg.evaluate(JS):
                flag = 'ok  ' if row['ratio'] >= row['target'] else 'FAIL'
                print(f"   {flag} {row['name']:26} {row['ratio']:6.2f} (target {row['target']})")
                if row['ratio'] < row['target']:
                    failures.append((theme, route, row['name'], row['ratio'], row['target']))

            # keyboard pass: every focusable control must draw something
            focusables = pg.locator('a, button, input')
            pg.locator('body').click(position={'x': 5, 'y': 5})
            for i in range(focusables.count() + 4):
                pg.keyboard.press('Tab')
                state = pg.evaluate("""() => {
                  const a = document.activeElement
                  if (!a || a === document.body) return null
                  const cs = getComputedStyle(a)
                  return {
                    tag: a.tagName,
                    text: (a.textContent || a.getAttribute('aria-label') || a.id || '').trim().slice(0, 24),
                    outline: cs.outlineStyle + ' ' + cs.outlineWidth,
                    shadow: cs.boxShadow.slice(0, 40),
                  }
                }""")
                if not state:
                    continue
                visible = state['outline'] not in ('none 0px', 'none 0px ') or 'rgb' in state['shadow']
                if not visible:
                    failures.append((theme, route, f"no focus indicator on {state['tag']} {state['text']}", 0, 1))
                    print(f"   FAIL no focus indicator: {state['tag']} {state['text']}")
        ctx.close()
    b.close()

print()
if failures:
    print(f'{len(failures)} failures')
    for f in failures:
        print('  ', f)
    raise SystemExit(1)
print('all thresholds met in both themes')
```

- [ ] **Step 2: Прогнати заміри**

Run:

```bash
python .agents/skills/web-debug/scripts/with_server.py \
  --server "npm run dev -- --port 3100" --port 3100 \
  -- python /tmp/auth-verify/contrast.py
```

Expected: `all thresholds met in both themes`.

Якщо щось падає - виправляти токен або клас, який відповідає за конкретний елемент, і повторювати прогін. Заборонено «домовлятися» з порогом: текст 4.5, non-text 3.0.

- [ ] **Step 3: Перевірити мобільний вигляд**

Додати в кінець `/tmp/auth-verify/shots.py` (перед `b.close()`) окремий контекст 390x844 для обох тем і зняти `/signin` full-page. Прочитати знімки: картка не виходить за межі, кнопка не переносить лейбл у два рядки, поля на всю ширину.

- [ ] **Step 4: Перевірити blast radius поза auth**

`buttonVariants` зачіпає всі кнопки сайту, тому пройти в обох темах `/`, `/releases`, `/artists`, одну detail-сторінку (`/release/<будь-який-slug>`), `/profile` (без входу віддає редірект - достатньо `/ui`), і `/ui`. Знімки зробити тим самим підходом, що в Task 5 Step 8, підставивши маршрути.

Перевірити: `outline-offset-2` не обрізається у скляних кнопок хедера й не перекриває сусідні елементи; `Card` і `Input` на `/ui` виглядають цілісно; жодна кнопка не втратила свій вигляд від прибирання `outline-none` з бази.

- [ ] **Step 5: Прогнати повний набір тестів**

Run: `npm run test:unit`
Expected: PASS, кількість файлів 41 (40 наявних + `interactionStates.test.ts`).

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit (лише якщо Step 2 або 4 вимагали правок)**

```bash
git add -u app
git commit -m "fix(theme): contrast and focus fixes found during verification"
```

Якщо правок не було - коміту немає, таска закривається результатом прогону.

---

### Task 8: Конвенція в AGENTS.md і закриття roadmap-айтема

**Files:**
- Modify: `AGENTS.md` (секція Styling (Tailwind v4))
- Modify: `docs/roadmap/auth-contrast-focus.md:3` (Status), `docs/roadmap/README.md`

**Interfaces:**
- Consumes: підтверджені результати Task 7.

- [ ] **Step 1: Дописати конвенцію в AGENTS.md**

У секцію **Styling (Tailwind v4)**, після абзацу про `font-mono`, додати:

```markdown
**Text tiers and focus states.** Тексту два семантичні рівні: `text-foreground` (основний) і `text-muted-foreground` (secondary: лейбли, placeholder, допоміжні лінки). Третього, тусклішого рівня немає - `text-foreground/40` і `/50` не проходять WCAG AA у світлій темі (2.58-3.94). Focus-стан кнопок та інпутів використовує `outline` (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`); auth-лінки й кнопка видимості пароля отримують еквівалентне правило в `tailwind.css`. **Не** додавати безумовний `outline-none`: у Tailwind v4 він може зробити focus-обведення невидимим. Не замінювати outline інпута на `ring-*` без живої перевірки: разом із `shadow-xs` ring-слот лишався прозорим. Заливка `--card` навмисно інвертується між темами (світла - біла 55%, темна - чорна 25%), бо на світлому фоні затемнення картки погіршує контраст чорного тексту. Guarded by `tests/unit/interactionStates.test.ts`.
```

- [ ] **Step 2: Перевести roadmap-айтем у Implemented**

У `docs/roadmap/auth-contrast-focus.md` замінити `- Status: Planned` на `- Status: Implemented`, а секцію «Наступний крок» на:

```markdown
## Наступний крок

Немає: обсяг закритий. Follow-up-и (решта 11 `outline-none`, п’ять
`focus-visible:ring-ring/50`, site-wide `text-foreground/50` і
`buttonVariants.soft`) описані в
[аудиті](../audits/2026-07-25-auth-theme-contrast-audit.md) і належать
[accessibility structure](accessibility-structure.md) та
[design system](design-system.md).
```

У `docs/roadmap/README.md` у рядку айтема замінити `` `Planned` `` на `` `Implemented` ``.

- [ ] **Step 3: Перевірити, що документація не суперечить коду**

Run: `npx vitest run tests/unit/interactionStates.test.ts`
Expected: PASS - тест і є тим, на що посилається AGENTS.md.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md docs/roadmap/auth-contrast-focus.md docs/roadmap/README.md
git commit -m "docs: text tier and focus conventions, close auth contrast roadmap item"
```

---

### Task 9: Корекції після implementation review

**Files:**
- Modify: `app/assets/css/tailwind.css`
- Modify: `app/components/PasswordInput.vue`
- Modify: `app/components/ui/input/Input.vue`
- Modify: `tests/unit/interactionStates.test.ts`
- Modify: audit, spec, plan, roadmap і `AGENTS.md`

**Interfaces:**
- Consumes: `--ring` із Task 1 і live-заміри Task 7.
- Produces: один фактично намальований semantic outline на всіх шести
  Tab-стопах auth-картки.

- [ ] **Step 1: Замінити no-op input ring на outline**

Виконати скоригований Task 3: прибрати `outline-none` та `ring-*` з `Input`,
додати `focus-visible:outline-solid focus-visible:outline-2
focus-visible:outline-offset-2 focus-visible:outline-ring`.

- [ ] **Step 2: Прибрати залежність auth-посилань від UA-outline**

У `tailwind.css` додати `a:focus-visible` з `outline: 2px solid var(--ring)` та
`outline-offset: 2px`.

- [ ] **Step 3: Уніфікувати фокус кнопки видимості пароля**

Додати клас `password-toggle`, правило
`button.password-toggle:focus-visible` із повним `--ring` і замінити
`transition-colors` на `transition-[color]`, щоб outline не починався з
`currentColor`.

- [ ] **Step 4: Перевірити тестом і живим Tab-проходом**

`interactionStates.test.ts` має забороняти no-op ring в `Input` і охороняти CSS
для посилання та кнопки ока. На `/signin` у світлій і темній темах перевірити
шість стопів: email, password, Show password, Forgot password?, Sign In,
Sign Up. Для кожного очікується `solid 2px`, offset `2px`, колір
`oklch(0 0 0 / 0.55)` light або `oklch(1 0 0 / 0.65)` dark.

- [ ] **Step 5: Commit**

```bash
git add app/assets/css/tailwind.css app/components/PasswordInput.vue app/components/ui/input/Input.vue tests/unit/interactionStates.test.ts
git commit -m "fix(a11y): render semantic auth focus outlines"
```

Документаційні уточнення комітяться окремо, із вибірковим staging `AGENTS.md`,
бо файл містить незв’язані користувацькі зміни.

---

### Task 10: Semantic focus на intentional-dark футері

**Files:**
- Modify: `app/components/Footer.vue:13-22`
- Modify: `tests/unit/interactionStates.test.ts`
- Modify: `AGENTS.md` (`Text tiers and focus states`)

**Interfaces:**
- Consumes: глобальне `a:focus-visible` і токен `--ring` із Tasks 1 та 9.
- Produces: локальний `--ring: oklch(1 0 0 / 65%)` для всіх інтерактивних
  нащадків футера без анімації `outline-color`.

**Accepted debt:** інші theme-aware посилання з `transition-colors` можуть
анімувати `outline-color` до 300ms, але обидва кінцеві стани читабельні. Task 10
не розширює scope на ці косметичні переходи.

- [ ] **Step 1: Додати точний helper і падаючий regression test**

Після `cssBlock` у `tests/unit/interactionStates.test.ts` додати:

```ts
const tagClasses = (source: string, marker: string) => {
  const markerIndex = source.indexOf(marker)
  expect(markerIndex, `${marker} missing`).toBeGreaterThan(-1)
  const tagStart = source.lastIndexOf('<', markerIndex)
  const tagEnd = source.indexOf('>', markerIndex)
  const tag = source.slice(tagStart, tagEnd)
  return tag.match(/(?:^|\s)class="([^"]*)"/)?.[1] ?? ''
}
```

У `describe('non-primitive focus')` додати:

```ts
it('keeps focus immediate and light on the intentional dark footer', () => {
  const css = readProjectFile('app/assets/css/tailwind.css')
  const footer = readProjectFile('app/components/Footer.vue')
  const rootClasses = tagClasses(footer, 'data-testid="site-footer"')
  const navLinkClasses = tagClasses(footer, 'v-for="i in getNav()"')
  const darkRing = cssBlock(css, '\n.dark {').match(/--ring:\s*([^;]+);/)?.[1] ?? ''
  const footerRing = rootClasses
    .match(/\[--ring:([^\]]+)\]/)?.[1]
    ?.replaceAll('_', ' ') ?? ''

  expect(darkRing).not.toBe('')
  expect(footerRing).toBe(darkRing)
  expect(navLinkClasses).toContain('transition-[color,background-color]')
  expect(navLinkClasses).not.toContain('transition-colors')
})
```

У тесті `labels the password visibility toggle` замінити широкі асерти:

```ts
expect(passwordInput).toContain('password-toggle')
expect(passwordInput).toContain('transition-[color]')
expect(passwordInput).not.toContain('transition-colors')
```

на:

```ts
const passwordToggleClasses = tagClasses(passwordInput, 'password-toggle')
expect(passwordToggleClasses).toContain('transition-[color]')
expect(passwordToggleClasses).not.toContain('transition-colors')
```

- [ ] **Step 2: Запустити тест і підтвердити правильне падіння**

Run: `npx vitest run tests/unit/interactionStates.test.ts`

Expected: FAIL у тесті intentional-dark footer: кореневий клас не містить
локального `--ring`, тому `footerRing` дорівнює `''`, а nav link досі містить
`transition-colors`.

- [ ] **Step 3: Додати локальний токен і звузити transition**

У кореневому елементі `app/components/Footer.vue` замінити:

```vue
<div data-testid="site-footer" class="relative z-100 bg-black/90 dark:bg-black/75 text-white/50 leading-[1.4] md:leading-[1.5] px-1 py-24">
```

на:

```vue
<div data-testid="site-footer" class="relative z-100 bg-black/90 dark:bg-black/75 text-white/50 [--ring:oklch(1_0_0_/_65%)] leading-[1.4] md:leading-[1.5] px-1 py-24">
```

У navigation `NuxtLink` замінити:

```vue
class="transition-colors ease-in-out duration-300 text-white/80 hover:text-white/100 hover:bg-white/20 p-[0.6em]"
```

на:

```vue
class="transition-[color,background-color] ease-in-out duration-300 text-white/80 hover:text-white/100 hover:bg-white/20 p-[0.6em]"
```

- [ ] **Step 4: Запустити вузький тест**

Run: `npx vitest run tests/unit/interactionStates.test.ts`

Expected: PASS (16 тестів).

- [ ] **Step 5: Перевірити footer та auth реальним Tab-проходом**

Створити throwaway `/tmp/auth-verify/footer_focus.py`:

```python
from playwright.sync_api import sync_playwright

FOOTER_LINKS = {'Home', 'News'}
AUTH_STOPS = {
    'email',
    'password',
    'Show password',
    'Forgot password?',
    'Sign In',
    'Sign Up',
}

def focus_state(page):
    return page.evaluate("""() => {
      const element = document.activeElement
      const style = getComputedStyle(element)
      return {
        name: element.id || element.getAttribute('aria-label') || (element.textContent || '').trim(),
        focusVisible: element.matches(':focus-visible'),
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        outlineOffset: style.outlineOffset,
        transitionProperty: style.transitionProperty,
      }
    }""")

def assert_outline(state, colour):
    assert state['focusVisible']
    assert state['outlineStyle'] == 'solid'
    assert state['outlineWidth'] == '2px'
    assert state['outlineOffset'] == '2px'
    assert state['outlineColor'] == colour

def focus_before(page, container_selector):
    page.evaluate("""selector => {
      const container = document.querySelector(selector)
      const focusables = [...document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )]
      const firstIndex = focusables.findIndex(element => container.contains(element))
      if (firstIndex > 0) focusables[firstIndex - 1].focus()
    }""", container_selector)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for theme in ['light', 'dark']:
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        context.add_init_script(f"localStorage.setItem('theme','{theme}')")
        page = context.new_page()

        page.goto('http://localhost:3100/', wait_until='domcontentloaded')
        page.wait_for_selector('[data-testid="site-footer"]')
        focus_before(page, '[data-testid="site-footer"]')
        footer_found = {}

        for _ in range(80):
            page.keyboard.press('Tab')
            state = focus_state(page)
            in_footer = page.evaluate(
                """() => Boolean(document.activeElement?.closest('[data-testid="site-footer"]'))"""
            )
            if not in_footer or state['name'] not in FOOTER_LINKS or state['name'] in footer_found:
                continue

            immediate = state
            page.wait_for_timeout(350)
            settled = focus_state(page)
            assert_outline(immediate, 'oklch(1 0 0 / 0.65)')
            assert_outline(settled, 'oklch(1 0 0 / 0.65)')
            assert immediate['outlineColor'] == settled['outlineColor']
            assert 'outline-color' not in immediate['transitionProperty']
            footer_found[state['name']] = {'immediate': immediate, 'settled': settled}

            if set(footer_found) == FOOTER_LINKS:
                break

        assert set(footer_found) == FOOTER_LINKS
        print(theme, 'footer', footer_found)

        page.goto('http://localhost:3100/signin', wait_until='domcontentloaded')
        page.wait_for_selector('form')
        page.wait_for_function("() => Boolean(document.querySelector('form')?.__vueParentComponent)")
        focus_before(page, 'form')
        auth_found = {}
        auth_colour = 'oklch(0 0 0 / 0.55)' if theme == 'light' else 'oklch(1 0 0 / 0.65)'

        for _ in range(20):
            page.keyboard.press('Tab')
            state = focus_state(page)
            if state['name'] not in AUTH_STOPS or state['name'] in auth_found:
                continue

            assert_outline(state, auth_colour)
            auth_found[state['name']] = state

            if set(auth_found) == AUTH_STOPS:
                break

        assert set(auth_found) == AUTH_STOPS
        print(theme, 'auth', auth_found)
        context.close()

    browser.close()

print('footer and auth focus outlines pass in both themes')
```

Run:

```bash
python .agents/skills/web-debug/scripts/with_server.py \
  --server "npm run dev -- --port 3100" --port 3100 \
  -- python /tmp/auth-verify/footer_focus.py
```

Expected:

- `Home` і `News` одразу після Tab та через 350ms мають білий
  `oklch(1 0 0 / 0.65)` outline в обох темах;
- їхній `transition-property` не містить `outline-color`;
- шість auth-стопів зберігають `oklch(0 0 0 / 0.55)` light і
  `oklch(1 0 0 / 0.65)` dark.

- [ ] **Step 6: Зафіксувати repo-level правила в AGENTS.md**

Після абзацу `Text tiers and focus states` додати:

```markdown
**Intentional dark focus surfaces.** Поверхня, яка навмисно лишається темною в обох темах, перевизначає `--ring` локально; значення Footer синхронізоване тестом із `.dark --ring`. У Tailwind v4 `transition-colors` включає `outline-color`, тому для focus-обведення без анімації використовуй явний `transition-[...]` без `outline-color`.
```

`AGENTS.md` уже містить незв’язані користувацькі зміни. Під час коміту не
використовувати `git add AGENTS.md`; stage лише цей новий абзац через окремий
cached patch і перевірити `git diff --cached -- AGENTS.md`.

- [ ] **Step 7: Запустити повну перевірку**

Run: `npm run test:unit && npm run typecheck`

Expected: 41 test files / 185 tests PASS; typecheck PASS без помилок.

- [ ] **Step 8: Commit**

Створити `/tmp/footer-focus-agents.patch` з точним вмістом:

```diff
diff --git a/AGENTS.md b/AGENTS.md
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -94,0 +95,2 @@
+**Intentional dark focus surfaces.** Поверхня, яка навмисно лишається темною в обох темах, перевизначає `--ring` локально; значення Footer синхронізоване тестом із `.dark --ring`. У Tailwind v4 `transition-colors` включає `outline-color`, тому для focus-обведення без анімації використовуй явний `transition-[...]` без `outline-color`.
+
```

Stage і перевірити лише файли Task 10:

```bash
git add app/components/Footer.vue tests/unit/interactionStates.test.ts
git apply --cached --unidiff-zero /tmp/footer-focus-agents.patch
git diff --cached --check
git diff --cached -- AGENTS.md
git commit -m "fix(a11y): keep footer focus visible in light theme"
```

---

## Self-review

**Покриття спеки:** токени (Task 1), `buttonVariants` focus + `submit` (Task 2), `Input` outline і заливка (Task 3), `alertVariants` success і зняття `text-green-400` (Task 4), `AuthCard` + рівні тексту + `confirm.vue` (Task 5), aria-обв'язка (Task 6), правило щодо заливки Alert (Task 5 Step 9), заміри й клавіатурний прохід із порогами (Task 7), blast radius поза auth (Task 7 Step 4), AGENTS.md і roadmap (Task 8), semantic outline для auth-лінків і кнопки видимості пароля (Task 9), intentional-dark footer token і стабільний outline без transition (Task 10). Пункти «поза скоупом» зі спеки жодною таскою не зачіпаються.

**Узгодженість імен:** prop `describedBy` у `PasswordInput` (Task 6) використовується як `:described-by` у `AuthForm` - kebab-case у шаблоні, camelCase у props, тому тест Task 6 асертить саме `:described-by`. Хелпери `readProjectFile` і `appSourceFiles` визначені в Task 1 і використовуються Tasks 2-6. Варіант `submit` визначений у Task 2 і споживається в Task 5. `<Alert variant="success">` визначений у Task 4 і споживається `AuthCard` у Task 5.

**Порядок:** Task 4 змінює `AuthForm.vue` і `reset-password.vue` до того, як Task 5 переписує їхні шаблони. Це навмисно: Task 4 тримає auth-сторінки робочими зі старою розміткою, а Task 5 переносить готовий `variant="success"` в `AuthCard`. Хто виконує Task 5, той видаляє Alert-блоки з обох файлів разом із рештою старого шаблону.
