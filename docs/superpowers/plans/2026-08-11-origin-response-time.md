# Initial Server Response Time Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Прибрати повний SSR з шляху відвідувача там, де його можна не робити: увімкнути Netlify Durable Cache для публічних відповідей і перестати варіювати cache key HTML за query-параметрами, які застосунок не читає. Час самого origin не оптимізуємо — зменшуємо кількість звернень до нього.

**Architecture:** Обидві зміни живуть у двох уже наявних чистих утилітах політики заголовків (`server/utils/cachePolicy.ts` для `routeRules` API, `server/utils/htmlCachePolicy.ts` для server middleware), тож обидві повністю покриваються unit-тестами без деплою. Netlify-специфічна директива `durable` додається лише у `Netlify-CDN-Cache-Control`; стандартний `CDN-Cache-Control` лишається переносимим, і саме цю асиметрію фіксує оновлений mirror-тест.

**Tech Stack:** Nuxt 4 / Nitro (`netlify` preset), Vitest, `npx nuxi typecheck`, `curl` для перевірки заголовків на проді.

**Spec:** `docs/superpowers/specs/2026-08-11-origin-response-time-design.md`

## Global Constraints

- Гілка `main`, без git worktrees; нових npm-залежностей не додавати.
- Жодних змін у рендерингу, роутингу чи вигляді — тільки response headers.
- `private, no-store` маршрути (likes, profile, `track-plays`) лишаються недоторканими.
- Базлайн тестів зелений до і після: `npm run test:unit`, `npm run typecheck`, `npm run docs:check`.
- Коментарі в коді — англійською, лише для зовнішніх обмежень (граматика заголовків Netlify).

---

### Task 1: Baseline замірів origin

**Files:** — (артефакти не комітяться)

- [ ] **Step 1: Зафіксувати поточні заголовки**

Run: `curl -sI https://sentimony.com/ | grep -iE "cache-status|cdn-cache-control|netlify-vary"`
Expected: `"Netlify Durable"; fwd=bypass`, `netlify-vary: query`.

- [ ] **Step 2: Зафіксувати час origin**

Run для `/`, `/releases`, `/artists`, `/release/va-fantazma`, `/api/releases` з `?x=$(date +%s%N)`, метрика `time_starttransfer − time_appconnect`.
Expected: діапазон 0.4–0.8 с (значення зі спеки).

---

### Task 2: Durable Cache для публічних API-маршрутів

**Files:** `server/utils/cachePolicy.ts`, `tests/unit/cachePolicy.test.ts`

**Interfaces:**
- Changes: `publicCacheRule` і `countCacheRule` віддають `Netlify-CDN-Cache-Control` з `durable`; `CDN-Cache-Control` без нього.
- Unchanged: `privateCacheRule`, набір маршрутів, ключі `routeRules`.

- [ ] **Step 1: Винести побудову пари заголовків у хелпер**

Один хелпер приймає базову директиву і прапорець durable, повертає обидва заголовки. Без нього три правила розійдуться при наступному редагуванні.

- [ ] **Step 2: Оновити mirror-тест**

Тест «mirrors every Netlify CDN directive» більше не може вимагати побайтової рівності. Нова інваріанта: `CDN-Cache-Control` дорівнює `Netlify-CDN-Cache-Control` після видалення `durable`, і `durable` присутній рівно на публічних правилах.

- [ ] **Step 3: Прогнати тести**

Run: `npm run test:unit -- cachePolicy`
Expected: pass.

---

### Task 3: Durable Cache + стабільний cache key для HTML

**Files:** `server/utils/htmlCachePolicy.ts`, `tests/unit/htmlCachePolicy.test.ts`

**Interfaces:**
- Changes: `htmlCacheHeaders()` повертає третій заголовок `Netlify-Vary: query=_` і `durable` у Netlify-директиві.
- Unchanged: сигнатура функції, правила приватності (`privatePaths`, `privatePrefixes`, `hasSupabaseSession`), `server/middleware/htmlCache.ts`.

- [ ] **Step 1: Додати durable і Netlify-Vary**

`query=_` — allowlist з імені, якого застосунок не вживає: усі реальні URL стають «не-збігами» і діляться одним cache-об'єктом. Коментар англійською пояснює, чому не порожній `query=`.

- [ ] **Step 2: Тест на нечутливість до query**

Явний тест: наявність `Netlify-Vary` на кешованому HTML і його відсутність на приватних шляхах (там функція і далі повертає `null`). Тест супроводжується поясненням, що поява сторінки, яка читає query, вимагає розширити allowlist.

- [ ] **Step 3: Прогнати тести**

Run: `npm run test:unit -- htmlCachePolicy`
Expected: pass.

---

### Task 4: Верифікація

**Files:** —

- [ ] **Step 1: Повний прогін**

Run: `npm run test:unit && npm run typecheck && npm run docs:check`
Expected: усе зелене (typecheck може попереджати про відсутні Supabase env локально).

- [ ] **Step 2: Перевірка після деплою**

Run: `curl -sI https://sentimony.com/ | grep -iE "cache-status|netlify-vary"` і те саме для `https://sentimony.com/?utm_source=test`.
Expected: `"Netlify Durable"` більше не `fwd=bypass`; URL з `utm_source` дає `hit` замість промаху.

- [ ] **Step 3: Контрольний Lighthouse**

Run: Lighthouse mobile + desktop по `/` і одній detail-сторінці.
Expected: `server-response-time` лишається pass із більшим запасом; Performance не регресує.

---

## Наступний крок після плану

Якщо заміри після деплою покажуть, що origin усе ще на критичному шляху
(наприклад, `cache-status` часто `fwd=miss` через короткий TTL), розглянути
перенесення Nitro cache storage на Netlify Blobs — окрема ініціатива з новою
залежністю `@netlify/blobs`, детально описана в розділі «Чого свідомо не
робимо» спеки.
