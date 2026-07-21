# Brand Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перегенерувати PWA-іконки з master SVG так, щоб логотип «випирав» на `any`-варіантах, посилити `verify:pwa`, додати README-бейджі.

**Architecture:** Master SVG у `assets/brand/` → генераційний скрипт → PNG у `public/` (імена/manifest незмінні) → розширений verify. README — рядок shields.io-бейджів.

**Tech Stack:** SVG/sharp (через npx, без нової залежності), Node (PNG IHDR parsing), shields.io.

**Spec:** `docs/superpowers/specs/2026-07-19-brand-assets-design.md`

## Global Constraints

- Гілка `json-to-yml`; залежності в `package.json` не додаються (генерація через `npx --yes`).
- Імена файлів іконок і `site.webmanifest` НЕ змінюються (кеш встановлених PWA).
- `theme_color`/`background_color` `#111111` — незмінні (їх асертить verify-pwa).

---

### Task 1: Master SVG + генераційний скрипт

**Files:**
- Create: `assets/brand/icon-master.svg` (підготований квадратний варіант `public/images/sentimony-records-logo-v3.3.svg`)
- Create: `assets/brand/icon-maskable.svg` (той самий логотип у 80% safe zone на `#111111`)
- Create: `scripts/generate-pwa-icons.mjs`

**Interfaces:**
- Produces: `node scripts/generate-pwa-icons.mjs` перезаписує 5 PNG у `public/`: `web-app-manifest-{192,512}x*.png` (any: full-bleed з master; maskable: з maskable-джерела) та `apple-touch-icon.png` (180, з maskable-джерела).

- [ ] **Step 1: Підготувати SVG**

Скопіювати v3.3 у `assets/brand/icon-master.svg`; виставити квадратний `viewBox`, у якому графіка логотипа торкається країв (елементи «випирають» до межі кадру). `icon-maskable.svg`: обгортка `<svg>` з `<rect fill="#111111"/>` і логотипом, масштабованим до 80% по центру.

- [ ] **Step 2: Скрипт**

`scripts/generate-pwa-icons.mjs`:

```js
import { execSync } from 'node:child_process'

const jobs = [
  ['assets/brand/icon-master.svg', 'public/web-app-manifest-192x192.png', 192],
  ['assets/brand/icon-master.svg', 'public/web-app-manifest-512x512.png', 512],
  ['assets/brand/icon-maskable.svg', 'public/web-app-manifest-192x192-maskable.png', 192],
  ['assets/brand/icon-maskable.svg', 'public/web-app-manifest-512x512-maskable.png', 512],
  ['assets/brand/icon-maskable.svg', 'public/apple-touch-icon.png', 180],
]

for (const [src, out, size] of jobs) {
  execSync(`npx --yes sharp-cli -i ${src} -o ${out} resize ${size} ${size}`, { stdio: 'inherit' })
  console.log(`generated ${out} (${size}x${size})`)
}
```

(Точний CLI-синтаксис `sharp-cli` звірити на місці — `npx --yes sharp-cli --help`; якщо output-опція вимагає директорію, генерувати в tmp і переміщувати. Якщо `sharp-cli` не рендерить конкретний SVG коректно — зафіксувати в PR альтернативу: `npx --yes svgexport` з тими самими парами вхід/вихід/розмір.)

- [ ] **Step 3: Згенерувати і подивитись**

Run: `node scripts/generate-pwa-icons.mjs`
Відкрити всі 5 PNG (Read tool/preview): any — логотип до країв; maskable/apple — логотип у центрі на `#111111`.

- [ ] **Step 4: Commit**

```bash
git add assets/brand/ scripts/generate-pwa-icons.mjs public/web-app-manifest-*.png public/apple-touch-icon.png
git commit -m "feat(pwa): regenerate icons from master svg with full-bleed any variants"
```

---

### Task 2: Розширити `verify:pwa`

**Files:**
- Modify: `scripts/verify-pwa.mjs`

**Interfaces:**
- Produces: перевірка існування кожного PNG з manifest + збіг фактичних розмірів (PNG IHDR) із `sizes` у manifest; помилка → throw (як інші асерти скрипта).

- [ ] **Step 1: Додати перевірку**

У `scripts/verify-pwa.mjs` додати (стиль наявних асертів зберегти):

```js
import { readFileSync } from 'node:fs'

function pngSize(path) {
  const buf = readFileSync(path)
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

for (const icon of manifest.icons) {
  const path = `public${icon.src}`
  const [w, h] = icon.sizes.split('x').map(Number)
  const actual = pngSize(path)
  if (actual.width !== w || actual.height !== h) {
    throw new Error(`${path}: expected ${w}x${h}, got ${actual.width}x${actual.height}`)
  }
}
```

(Змінну `manifest` звірити з фактичним кодом скрипта — він уже читає webmanifest.)

- [ ] **Step 2: Верифікація**

Run: `npm run verify:pwa` → зелений. Негативна перевірка: тимчасово підмінити `sizes` у manifest → скрипт падає → повернути.

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-pwa.mjs
git commit -m "feat(pwa): verify icon files and dimensions in verify:pwa"
```

---

### Task 3: README-бейджі

**Files:**
- Modify: `README.md` (блок під заголовком)

- [ ] **Step 1: Додати рядок бейджів**

Під наявним заголовком/логотипом додати (Netlify-бейдж лишити, перенести в цей рядок):

```markdown
<p align="center">
  <a href="https://github.com/ihororlovskyi/sentimony-nuxt/actions/workflows/web-debug.yml"><img src="https://github.com/ihororlovskyi/sentimony-nuxt/actions/workflows/web-debug.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A524-339933?logo=node.js&logoColor=white" alt="Node >=24">
  <img src="https://img.shields.io/badge/nuxt-4-00DC82?logo=nuxt&logoColor=white" alt="Nuxt 4">
  <!-- existing Netlify status badge moves here -->
</p>
```

(Repo-slug у URL звірити з `git remote -v`.)

- [ ] **Step 2: Верифікація + commit**

Прев'ю markdown (GitHub/IDE) — бейджі рендеряться, лінк CI веде на workflow.

```bash
git add README.md
git commit -m "docs(readme): CI/node/nuxt badges row"
```

---

### Task 4: Ручна перевірка встановлення

- [ ] **Step 1: macOS/Android перевірка**

Run: `npm run deploy:stage`; на stage: Chrome → Install app (macOS dock — логотип «випирає»), DevTools → Application → Manifest (maskable preview обрізається коректно), iOS Safari (якщо доступно) → Add to Home Screen.
Результат зафіксувати скріншотами в PR. Якщо any-варіант виглядає гірше за очікування — правити `icon-master.svg` (кадрування), не PNG вручну.
