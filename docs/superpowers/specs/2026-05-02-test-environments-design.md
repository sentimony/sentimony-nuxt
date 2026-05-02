# Test Environments Design — supabase-stage / supabase-prod + migrations

**Status:** Design (ready for implementation plan).
**Author/owner:** ihororlovskyi
**Date:** 2026-05-02
**Tracker:** Unblocks `docs/superpowers/plans/2026-05-01-playwright-e2e.md` Task 4.

## Goal

Розділити робоче середовище Sentimony на три деплой-env (Local, Stage, Prod), що шерять два Supabase-проєкти (`supabase-stage` для local + Netlify deploy-preview/branch; `supabase-prod` для Netlify production). Додати схему-міграції як єдине джерело правди для structure обох баз. Розблокувати Playwright Task 4 безпечним створенням test-users у `supabase-stage`.

## Why now

1. **Поточний блокер:** Playwright `globalSetup` має створювати реального user-а у Supabase. У теперішньому стані `.env.local` вказує на прод — створення/teardown під час прогону тестів несе ризик orphan-user-ів у проді.
2. **E-commerce roadmap:** запланований магазин фізичних релізів і мерчу додасть 5-10 нових таблиць (products, orders, order_items, payments, addresses, inventory) з активними мутаціями. Запровадження міграцій зараз, коли БД має тільки `*_likes` таблиці + auth, коштує годину; зробити це після першого schema-drift-у — дні дебагу.
3. **Manual deploy → automated pipeline:** локально → stage → prod є базою для майбутнього GitHub Actions CI (відкладено в Roadmap R1). Без env-розділення CI неможливий.

## Non-goals (свідомо НЕ робимо у цьому спеку)

- GitHub Actions / CI workflows (Roadmap R1).
- Локальний Supabase через Docker (`supabase start`) — Roadmap R2.
- Третій ізольований проєкт `supabase-shop` для PCI вимог — Roadmap R3.
- Cross-browser E2E (Firefox/WebKit) — Roadmap R5.
- Visual regression (`toHaveScreenshot`) — Roadmap R6.
- Test data factory (динамічне створення `releases` row у globalSetup) — Roadmap R7.
- Per-test users / паралелізм Playwright — Roadmap R8.
- Refactor `scripts/sync-supabase.mjs` за межами додавання `--subset=stage` прапорця.

## Architecture

### Three deployment environments / two Supabase projects

```
┌─────────────────┬──────────────────┬──────────────────┐
│  Local (dev)    │  Stage           │  Prod            │
│                 │  (Netlify        │  (Netlify        │
│                 │  deploy-preview, │  production,     │
│                 │  branch-deploy)  │  master)         │
├─────────────────┼──────────────────┼──────────────────┤
│ .env.stage      │ Netlify env-vars │ Netlify env-vars │
│ npm run dev     │ (deploy-preview  │ (production      │
│ npm run test:e2e│  context)        │  context)        │
├─────────────────┴──────────────────┼──────────────────┤
│       supabase-stage               │  supabase-prod   │
│       (новий проєкт, free tier)    │  (існуючий)      │
└────────────────────────────────────┴──────────────────┘
                  ▲                            ▲
                  │                            │
                  └─ supabase/migrations/*.sql ┘
                       (single source of truth для schema)

  Firebase Realtime DB ── npm run sync:supabase:{stage,prod} ──▶ обидва Supabase
                          (Firebase лишається read-only джерелом контенту)
```

### Invariants

1. `.env.stage` — щоденний робочий конфіг. `npm run dev`, `npm run test:e2e` дефолтно ходять у `supabase-stage`.
2. `.env.prod` — escape hatch для дебагу прод-багу або `sync:supabase:prod`. Жоден стандартний скрипт без явного `:prod` суфіксу не пише у прод.
3. Netlify deploy-preview і branch-deploy → `supabase-stage`. Netlify production → `supabase-prod`. Налаштовується через Netlify UI per-context env-vars (Variant A).
4. Schema живе у `supabase/migrations/`. Прод-schema = всі міграції до останньої. Stage-schema = те саме після `supabase db push`. Жодних ручних змін через Supabase UI.
5. Likes-таблиці у stage завжди порожні після `sync:supabase:stage` — це user-data, не контент.
6. Firebase синк не змінюється; обидва Supabase проєкти заливають з нього через `sync:supabase:{stage,prod}`.

### Data subset для supabase-stage

Curated контент, щоб sync був швидким і CRUD-сценарії на stage мали достатньо матеріалу:

- **artists**: топ 10 за кількістю прив'язаних релізів (автоматичний критерій, без ручного whitelist-у).
- **releases**: 10 найсвіжіших за `date` з `visible: true`.
- **tracks**: усі треки прив'язані до цих 10 релізів (FK-цілісність).
- **events / videos / playlists / friends**: усі (їх небагато, не варто фільтрувати).
- **likes-таблиці** (`release_likes`, `artist_likes`, `track_likes`, `event_likes`, `playlist_likes`, `video_likes`): порожні.

## Components — implementation breakdown

### Section 1: supabase-stage project + bootstrap migration + curated sync

**1.1 Створення проєкту**
- На supabase.com створити `sentimony-stage` (free tier, регіон як у prod).
- Зберегти `URL`, `anon key`, `service_role key`.

**1.2 Migration baseline**
- Встановити Supabase CLI: `brew install supabase/tap/supabase`.
- У корені: `supabase init` → створює `supabase/config.toml` + `supabase/migrations/`.
- Залінкувати на prod: `supabase link --project-ref <prod-ref>`.
- `supabase db pull` → витягує поточну prod-schema у `supabase/migrations/<timestamp>_remote_schema.sql`.
- Залінкувати на stage: `supabase link --project-ref <stage-ref>`.
- `supabase db push` → застосовує baseline до stage.

**1.3 Curated sync**
- Розширити `scripts/sync-supabase.mjs` (або винести у новий `scripts/sync-supabase-stage.mjs` залежно від поточної структури — рішення під час імплементації) щоб приймав `--subset=stage`.
- Логіка фільтрації:
  - artists: SQL-сортування по `count(releases.artist_id)` desc, limit 10.
  - releases: `where visible = true order by date desc limit 10`.
  - tracks: `where release_slug in (selected releases)`.
  - events / videos / playlists / friends: без фільтрації.
  - likes-таблиці: skip.
- npm-script: `"sync:supabase:stage": "node --env-file=.env.stage scripts/sync-supabase.mjs --subset=stage"`.

**1.4 Re-sync workflow**
- Перед роботою над контент-фічею (особливо магазин — нові FK).
- Після кожної schema-міграції (старі rows можуть бути несумісні).
- НЕ на кожен PR (дрейф ОК для тестового env).

### Section 2: env-files + npm-scripts

**2.1 Файлова структура**

`.env.local` видаляється після верифікації що `.env.prod` містить ті самі значення. Натомість:

- `.env.stage` — щоденна робота + Playwright (gitignored).
- `.env.prod` — escape hatch (gitignored).
- `.env.example.stage` — committed reference з ключами без значень.
- `.env.example.prod` — committed reference з ключами без значень.

`.env.stage`:
```
NUXT_PUBLIC_SUPABASE_URL=https://<stage-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<stage-anon-key>
NUXT_SUPABASE_SECRET_KEY=<stage-service-role-key>
E2E_TEST_RELEASE_SLUG=<один зі slug-ів синкнутих 10 релізів, опційно>
```

`.env.prod`:
```
NUXT_PUBLIC_SUPABASE_URL=https://<prod-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<prod-anon-key>
NUXT_SUPABASE_SECRET_KEY=<prod-service-role-key>
```

`.gitignore` додатково:
```
.env.stage
.env.prod
.playwright-fixture.json
```

**2.2 npm-scripts**

```jsonc
{
  "dev": "node --env-file=.env.stage node_modules/.bin/nuxt dev --host",
  "dev:prod": "node --env-file=.env.prod node_modules/.bin/nuxt dev --host",

  "build": "nuxt build",
  "generate": "nuxt generate",
  "preview": "nuxt preview",
  "postinstall": "nuxt prepare",

  "sync:firebase": "firebase database:set / public/data/sentimony-db-export.json -P sentimony-db -f",
  "sync:supabase:stage": "node --env-file=.env.stage scripts/sync-supabase.mjs --subset=stage",
  "sync:supabase:prod":  "node --env-file=.env.prod  scripts/sync-supabase.mjs",

  "deploy:stage": "netlify deploy --alias stage --context deploy-preview",
  "deploy:prod":  "netlify deploy --prod",

  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "node --env-file=.env.stage node_modules/.bin/playwright test",
  "test:e2e:ui": "node --env-file=.env.stage node_modules/.bin/playwright test --ui",
  "test:e2e:headed": "node --env-file=.env.stage node_modules/.bin/playwright test --headed"
}
```

Ключові інверсії від поточного:
- `dev` за замовчуванням → `supabase-stage` (раніше — прод).
- `sync:supabase` (без суфіксу) видалений — тільки `:stage` / `:prod` з явним наміром.
- `test:e2e` обовʼязково через `.env.stage` — це знімає блокер з playwright-e2e плану.

### Section 3: Netlify per-context env-vars

**3.1 Routing matrix**

| Context | Supabase project |
|---|---|
| `production` (master) | `supabase-prod` |
| `deploy-preview` (PR) | `supabase-stage` |
| `branch-deploy` (інші гілки, включно з alias `stage`) | `supabase-stage` |

**3.2 Підхід (Variant A — все через Netlify UI)**

1. Netlify Site settings → Environment variables.
2. Для кожної з трьох змінних (`NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY`):
   - «Different value for each deploy context».
   - `Production` → значення з `.env.prod`.
   - `Deploy Previews` → значення з `.env.stage`.
   - `Branch deploys` (All) → те саме що Deploy Previews.
3. `netlify.toml` НЕ модифікується — anon-ключі і service-role лежать в одному місці (Netlify UI), щоб уникнути dual-state.

**3.3 Verification procedure**

1. **Stage:** запушити PR → відкрити deploy-preview URL → DevTools → Network → request на `*.supabase.co` має йти на stage-ref.
2. **Prod:** після merge у master → перевірити `sentimony.com` → запит йде на prod-ref.
3. **Manual smoke proти прода:** після `npm run deploy:prod` запустити мінімальний read-only тест (відкрити `/releases`, перевірити що список не порожній). НЕ логінитись, НЕ лайкати — це делегується E2E на stage.

### Section 4: Playwright unblock — дельти до `2026-05-01-playwright-e2e.md`

| Крок плану | Зміна |
|---|---|
| Task 1 Step 1 (npm i Playwright) | без змін |
| Task 1 Step 3 (npm-scripts) | замість `playwright test` → `node --env-file=.env.stage node_modules/.bin/playwright test` (вже у Section 2.2) |
| Task 2 Step 2 (`global-setup.ts`) | `loadDotenv({ path: '.env.local' })` → `loadDotenv({ path: '.env.stage' })` |
| Task 2 Step 3 (`global-teardown.ts`) | те саме |
| Task 2 Step 5 | видалити WARNING-блок про прод. Замінити на: «globalSetup створить test-user у supabase-stage. Перевір `cat .playwright-fixture.json` після прогону» |
| Task 4 Step 2 | `E2E_TEST_RELEASE_SLUG` додавати у `.env.stage`, не `.env.local`. Slug береться з результату `npm run sync:supabase:stage` |
| Task 6 Step 2 | orphan-перевірка тепер на stage: `select * from auth.users where email like 'playwright-%'` у `supabase-stage` |
| Notes «Production-Supabase warning» | видалити повністю. Замінити на «Test-Supabase invariant: `.env.stage` має вказувати на supabase-stage. Перевірити через DevTools network → URL має містити stage-ref» |
| Notes «CI scaffold» | без змін; майбутній GitHub Actions використовуватиме той самий стек stage-secrets |

**Детермінований slug у `tests/e2e/helpers/seed-data.ts`:**
```ts
export const E2E_FIXED_RELEASE_SLUG = '<обрати slug з 10 синкнутих, після першого sync:supabase:stage>'
```

`login-and-like.spec.ts`:
```ts
import { E2E_FIXED_RELEASE_SLUG } from './helpers/seed-data'
const RELEASE_SLUG = process.env.E2E_TEST_RELEASE_SLUG ?? E2E_FIXED_RELEASE_SLUG
test.skip(!RELEASE_SLUG, '...')
```

Логіка: env-var гнучкий для CI, але дефолт дозволяє новому контриб'ютору запустити `npm run test:e2e` після `npm run sync:supabase:stage` без додаткової конфігурації.

### Section 5: Migration workflow + CLAUDE.md updates

**5.1 Schema-change workflow (стандартизована послідовність)**

```
1. supabase migration new <name>          # створює <ts>_<name>.sql у supabase/migrations/
2. Заповнити SQL вручну (CREATE/ALTER/...)
3. supabase link --project-ref <stage-ref>
4. supabase db push                        # apply до stage
5. npm run dev                             # smoke
6. npm run sync:supabase:stage             # якщо потрібен новий contentType
7. npm test && npm run test:e2e
8. git add supabase/migrations/<ts>_<name>.sql && commit
9. supabase link --project-ref <prod-ref>
10. supabase db push                       # apply до prod
11. npm run deploy:prod
```

Failure recovery:
- Stage broken після push → `supabase db reset --linked` (зносить stage, реаплаїть всі міграції) → `npm run sync:supabase:stage`.
- Prod НЕ зачіпається до кроку 10. Якщо помилка на 9-10 — видалити migration файл, виправити, повторити.

**5.2 CLAUDE.md updates**

Замінити блок «Commands» (рядки 17-33):
```bash
npm run dev                   # → supabase-stage, з --host (default workflow)
npm run dev:prod              # escape hatch: дебаг прод-багу
npm run build
npm run deploy:stage
npm run deploy:prod
npm test
npm run test:watch
npm run test:e2e              # → supabase-stage, обов'язково
npm run sync:firebase
npm run sync:supabase:stage   # 10 топ-артистів + 10 свіжих релізів + всі events/videos/playlists/tracks
npm run sync:supabase:prod    # повний sync, тільки для прода
supabase migration new <name> # нова schema-міграція
supabase db push              # apply до залінкованого проєкту
```

`.env.stage` (default) і `.env.prod` (escape hatch) обидва мають містити: `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY`. Опційно у `.env.stage`: `RELEASES_SOURCE=supabase`, `E2E_TEST_RELEASE_SLUG=...`.

Додати нову секцію `## Environments`:
- Опис двох Supabase-проєктів (`supabase-stage` / `supabase-prod`), де які env-vars живуть, як Netlify per-context routing працює, посилання на цей spec.
- 3-environment matrix: Local / Stage (Netlify deploy-preview + branch-deploy) / Prod (sentimony.com, Netlify production).

Додати нову секцію `## Database migrations`:
- Workflow з 5.1 вище.
- Inviolable rule: schema-changes виключно через `supabase/migrations/`. Зміни через Supabase UI не дозволені.
- Команди для stage-reset, для роллбеку.

Доповнити Security-блок:
- `.env.prod` ніколи не комітити — `service_role` key дає повний доступ до БД.
- `sync:supabase:prod` запускати свідомо — захист `--confirm` прапорцем винесено у Roadmap R4.

### Section 6: Roadmap (defer-list)

Свідомо НЕ робимо зараз; кожен пункт — окремий план у `docs/superpowers/plans/` коли тригер спрацює.

| # | Що | Тригер | Час |
|---|---|---|---|
| R1 | GitHub Actions CI (PR → unit + e2e на stage; merge → prod + smoke) | Перший зовнішній контриб'ютор АБО PR що вимагав би тестів | 3-4 год |
| R2 | Локальний `supabase start` (Docker) | Інтернет-залежність ламає DX АБО Supabase rate limits роблять тести flaky | 2-3 год |
| R3 | Окремий `supabase-shop` проєкт | Shop-фіча матиме PCI/payments-вимоги, що потребують ізоляції | 2-3 год + перепланування |
| R4 | `sync:supabase:prod --confirm` safety prompt | Перший випадковий запуск без `--confirm` АБО проактивний захист | 30 хв |
| R5 | Cross-browser E2E (Firefox + WebKit projects) | Smoke виросте до 10+ тестів і захоче CI matrix | 1 год |
| R6 | Visual regression (`expect(page).toHaveScreenshot()`) | DESIGN.md заживе паралельно з кодом, потрібен захист від CSS-регресій | 2 год |
| R7 | Test data factory (releases у globalSetup замість fixed slug) | Поточний підхід «1 fixed slug» обмежує паралелізм/сценарії | 1-2 год |
| R8 | Per-test users + `fullyParallel: true`, workers: 4 | E2E-suite виросте, час прогону >2 хв | 1 год |

## Data flow summary

```
Firebase Realtime DB (read-only джерело контенту)
       │
       ├──── npm run sync:supabase:prod (full)  ──▶ supabase-prod
       └──── npm run sync:supabase:stage (subset) ──▶ supabase-stage
                                                          │
                                                          ▼
                            ┌───────────────────────────────────────────┐
                            │  npm run dev / test:e2e (через .env.stage) │
                            │  Netlify deploy-preview / branch-deploy    │
                            └───────────────────────────────────────────┘
                                                          
supabase/migrations/*.sql (single source of truth)
       │
       ├── supabase db push (link → stage-ref) ──▶ supabase-stage schema
       └── supabase db push (link → prod-ref)  ──▶ supabase-prod schema
```

## Error handling

- **`.env.stage` відсутній** при `npm run dev` → Node `--env-file` падає з explicit повідомленням → onboarding-крок «скопіюй з `.env.example.stage` і заповни».
- **Stage-Supabase недоступний** під час Playwright globalSetup → setup кидає `Error: E2E setup failed to create user`. Плановий behavior — fast-fail, не run-нути тести проти невалідної БД.
- **Schema drift між stage і prod** — детектиться через `supabase db diff --linked` (ad-hoc команда; додавання у workflow як post-migrate check — Roadmap-кандидат).
- **Орфан test-users у stage** — нормальний шум, чиститься періодично руками: `select count(*) from auth.users where email like 'playwright-%'`. Не блокує тести.
- **`sync:supabase:stage` падає на півдорозі** → stage у частково заповненому стані. Recovery: `supabase db reset --linked` → re-sync.

## Testing of this design

Спек сам по собі тестується через:

1. **Playwright e2e (план `2026-05-01-playwright-e2e.md`)** — після виконання цього спеку всі 3 тести мають пройти проти `supabase-stage` без warnings.
2. **Vitest** — без змін; цей спек не чіпає server-route тестів.
3. **Manual verification** — Section 3.3 procedure (DevTools network) для prod / stage routing.
4. **Migration round-trip** — після `db push` на stage запустити `npm run dev`, перевірити що `/releases`, `/profile`, like-cycle працюють. Якщо так — schema-сумісність підтверджена.

## Sequencing та dependencies

```
[Implementation plan з цього спеку]
  ├─ Section 1 (supabase-stage + migration + curated sync)   ← блокатор для всього
  ├─ Section 2 (.env.stage / .env.prod + npm-scripts)        ← блокатор для Playwright
  ├─ Section 3 (Netlify per-context vars)                    ← можна паралельно з 4
  ├─ Section 4 (Playwright дельти — НЕ виконує plan, лише готує дельти)
  ├─ Section 5 (CLAUDE.md updates)
  └─ Section 6 (Roadmap — інформативно, без дій)

[Після цього спеку]
  └─ Виконання плану `2026-05-01-playwright-e2e.md` з дельтами Section 4
```

Спек завершується ПЕРЕД стартом playwright-e2e плану. Не зливаємо у один план — modularность важлива.

## Time estimate

~3 години одноразово на повну імплементацію (Sections 1-5). Після цього магазинна schema через місяць — це просто `supabase migration new shop_baseline` + `supabase db push`.

## References

- `docs/superpowers/plans/README.md` — реєстр планів.
- `docs/superpowers/plans/2026-05-01-playwright-e2e.md` — план, який цей спек розблоковує (Task 4).
- `CLAUDE.md` — буде оновлений у Section 5.
- Supabase migration docs: <https://supabase.com/docs/guides/cli/local-development#database-migrations>
- Netlify per-context env-vars: <https://docs.netlify.com/environment-variables/overview/#scopes>
