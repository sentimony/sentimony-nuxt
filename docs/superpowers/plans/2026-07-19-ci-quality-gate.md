# CI Quality Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Розширити наявний `.github/workflows/web-debug.yml` до повного quality gate: e2e-тести, build прод-пресета `netlify`, задокументоване правило «деплой лише після зеленого CI».

**Architecture:** Один workflow, два jobs: наявний `smoke` (typecheck + unit + node-server build + web-debug) доповнюється кроком `netlify`-preset build; новий job `e2e` ганяє функціональні Playwright-спеки проти dev-сервера. Enforcement — branch protection (UI, документується) + правило в README/AGENTS.

**Tech Stack:** GitHub Actions, Playwright, Nitro presets (node-server / netlify).

**Spec:** `docs/superpowers/specs/2026-07-19-ci-quality-gate-design.md`

## Global Constraints

- Гілка `json-to-yml`, без git worktrees.
- `sync:*` скрипти в CI не запускаються; секрет `FIREBASE_DB_SECRET` у GitHub Secrets не додавати (інваріант).
- Наявні кроки job `smoke` (typecheck, typecheck:ts7, test:unit, node-server build, web-debug) не змінювати — лише додавати.
- Скріншотні e2e (`homepage-theme`) у CI не запускаються до стабілізації linux-снапшотів.

---

### Task 1: Крок `netlify`-preset build у job `smoke`

**Files:**
- Modify: `.github/workflows/web-debug.yml` (job `smoke`, після кроку unit-тестів, перед node-server build)

**Interfaces:**
- Produces: CI ловить ESM/CJS-помилки бандлінгу прод-lambda (`nitro.preset: 'netlify'`), які пропускає node-server build.

- [ ] **Step 1: Додати крок**

У `web-debug.yml` після кроку `npm run test:unit` вставити:

```yaml
      - name: Build (netlify preset, production parity)
        run: npm run build
        env:
          NITRO_PRESET: netlify
```

(Секрети/env ті самі, що вже задані на рівні job. Артефакт не запускається — це компіляційна перевірка.)

- [ ] **Step 2: Локальна перевірка команди**

Run: `NITRO_PRESET=netlify npm run build`
Expected: build завершується без помилок (це той самий пресет, що на Netlify).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/web-debug.yml
git commit -m "ci: build netlify preset for production bundling parity"
```

---

### Task 2: Job `e2e`

**Files:**
- Modify: `.github/workflows/web-debug.yml` (новий job після `smoke`)

**Interfaces:**
- Consumes: `npm run test:e2e` (`playwright test`), `playwright.config.ts` (webServer: dev-сервер на 3100, CI-режим: `forbidOnly`, `retries: 2`).
- Produces: обов'язковий check `e2e`, що ганяє функціональні спеки (`api-security`, `layout-loading`) без скріншотних (`homepage-theme`).

- [ ] **Step 1: Додати job**

У кінець `web-debug.yml` (той самий рівень, що `smoke`):

```yaml
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      NUXT_CATALOG_SOURCE: firebase
      # Reuse the same secrets block as the smoke job.
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Run functional e2e specs
        run: npx playwright test tests/e2e/api-security.spec.ts tests/e2e/layout-loading.spec.ts
```

Блок `env` із секретами скопіювати 1:1 із job `smoke` (той самий перелік `NUXT_*`/Supabase змінних; `FIREBASE_DB_SECRET` туди не входить і не додається).

- [ ] **Step 2: Локальна перевірка команди**

Run: `npx playwright test tests/e2e/api-security.spec.ts tests/e2e/layout-loading.spec.ts`
Expected: PASS (webServer підніме dev на 3100 сам).

- [ ] **Step 3: Commit + прогін на гілці**

```bash
git add .github/workflows/web-debug.yml
git commit -m "ci: run functional playwright specs as a required e2e job"
git push
```

Перевірити на GitHub: обидва jobs зелені на PR/push. Якщо `e2e` падає через CI-специфічні headers — виправляти асерти під фактичні значення, не вимикати тест.

---

### Task 3: Документація правила gate

**Files:**
- Modify: `README.md` (секція `### Deploy`)
- Modify: `AGENTS.md` (секція Commands)

- [ ] **Step 1: README**

У секцію `### Deploy` `README.md` додати абзац:

```markdown
Production deploys (`npm run deploy:prod`) are manual and allowed only after
the `smoke` and `e2e` GitHub Actions checks are green on `main`. `sync:*`
scripts never run in CI.
```

- [ ] **Step 2: AGENTS.md**

В AGENTS.md після рядка про `sync:*` додати:

```markdown
CI gate: `.github/workflows/web-debug.yml` runs typecheck + unit + netlify/node builds + functional e2e; `deploy:prod` only after green checks on `main`. `FIREBASE_DB_SECRET` is intentionally absent from GitHub Secrets so `sync:*` cannot run in CI.
```

- [ ] **Step 3: Branch protection (ручна дія власника)**

Зафіксувати в PR-описі/нотатці користувачу: у GitHub Settings → Branches → `main` увімкнути required status checks `smoke`, `e2e`. (З коду це не робиться; згадка обов'язкова, щоб дія не загубилась.)

- [ ] **Step 4: Commit**

```bash
git add README.md AGENTS.md
git commit -m "docs: document CI gate and deploy rule"
```
