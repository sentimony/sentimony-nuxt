# Cloudflare Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести `sentimony.com` з Netlify на Cloudflare — спершу DNS, потім runtime на Workers — так, щоб до і після переїзду існували зняті однаковим інструментом заміри першого завантаження кожного типу сторінки, і щоб кожна фаза мала перевірений відкат.

**Architecture:** Фаза 0 додає `scripts/perf-baseline.mjs` (cold/warm TTFB, байти, стан CDN-кешу; опційно PageSpeed Insights) і спільний `scripts/lib/routes.mjs`, який споживають і `web-debug`, і новий скрипт. Фаза 1 переносить делегування зони з Imena.ua на Cloudflare у режимі DNS-only, не змінюючи request path. Фаза 2 готує runtime: `cachePolicy` починає віддавати ще й стандартний `CDN-Cache-Control`, sitemap-gate стає явним env-прапорцем, redirect-логіка edge-функції переїжджає в Nitro middleware з тестами, з'являється `wrangler.jsonc` і `cloudflare_module` preset. Фаза 3 — cutover прода з повторними замірами. Фаза 4 — опційні `audio.sentimony.com` і чистка `img`.

**Tech Stack:** Nuxt 4.5 / Nitro (`netlify` → `cloudflare_module`), Wrangler, Cloudflare DNS + WAF + Cache Rules, Vitest, Node 24 (`node --env-file-if-exists`), без нових npm-залежностей.

**Spec:** `docs/superpowers/specs/2026-07-26-cloudflare-migration-design.md`

## Позначення власника

- `[A]` — крок виконує агент самостійно.
- `[U]` — крок мусить виконати користувач (дії в чужих панелях, платіжні/облікові рішення, апрув воріт).
- `[A→U]` — агент готує точні дані/текст, користувач тільки натискає.

## Що знадобиться від користувача (зведено наперед)

Це вичерпний список; більше нічого просити не планується.

1. **Cloudflare API token.** Обліковий запис Cloudflare уже існує (там лежить R2-бакет `pub-38745cb64da2489d8cc71777425fd24b`). Потрібен token із дозволами: `Zone:DNS:Edit`, `Zone:Cache Purge`, `Zone:Zone Settings:Edit`, `Zone:Cache Rules:Edit`, `Zone:Firewall Services:Edit`, `Account:Workers Scripts:Edit`, `Account:Workers KV Storage:Edit`, `Account:Account Settings:Read`. Покласти в `.env/.env.local` як `CLOUDFLARE_API_TOKEN=...` і `CLOUDFLARE_ACCOUNT_ID=...`.
2. **Додати зону `sentimony.com` у Cloudflare** (дія в дашборді, потребує вибору тарифу).
3. **Змінити NS у панелі Imena.ua** на дві адреси, які видасть Cloudflare. Точний текст із поточними й новими значеннями підготує агент.
4. **Опційно: `PSI_API_KEY`** (Google PageSpeed Insights API) у `.env/.env.local` — без нього лабораторні метрики просто пропускаються, мережеві заміри працюють повністю.
5. **Апрув трьох воріт:** перед зміною NS (фаза 1), перед cutover прода (фаза 3), перед переписом `audio_url` (фаза 4).

## Global Constraints

- Гілка `main`. Кожна таска — свій коміт. У дереві є незв'язані незакомічені зміни (`AGENTS.md`, `app/pages/event/[id].vue`, `package.json`, `docs/roadmap/*`, `server/data/sentimony-db.yml` та інші), тому кожен `git add` перелічує файли явно; `git add -A` заборонено. Amend у попередні коміти не робити.
- Нових npm-залежностей не додавати. Wrangler викликається через `npx -y wrangler@4`, як уже зроблено для `netlify-cli` і `dotenv-cli`.
- Секрети не друкувати. Токени читаються з `.env/.env.local` у змінну оболонки і використовуються тільки як `Authorization: Bearer $TOKEN`.
- Dev-сервер для перевірок піднімати **тільки** на порті 3100 через `python .agents/skills/web-debug/scripts/with_server.py`. Порти 3000-3002 належать користувачу; `pkill -f "nuxt dev"` заборонено.
- `npm run sync:firebase` / `sync:supabase` не запускати без явного прохання — вони пишуть у віддалені сховища.
- Коментарів у коді не додавати; якщо коментар неминучий — англійською.
- **Жодна зміна в проді не робиться, поки фаза 0 не закомічена.** Baseline без «до» безцінний.
- Будь-яка дія, що змінює живий DNS або прод-трафік, виконується тільки після явного апруву користувача.
- `server/data/sentimony-db.yml` у фазах 0-3 не редагується.

---

## Фаза 0 — Baseline (жодних змін в інфраструктурі)

### Task 1: Спільний список маршрутів

Рефакторинг зі збереженням поведінки: `web-debug.mjs` має продовжити працювати байт-у-байт так само, просто читати маршрути з нового модуля.

**Files:**
- Create: `scripts/lib/routes.mjs`, `tests/unit/perfRoutes.test.ts`
- Modify: `scripts/web-debug.mjs:11-33`

**Interfaces:**
- Produces: `staticRoutes: string[]`, `dynamicRoutes: { api: string, path: (slug: string) => string }[]`, `assetTargets: { label: string, url: string }[]`.

- [x] **Step 1: Написати падаючий тест**

Створити `tests/unit/perfRoutes.test.ts`: перевірити, що `staticRoutes` містить `/`, `/releases`, `/artists`, `/tracks`, `/signin`; що кожен `dynamicRoutes[].path('x')` дає шлях, який починається з `/` і містить `x`; що `assetTargets` містить хост `content.sentimony.com` і хост `r2.dev`; що в `staticRoutes` немає дублікатів.

- [x] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/perfRoutes.test.ts`
Expected: FAIL — модуль `scripts/lib/routes.mjs` не існує.

- [x] **Step 3: Створити `scripts/lib/routes.mjs`**

Перенести `staticRoutes` і `dynamicRoutes` із `scripts/web-debug.mjs` без змін вмісту. Додати `assetTargets` — по одному представнику кожного класу асета, узятому з `server/data/sentimony-db.yml`: `content.sentimony.com` варіант `_th`, той самий варіант `_xl` і один `audio_url` з `r2.dev`.

- [x] **Step 4: Переписати `web-debug.mjs` на імпорт**

Замінити локальні константи на `import { staticRoutes, dynamicRoutes } from './lib/routes.mjs'`. Більше нічого не чіпати.

- [x] **Step 5: Перевірити, що поведінка не змінилась**

Run: `npx vitest run tests/unit/perfRoutes.test.ts && npm run typecheck:ts7`
Run: підняти сервер на 3100 і `BASE_URL=http://localhost:3100 npm run web-debug`
Expected: той самий перелік маршрутів і той самий результат, що й до рефакторингу.

- [x] **Step 6: Коміт**

`git add scripts/lib/routes.mjs scripts/web-debug.mjs tests/unit/perfRoutes.test.ts && git commit -m "refactor(scripts): share route inventory between web-debug and perf tooling"`

---

### Task 2: Вимірювач першого завантаження

**Files:**
- Create: `scripts/perf-baseline.mjs`, `scripts/lib/perfStats.mjs`, `tests/unit/perfStats.test.ts`
- Modify: `package.json` (скрипт `perf:baseline`)

**Interfaces:**
- Produces: `summarize(samples: number[]) => { min, median, p95, n }`, `cacheStateOf(headers) => string`, `bustUrl(url, token) => string`, JSON-артефакт у `docs/audits/data/<label>.json`.

- [x] **Step 1: Написати падаючий тест на чисті хелпери**

Створити `tests/unit/perfStats.test.ts`:

- `summarize([10])` → `{ min: 10, median: 10, p95: 10, n: 1 }`.
- `summarize([5, 1, 3])` → `min: 1`, `median: 3`.
- `summarize([1..100])` → `p95: 95` (nearest-rank, не інтерполяція — щоб число було відтворюваним).
- `summarize([])` → `null`, а не `NaN`.
- `cacheStateOf(new Headers({ 'cf-cache-status': 'HIT' }))` → `'HIT'`; для `{ 'cache-status': '"Netlify Edge"; hit' }` → рядок, що містить `hit`; за відсутності обох → `'unknown'`.
- `bustUrl('https://x/a', 't1')` → містить `?_pb=t1`; `bustUrl('https://x/a?b=1', 't1')` → містить і `b=1`, і `_pb=t1`.

- [x] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/perfStats.test.ts`
Expected: FAIL — `scripts/lib/perfStats.mjs` не існує.

- [x] **Step 3: Реалізувати `scripts/lib/perfStats.mjs`**

Тільки чисті функції, без мережі й без fs: `summarize`, `cacheStateOf`, `bustUrl`, `formatMarkdownTable(rows)`.

- [x] **Step 4: Реалізувати `scripts/perf-baseline.mjs`**

Поведінка:

- Читає `BASE_URL` (типово `https://sentimony.com`), `PERF_LABEL` (обов'язковий, напр. `netlify-prod`), `PERF_RUNS` (типово 5), `PERF_TIMEOUT` (типово 30000).
- Резолвить динамічні маршрути через `/api/*`, як це робить `web-debug.mjs`.
- Для кожної цілі виконує `PERF_RUNS` пар вимірювань:
  - **cold** — `bustUrl(url, randomUUID())`, `cache: 'no-store'`;
  - **warm** — той самий чистий URL двічі поспіль, зараховується друга відповідь.
- Метрики на кожне вимірювання: `ttfbMs` (від старту до резолву `fetch`, тобто до заголовків), `totalMs` (після дочитування тіла), `bytes`, `status`, `cacheState`, `age`.
- Асети (`assetTargets`) міряються методом `GET` із тими самими метриками; для `_xl` фіксуються байти, бо це найважчий елемент сторінки релізу.
- Між запитами пауза 250 ms, щоб не викликати rate limiting на `r2.dev`.
- Пише `docs/audits/data/<PERF_LABEL>.json`: `{ label, baseUrl, startedAt, runs, node, targets: [{ target, kind, cold: {...}, warm: {...} }] }`.
- Друкує markdown-таблицю в stdout.
- Exit code `1`, якщо будь-яка ціль дала не-2xx/3xx — інакше зламаний маршрут потрапить у baseline як «швидкий».

- [x] **Step 5: Додати npm-скрипт**

У `package.json`: `"perf:baseline": "node --env-file-if-exists=.env/.env --env-file-if-exists=.env/.env.local scripts/perf-baseline.mjs"`.

- [x] **Step 6: Прогнати локально**

Run: підняти сервер на 3100, потім `BASE_URL=http://localhost:3100 PERF_LABEL=local-smoke PERF_RUNS=2 npm run perf:baseline`
Expected: таблиця друкується, JSON створюється, exit 0. Артефакт `local-smoke` після перевірки видалити — він не є baseline.

- [x] **Step 7: Коміт**

`git add scripts/perf-baseline.mjs scripts/lib/perfStats.mjs tests/unit/perfStats.test.ts package.json && git commit -m "feat(scripts): add first-load performance baseline collector"`

---

### Task 3: Лабораторний збирач PageSpeed Insights (опційний)

**Files:**
- Modify: `scripts/perf-baseline.mjs`

- [x] **Step 1: Додати збирач**

Якщо `PSI_API_KEY` присутній і `BASE_URL` публічний (не `localhost`), для підмножини маршрутів (`/`, `/releases`, один `/release/<slug>`, `/artists`, один `/artist/<slug>`, `/tracks`) виконати запит до `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance`. Зберегти в JSON `psi: { performance, lcpMs, tbtMs, cls, fcpMs }`.

- [x] **Step 2: Обробити відсутність ключа**

Без `PSI_API_KEY` — надрукувати один рядок `psi: skipped (no PSI_API_KEY)` і продовжити. Помилка PSI (429/5xx) не валить прогін: пише `null` і йде далі. Мережеві заміри — основна метрика, PSI — довідкова.

- [x] **Step 3: Коміт**

`git add scripts/perf-baseline.mjs && git commit -m "feat(scripts): collect optional PageSpeed Insights metrics in baseline"`

**Відхилення (2026-08-10).** Окремого коміту не було: PSI-збирач написано одразу разом зі збирачем Task 2 і закомічено в `c61d939`. Практично PSI не спрацював — `PSI_API_KEY` не заданий, тож у baseline є лише мережеві метрики, лабораторних (LCP, TBT, CLS) немає.

---

### Task 4: Зняти baseline «до»

**Files:**
- Create: `docs/audits/2026-07-26-first-load-baseline-audit.md`, `docs/audits/data/netlify-prod.json`, `docs/audits/data/netlify-stage.json`
- Modify: `docs/audits/README.md`

- [x] **Step 1: `[A]` Прогін по проду**

Run: `BASE_URL=https://sentimony.com PERF_LABEL=netlify-prod PERF_RUNS=5 npm run perf:baseline`

- [x] **Step 2: `[A]` Прогін по stage**

Run: `BASE_URL=https://stage--sentimony-nuxt.netlify.app PERF_LABEL=netlify-stage PERF_RUNS=5 npm run perf:baseline`

- [x] **Step 3: `[A]` Зафіксувати контекст замірів**

У той самий аудит записати: дату/час із таймзоною, географію клієнта, тип з'єднання, версію Node, поточний `NUXT_CATALOG_SOURCE` (`supabase`), і те, що на момент замірів `sentimony.com` A вказує на `104.198.14.52`. Без цього числа «після» не будуть порівнюваними.

- [x] **Step 4: `[A]` Написати аудит**

`docs/audits/2026-07-26-first-load-baseline-audit.md` з таблицями cold/warm по кожному типу сторінки, окремим блоком по асетах (`content.sentimony.com`, `r2.dev`), і **порожніми колонками** `cloudflare-dns` та `cloudflare-workers`, які заповнять фази 1 і 3. Дописати рядок в індекс `docs/audits/README.md`.

- [x] **Step 5: `[A]` Виміряти розмір майбутнього Worker-бандла**

Run: `NITRO_PRESET=cloudflare_module npm run build` і зафіксувати розмір `.output/server` та gzip-розмір `index.mjs`.
Expected: якщо gzip > 1 MiB — це блокер для free-тарифу Workers, і про нього треба сказати користувачу **зараз**, до будь-яких дій з DNS. Записати число в аудит.

- [x] **Step 6: Коміт**

`git add docs/audits/2026-07-26-first-load-baseline-audit.md docs/audits/data docs/audits/README.md && git commit -m "docs(audits): record pre-migration first-load baseline"`

**Ворота:** далі не йти, поки baseline не закомічений.

---

## Фаза 1 — DNS на Cloudflare (request path не змінюється)

### Task 5: Підготовка й зниження TTL

**Files:**
- Create: `docs/audits/data/dns-inventory-2026-08-10.json`

- [x] **Step 1: `[A]` Зафіксувати повний інвентар зони машинно**

Зберегти в JSON результати запитів до `nsa1.srv53.net` по всіх іменах зони для типів `A`, `AAAA`, `CNAME`, `TXT`, `MX`, `CAA`, `NS`, `SOA`. Це — еталон, проти якого звірятиметься імпорт у Cloudflare.

**Поправка (2026-08-10).** Цей крок не можна виконати самим лише `dig`: AXFR на `srv53` закритий, а `dig` перевіряє тільки ті імена, які вже відомі. Список у первинній редакції плану (`@`, `www`, `content`, `img`, `jekyll`, `gatsby`, `irukanji`, `aquadeep`) дав 9 записів із 21 реального. Повний перелік дала лише панель DNS-хостингу. **Єдине надійне джерело інвентаря — панель, а не `dig`;** `dig` слугує для перевірки вже відомого списку. Фактичний стан зони: **21 запис на 20 іменах** — `@` (A + TXT), `www`, `content`, `img`, `jekyll`, `gatsby`, `irukanji`, `aquadeep`, `lookinglook`, `nuxt`, `vue` і `www.`-аліас до кожного з дев'яти піддоменів.

- [x] **Step 2: `[A→U]` Підготувати запит на зниження TTL**

Скласти точний перелік: які записи, з якого TTL (зараз 3600) на який (300). TTL живе в панелі DNS-хостингу (DNSHosting.org) — це поле `TTL` рівня зони, воно застосовується до всіх записів одразу, окремо кожен не редагується. `Negative TTL` (SOA, 1800 s) не чіпати: він керує лише кешуванням NXDOMAIN, а неіснуючих імен у міграції не з'являється. Делегування (`NS`) міняється в іншому місці — у реєстратора (Imena.ua), Task 7.

- [x] **Step 3: `[U]` Знизити TTL до 300 s**

- [x] **Step 4: `[A]` Перевірити пропагацію**

Run: `dig +noall +answer @nsa1.srv53.net sentimony.com A` та по кожному піддомену; переконатися, що TTL = 300.
Далі витримати ≥ 1 годину (стара TTL 3600), перш ніж міняти NS.

Результат 2026-08-10 14:47 UTC: усі 21 запис віддають `ttl=300`; 1.1.1.1, 8.8.8.8 і 9.9.9.9 теж повертають 300, тобто старі значення з їхнього кешу вийшли. Гейт відкрився о 15:47 UTC.

---

### Task 6: Зона в Cloudflare

- [x] **Step 1: `[U]` Додати зону `sentimony.com` у Cloudflare**

Cloudflare сам просканує наявні записи. **Не** підтверджувати перемикання NS на цьому кроці.

- [x] **Step 2: `[U]` Створити API token і покласти в `.env/.env.local`**

`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Дозволи — див. розділ «Що знадобиться від користувача».

- [x] **Step 3: `[A]` Звірити імпорт із еталоном**

Через Cloudflare API (`GET /zones/{id}/dns_records`) вивантажити записи й порівняти з `dns-inventory-2026-08-10.json`. Розбіжності виправити через API.

**Поправка (2026-08-10).** Автоскан Cloudflare знайшов 4 записи з 21 — покладатись на нього не можна взагалі. Довелось додавати через API двома заходами: 5 записів після звірки з `dig`-інвентарем і ще 12 після того, як панель показала повний список. Звірка мусить порівнювати **кількість** записів, а не лише збіг відомих: `expected records: 21 | cloudflare records: 21`. З 20 імен реально працюють 6 (`content`, `jekyll`, `gatsby`, `irukanji`, `aquadeep`, `www`); решта 14 віддають TLS-помилку SAN — переносяться як є (див. Step 5), чистка у фазі 4.

- [x] **Step 4: `[A]` Виставити режим проксі**

Усі записи — **DNS-only** (сіра хмара). Це принципово: у фазі 1 request path не змінюється, і заміри мусять лишитись такими самими.

- [x] **Step 5: `[A]` Ухвалити рішення щодо `img.sentimony.com`**

Запис зараз мертвий (TLS-помилка). Не переносити мовчки: перенести як є, позначивши в аудиті як відомий зламаний запис, і полагодити або видалити у фазі 4.

**Поправка (2026-08-10).** Так само мертві ще 13 імен, а не одне: `www.img`, `nuxt`, `vue`, `lookinglook` і всі `www.`-аліаси піддоменів. Усі віддають curl error 60 (SAN не покриває ім'я) **до** зміни NS. Це — зафіксований стан «до»; ті самі помилки після зміни делегування є очікуваними, а не регресом.

- [x] **Step 6: `[A]` Виставити SSL/TLS = Full (strict)**

Походження (Netlify) має валідний сертифікат, тому `Flexible` створив би зайвий ризик редирект-петель.

- [x] **Step 7: `[A→U]` Підготувати текст для зміни NS**

Виписати поточні 12 srv53-серверів і дві Cloudflare-адреси, які видала зона.

**Ворота:** `[U]` апрув перед зміною NS.

---

### Task 7: Перемикання делегування

- [ ] **Step 1: `[U]` Замінити NS у панелі Imena.ua на Cloudflare**

- [ ] **Step 2: `[A]` Моніторити пропагацію**

Run: перевіряти `dig +short sentimony.com NS @8.8.8.8` і `@1.1.1.1` кожні 10 хвилин; фіксувати момент, коли зона активна в Cloudflare API (`status: active`).

**Поправка (2026-08-10).** Знижений TTL прискорює пропагацію **записів**, але не делегування: у реєстрі `.com` NS-запис має фіксований TTL 172800 (48 год), і знизити його з панелі неможливо. Тому вікно співіснування двох наборів NS — до двох діб, і весь цей час частина резолверів ходитиме на `srv53`. Це безпечно рівно тому, що обидві зони віддають ідентичні дані; звідси й вимога не чіпати зону в DNSHosting до кінця фази.

- [ ] **Step 3: `[A]` Перевірити, що нічого не зламалось**

Run: `BASE_URL=https://sentimony.com npm run web-debug`
Run: `curl -sS -o /dev/null -w '%{http_code}\n'` по кожному піддомену з інвентаря.
Expected: усі коди — такі самі, як у Task 4 (включно з відомим `000` на `img`).

- [ ] **Step 4: `[A]` Повторити заміри**

Run: `BASE_URL=https://sentimony.com PERF_LABEL=cloudflare-dns PERF_RUNS=5 npm run perf:baseline`
Expected: медіана TTFB у межах ±15% від `netlify-prod`. Більше відхилення означає, що щось у path змінилось — розібратись до продовження.

- [ ] **Step 5: `[A]` Заповнити колонку в аудиті й закомітити**

`git add docs/audits/2026-07-26-first-load-baseline-audit.md docs/audits/data/cloudflare-dns.json && git commit -m "docs(audits): record first-load numbers after DNS move to Cloudflare"`

- [ ] **Step 6: `[A]` Видалити мертву Netlify DNS zone**

Через Netlify API видалити зону `592b340ecf321c3f9608c3c4`. Тільки після того, як Cloudflare активний і заміри збіглися.

- [ ] **Step 7: `[A]` Повернути TTL до 3600**

Через Cloudflare API або лишити `auto`.

**Відкат фази 1:** повернути 12 srv53-серверів у панелі Imena.ua. Зона в Imena.ua лишається недоторканою протягом усієї фази саме заради цього — не видаляти її раніше ніж через тиждень стабільної роботи.

---

## Фаза 2 — Runtime на Workers (прод не чіпається)

### Task 8: Подвійний заголовок кешу

**Files:**
- Modify: `server/utils/cachePolicy.ts:5-22`, `tests/unit/cachePolicy.test.ts`

- [x] **Step 1: Розширити тест**

У `tests/unit/cachePolicy.test.ts` додати очікування, що кожне з трьох правил містить `CDN-Cache-Control` з тим самим значенням, що й `Netlify-CDN-Cache-Control`, і що приватне правило зберігає `Cache-Control: private, no-store`.

- [x] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/cachePolicy.test.ts`
Expected: FAIL — `CDN-Cache-Control` відсутній.

- [x] **Step 3: Додати заголовок**

У `publicCacheRule`, `privateCacheRule`, `countCacheRule` додати `CDN-Cache-Control` з ідентичним значенням. `Netlify-CDN-Cache-Control` **не видаляти** — прод ще на Netlify.

- [x] **Step 4: Перевірити**

Run: `npx vitest run tests/unit/cachePolicy.test.ts && npm run typecheck`

- [x] **Step 5: Коміт**

`git add server/utils/cachePolicy.ts tests/unit/cachePolicy.test.ts && git commit -m "feat(cache): emit standard CDN-Cache-Control alongside the Netlify header"`

---

### Task 9: Платформо-нейтральний sitemap-gate

**Files:**
- Create: `server/utils/sitemapPolicy.ts`, `tests/unit/sitemapPolicy.test.ts`
- Modify: `nuxt.config.ts:173`

**Interfaces:**
- Produces: `isSitemapEnabled(env: Record<string, string | undefined>) => boolean`.

- [x] **Step 1: Написати падаючий тест**

- `{ NUXT_SITEMAP_ENABLED: 'false' }` → `false`.
- `{ NUXT_SITEMAP_ENABLED: 'true' }` → `true`.
- `{}` → `true` (типово ввімкнено).
- Зворотна сумісність із Netlify: `{ URL: 'https://stage--sentimony-nuxt.netlify.app' }` → `false`; `{ CONTEXT: 'deploy-preview' }` → `false`. Явний `NUXT_SITEMAP_ENABLED` має пріоритет над обома.

- [x] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/sitemapPolicy.test.ts`

- [x] **Step 3: Реалізувати `isSitemapEnabled`**

- [x] **Step 4: Підключити в `nuxt.config.ts`**

`enabled: isSitemapEnabled(process.env)` замість інлайн-умови; додати імпорт поруч із наявними `buildApiRouteRules` / `buildNoindexRouteRules`.

- [x] **Step 5: Перевірити**

Run: `npx vitest run tests/unit/sitemapPolicy.test.ts && npm run typecheck`

- [x] **Step 6: Коміт**

`git add server/utils/sitemapPolicy.ts tests/unit/sitemapPolicy.test.ts nuxt.config.ts && git commit -m "refactor(sitemap): gate sitemap on an explicit env flag instead of Netlify build vars"`

---

### Task 10: Редиректи в Nitro

Edge-функція `redirects.ts` — частина контракту сайту; вона переїжджає в код, покривається тестами і починає працювати також локально.

**Files:**
- Create: `server/utils/legacyRedirects.ts`, `server/middleware/legacyRedirects.ts`, `tests/unit/legacyRedirects.test.ts`
- Modify: `netlify.toml` (пізніше, у Task 14)

**Interfaces:**
- Produces: `resolveLegacyRedirect(pathname: string) => string | null`.

- [x] **Step 1: Написати падаючий тест, який фіксує поведінку edge-функції один-в-один**

Кейси прямо з `netlify/edge-functions/redirects.ts` і коментарів-тестів у `netlify.toml`:

| вхід | очікується |
|---|---|
| `/sencd097.htm` | `/sencd097` |
| `/artists.htm` | `/artists` |
| `/events.html` | `/events` |
| `/index.htm` | `/` |
| `/index.html` | `/` |
| `/artists/index.htm` | `/artists/` |
| `/events/index.html` | `/events/` |
| `/login` | `/signin` |
| `/login/` | `/signin` |
| `/release/va-futured-vol-1/googleplay` | `/release/va-futured-vol-1/youtubemusic` |
| `/release/zymosis-nichna/googleplaymarket` | `/release/zymosis-nichna/youtubemusic` |
| `/releases` | `null` |
| `/release/va-fantazma/spotify` | `null` |

- [x] **Step 2: Запустити тест і переконатися, що він падає**

Run: `npx vitest run tests/unit/legacyRedirects.test.ts`

- [x] **Step 3: Реалізувати `resolveLegacyRedirect`**

Портувати три гілки з edge-функції. `console.log` з ANSI-кольорами не переносити.

- [x] **Step 4: Підключити middleware**

`server/middleware/legacyRedirects.ts`: викликати `resolveLegacyRedirect(getRequestURL(event).pathname)`, за не-null — `sendRedirect(event, target, 301)`.

- [x] **Step 5: Перевірити наскрізно**

Run: підняти сервер на 3100 і `curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3100/sencd097.htm` та решту кейсів.
Expected: `301` і правильна ціль для кожного; `/releases` — `200`.

**Поправка (2026-08-10).** `/release/<slug>/spotify` наскрізно віддає **не `200`, а `301` на `open.spotify.com/...`** — це штатний вихідний лінк застосунку, який існував і до цієї задачі. У Step 1 очікування `null` стосується чистої функції `resolveLegacyRedirect` і лишається правильним; у наскрізній перевірці критерій інший — код і ціль мусять збігатися з тими, що були **до** підключення middleware. Так само `/release/<slug>/googleplay` не редиректить на Google Play напряму: middleware переписує шлях на `/youtubemusic`, а вже той обробник веде на зовнішній лінк.

- [x] **Step 6: Коміт**

`git add server/utils/legacyRedirects.ts server/middleware/legacyRedirects.ts tests/unit/legacyRedirects.test.ts && git commit -m "feat(server): move legacy redirects from the Netlify edge function into Nitro"`

---

### Task 11: Wrangler і preset

**Files:**
- Create: `wrangler.jsonc`, `.gitignore` доповнення (`.wrangler/`)
- Modify: `nuxt.config.ts:80-84`, `package.json`

- [x] **Step 1: Зробити preset керованим через env**

У `nuxt.config.ts`: `preset: process.env.NITRO_PRESET || 'netlify'`. Дефолт лишається `netlify`, поки прод на Netlify — це навмисно, щоб фаза 2 не могла випадково змінити прод-збірку.

- [x] **Step 2: Створити `wrangler.jsonc`**

```jsonc
{
  "name": "sentimony-nuxt",
  "main": ".output/server/index.mjs",
  "compatibility_date": "2026-07-26",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".output/public", "binding": "ASSETS" },
  "observability": { "enabled": true }
}
```

- [x] **Step 3: Додати npm-скрипти**

```
"build:cf": "NITRO_PRESET=cloudflare_module npm run build",
"deploy:cf:stage": "npm run build:cf && npx -y wrangler@4 versions upload",
"deploy:cf:prod": "npm run build:cf && npx -y wrangler@4 deploy"
```

- [x] **Step 4: Додати `.wrangler/` у `.gitignore`**

- [x] **Step 5: Перевірити, що збірка Netlify не зачеплена**

Run: `npm run build` (без `NITRO_PRESET`) і переконатися, що вихід — Netlify-функції, як раніше.

- [x] **Step 6: Коміт**

`git add wrangler.jsonc nuxt.config.ts package.json .gitignore && git commit -m "build: add Cloudflare Workers target without changing the default preset"`

---

### Task 12: Перший деплой на Workers і перевірка припущень

Тут перевіряються три припущення, які спека свідомо не прийняла на віру.

- [ ] **Step 1: `[A]` Задеплоїти прев'ю-версію**

Run: `npm run deploy:cf:stage`
Виставити секрети Worker-а через `npx wrangler@4 secret put` для `NUXT_SUPABASE_SECRET_KEY`, `NUXT_FIREBASE_DB_SECRET`, і vars для `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_CATALOG_SOURCE=supabase`, `NUXT_SITEMAP_ENABLED=false`.

- [ ] **Step 2: `[A]` Прогнати `web-debug` по прев'ю-URL**

Run: `BASE_URL=<preview-url> npm run web-debug`
Expected: усі маршрути здорові. Будь-який 500 тут — блокер фази.

- [ ] **Step 3: `[A]` Перевірити припущення №1 — розмір і холодний старт**

Зафіксувати gzip-розмір скрипта і cold-TTFB. Порівняти з числом із Task 4 Step 5.

- [ ] **Step 4: `[A]` Перевірити припущення №2 — чи шанується `CDN-Cache-Control`**

Run: двічі запитати `<preview-url>/api/releases` і подивитись `cf-cache-status`.
Expected: `MISS`, потім `HIT`. Якщо `DYNAMIC`/`BYPASS` — заголовок не працює на цьому тарифі; тоді додати Cache Rule на `/api/*` через Cloudflare API і зафіксувати це рішення в аудиті.

- [ ] **Step 5: `[A]` Перевірити припущення №3 — поведінка Nitro-кешу**

Порівняти cold і warm TTFB на `/api/releases` і на сторінці релізу. Якщо cold стабільно гірший за Netlify більш ніж на 30%, прив'язати KV-неймспейс через `nitro.cloudflare.wrangler` і перевести Nitro-сторедж на нього окремим кроком.

- [ ] **Step 6: `[A]` Заміри прев'ю**

Run: `BASE_URL=<preview-url> PERF_LABEL=cloudflare-preview PERF_RUNS=5 npm run perf:baseline`

- [ ] **Step 7: `[A]` Записати результати перевірок в аудит і закомітити**

---

### Task 13: WAF-правило замість `blocking.ts`

- [ ] **Step 1: `[A]` Створити WAF custom rule через Cloudflare API**

Умова, еквівалентна регуляркам edge-функції: `http.request.uri.path` матчить `\.php`, або `(wp-|wp/|wordpress)`, або `/files/|/admin/|/uploads/` (усе case-insensitive). Дія — `block`.

- [ ] **Step 2: `[A]` Зафіксувати правило в репозиторії**

Створити `cloudflare/waf-rules.md` з точним виразом і `curl`-командою відтворення. Правило живе в дашборді, але його джерело істини — репозиторій.

- [ ] **Step 3: `[A]` Перевірити на прев'ю-хості**

Run: `curl -sS -o /dev/null -w '%{http_code}\n'` по восьми тестових URL із коментарів у `netlify.toml`.
Expected: усі заблоковані.

- [ ] **Step 4: Коміт**

`git add cloudflare/waf-rules.md && git commit -m "docs(cloudflare): record the WAF rule replacing the Netlify blocking edge function"`

---

## Фаза 3 — Cutover

### Task 14: Stage на власному піддомені

- [ ] **Step 1: `[A]` Додати `stage.sentimony.com` як Worker custom domain**

- [ ] **Step 2: `[A]` Повний прогін**

Run: `BASE_URL=https://stage.sentimony.com npm run web-debug`
Run: `npx playwright test` (e2e не в CI, але перед cutover прогнати обов'язково)
Run: `BASE_URL=https://stage.sentimony.com PERF_LABEL=cloudflare-stage PERF_RUNS=5 npm run perf:baseline`

- [ ] **Step 3: `[A]` Перевірити функціональність, яку не ловить `web-debug`**

Логін/реєстрація Supabase, встановлення cookie `sentimony_anon_id`, накопичувальний лайк (`increment_like`), завантаження аватара, `/sitemap.xml` (має бути вимкнений на stage), `/robots.txt`, редиректи з Task 10, блокування з Task 13, реєстрація service worker.

- [ ] **Step 4: `[A]` Скласти порівняльну таблицю й винести вердикт**

Заповнити колонку `cloudflare-workers` в аудиті. Якщо cold-TTFB гірший за Netlify — зафіксувати це відкрито; рішення про cutover ухвалює користувач на підставі чисел, а не наміру.

**Ворота:** `[U]` апрув cutover на підставі таблиці.

---

### Task 15: Перемикання прода

- [ ] **Step 1: `[A]` Знизити TTL apex і `www` до 60 s, витримати годину**

- [ ] **Step 2: `[A]` Перемкнути `sentimony.com` і `www` на Worker**

Cloudflare custom domain для Worker-а; записи стають проксійованими (оранжева хмара). Netlify-сайт `sentimony-nuxt` **не видаляти** — він лишається як ціль відкату.

- [ ] **Step 3: `[A]` Негайна перевірка**

Run: `BASE_URL=https://sentimony.com npm run web-debug`
Run: `curl -I https://www.sentimony.com` — має лишитись 301 на apex.
Expected: будь-який збій → негайний відкат (Step 7) без обговорення.

- [ ] **Step 4: `[A]` Заміри «після»**

Run: `BASE_URL=https://sentimony.com PERF_LABEL=cloudflare-prod PERF_RUNS=5 npm run perf:baseline`

- [ ] **Step 5: `[A]` Спостереження 48 годин**

Повторити заміри через 1, 6, 24 і 48 годин; стежити за Workers observability на предмет помилок і CPU-таймаутів.

- [ ] **Step 6: `[A]` Фіналізувати аудит**

Заповнити всі колонки; окремим розділом — «що виміряно і що з цього випливає для наступних кроків оптимізації». Це і є та відповідь, заради якої знімався baseline.

- [ ] **Step 7: Відкат (якщо знадобиться)**

Повернути apex і `www` на Netlify (`sentimony.com` A `75.2.60.5`, `www` CNAME `sentimony-nuxt.netlify.app`), режим DNS-only. За TTL 60 s відновлення — хвилини. Worker лишається живим на `stage.sentimony.com` для розбору.

---

### Task 16: Чистка після стабілізації

Виконується **не раніше ніж через тиждень** стабільної роботи.

- [ ] **Step 1: Змінити дефолтний preset**

`nuxt.config.ts`: дефолт стає `cloudflare_module`.

- [ ] **Step 2: Прибрати Netlify-специфіку**

Видалити `netlify/edge-functions/` (усі чотири файли, включно з двома закоментованими), `netlify.toml`, `netlify/tsconfig.json`, npm-скрипти `deploy:stage`/`deploy:prod`/`netlify:*` і `typecheck:ts7`. Прибрати `Netlify-CDN-Cache-Control` із `server/utils/cachePolicy.ts` і відповідні очікування з тесту. Оновити коментар у `app/utils/sanitizeHtml.ts:80`, бо обмеження CJS-lambda більше не діє.

- [ ] **Step 3: Оновити CI**

У `.github/workflows/web-debug.yml` прибрати крок `typecheck:ts7` і переписати коментар-преамбулу: `node-server` тепер розходиться з продом інакше (Workers runtime, не CJS-lambda).

- [ ] **Step 4: Оновити документацію**

`CLAUDE.md` (єдине джерело настанов; `AGENTS.md` лише вказує на нього): команди деплою, розділ про Netlify Edge Functions → Cloudflare, `Netlify-CDN-Cache-Control` → `CDN-Cache-Control`, згадки про Netlify serverless у Project Overview. `docs/initiatives/cloudflare-domain.md` → `- Status: Implemented` **і** той самий статус у рядку `docs/ROADMAP.md`, потім перенести запис у `docs/COMPLETED.md`. Звірити: `npm run docs:check`.

- [ ] **Step 5: Перевірити**

Run: `npm run typecheck && npm run test:unit && npm run verify:pwa`
Run: `BASE_URL=https://sentimony.com npm run web-debug`

- [ ] **Step 6: Коміт**

---

## Фаза 4 — Опційні покращення (окремі ворота)

### Task 17: `audio.sentimony.com` замість `r2.dev`

735 значень `audio_url` вказують на небрендований `pub-*.r2.dev`, який має власні rate limits і слабку кешованість. Після того, як зона в Cloudflare, бакету можна дати кастомний домен у тій самій зоні.

- [ ] **Step 1: `[A]` Прив'язати custom domain до R2-бакета, перевірити доступність і кешування**
- [ ] **Step 2: `[A]` Заміряти різницю на одному файлі** (`perf-baseline` по обох URL)
- [ ] **Step 3: `[U]` Апрув на підставі виміряної різниці** — без неї переписувати 735 значень не варто
- [ ] **Step 4: `[A]` Оновити `server/data/sentimony-db.yml`, `npm run convert:yml`**
- [ ] **Step 5: `[U]` або `[A]` за явним проханням: `npm run sync:supabase`**
- [ ] **Step 6: `[A]` Оновити `scripts/lib/routes.mjs` і `scripts/sync-track-audio.mjs`**

### Task 18: `content` і `img`

- [ ] **Step 1: `[A]` Полагодити або видалити `img.sentimony.com`** — рішення після перевірки, чи є на нього живі посилання поза каталогом
- [ ] **Step 2: `[A]` Увімкнути проксі Cloudflare для `content.sentimony.com`** і заміряти вплив на TTFB картинок; лишити ввімкненим тільки якщо числа покращились
- [ ] **Step 3: `[A]` Заміряти й зафіксувати** — 667 посилань каталогу ведуть на цей хост, він прямо впливає на LCP

---

## Матриця відкату

| фаза | тригер | дія | час відновлення |
|---|---|---|---|
| 1 | будь-який піддомен недоступний | повернути 12 srv53-NS у Imena.ua | до 1 год (TTL 300 + пропагація NS) |
| 2 | падіння прев'ю | нічого не робити — прод не зачеплений | 0 |
| 3 | 5xx, регресія TTFB, зламаний auth | apex+`www` назад на Netlify, DNS-only | хвилини (TTL 60 s) |
| 4 | зламане аудіо | повернути `r2.dev` у YAML + resync | до 1 год |

## Фінальний чек-лист

- [ ] Baseline «до» закомічений раніше за будь-яку зміну інфраструктури
- [ ] Заміри після фази 1 збіглися з baseline у межах ±15%
- [ ] Три припущення (розмір бандла, `CDN-Cache-Control`, Nitro-кеш) перевірені числами, а не прийняті на віру
- [ ] Усі маршрути `web-debug` здорові на Workers до перемикання DNS
- [ ] Playwright e2e пройдений на `stage.sentimony.com`
- [ ] Auth, лайки, аватар, service worker перевірені вручну
- [ ] Редиректи й блокування відтворені та покриті тестами до видалення edge-функцій
- [ ] Аудит містить заповнену таблицю «до / після» і розділ про наступні кроки оптимізації
- [ ] `CLAUDE.md`, `docs/ROADMAP.md` і `docs/COMPLETED.md` оновлені, `npm run docs:check` зелений
- [ ] Netlify-сайт `sentimony-nuxt` не видалений щонайменше тиждень після cutover
