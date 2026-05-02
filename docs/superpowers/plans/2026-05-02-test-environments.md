# Test Environments Implementation Plan (supabase-stage + migrations)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Git policy — див. `CLAUDE.md → ## Git policy` (commit-кроки лишаються користувачу).

**Goal:** Розгорнути `supabase-stage` як другий Supabase-проєкт для local-розробки і Netlify deploy-preview/branch-deploy. Запровадити `supabase/migrations/` як єдине джерело правди для schema. Додати curated `--subset=stage` sync для топ-10 артистів + 10 свіжих релізів. Налаштувати per-context env-vars у Netlify. Розблокувати Playwright-план через дельти у `2026-05-01-playwright-e2e.md`.

**Architecture:** Два Supabase-проєкти (stage / prod) з ідентичною schema через `supabase db push`. Local-dev і `npm run test:e2e` дефолтно ходять у stage через `.env.stage`. Netlify routing — production context → prod, deploy-preview/branch-deploy → stage. Curated subset на stage для швидких CRUD-сценаріїв.

**Tech Stack:** Supabase CLI · Supabase JS SDK · Node 24 · Netlify UI per-context env-vars · Nuxt 4 · markdown (для дельт у плані Playwright і CLAUDE.md).

---

## Context для виконавця

**Спек:** [`docs/superpowers/specs/2026-05-02-test-environments-design.md`](../specs/2026-05-02-test-environments-design.md). Уся архітектура і invariants — там; цей план — імплементація.

**Передумови:**
- Поточне середовище: один Supabase-проєкт обслуговує і local (`.env.local`), і Netlify production. Stage-Netlify (`stage--`) використовує те саме.
- `scripts/sync-supabase.mjs` синкає releases/artists/videos/playlists/events/friends з Firebase JSON-експорту.
- `scripts/migrate-tracks.mjs` парсить треки з `tracklistCompact` HTML і заливає в `tracks` (one-shot, не у package.json).
- `.env.local` має `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY` для prod.
- Жодних `supabase/migrations/` ще нема.
- Немає GitHub Actions; CI відкладено в Roadmap R1 спеку.

**Що цей план НЕ робить (роадмап):**
- Не створює GitHub Actions workflows (R1).
- Не торкається тестового коду (`tests/e2e/*` — це робота `playwright-e2e` плану після цього).
- Не запускає магазинні таблиці (R3 — окремий supabase-shop проєкт коли з'явиться PCI-вимога).
- Не додає `--confirm` prompt у `sync:supabase:prod` (R4).

**Поточний стан (2026-05-02):**

- ✅ Користувач створив проєкт `sentimony-stage` на supabase.com (Task 1 Step 1 done).
- ✅ Користувач створив `.env.stage` зі stage credentials (Task 2 Step 1 done).
- ✅ Користувач перейменував `.env.local` → `.env.prod` (Task 2 Steps 2 + 7 done).
- ✅ Обидва env-файли gitignored (Task 2 Step 5 done — користувач оновив `.gitignore`).
- ⏸️ **Task 5 (Netlify per-context env-vars) — DEFERRED.** Користувач зробить пізніше окремо.
- 🔧 Решта Task 1 (Supabase CLI + migrations) — найкраще виконати **вручну**, бо `supabase link` запитує database password інтерактивно. Subagent цього не зробить.

**Послідовність виконання:**

```
Subagent-driven (паралельно з Task 1 user-частиною):
  Task 2 (.env.example.* + verify gitignore)
  Task 3 (npm-scripts у package.json)
  Task 6 (дельти до playwright-e2e plan)
  Task 7 (CLAUDE.md updates)

User-driven (manual, не subagent):
  Task 1 решта (Supabase CLI install + init + link + db pull + db push + diff)
  Task 5 DEFERRED (Netlify)

Subagent-driven (після того, як user зробить Task 1):
  Task 4 (sync-supabase.mjs --subset=stage)
  + Task 4 Step 4: запуск npm run sync:supabase:stage
```

**Час:** ~2 години (Task 5 знято, частина Task 1+2 уже зроблена).

---

## File Structure

**Create:**
- `supabase/config.toml` (з `supabase init`)
- `supabase/migrations/<ts>_remote_schema.sql` (з `supabase db pull` — baseline)
- `.env.stage` (gitignored)
- `.env.prod` (gitignored)
- `.env.example.stage` (committed reference)
- `.env.example.prod` (committed reference)

**Modify:**
- `scripts/sync-supabase.mjs` — додати `--subset=stage` filter + інлайн tracks-parsing для stage
- `package.json` — npm-scripts (dev, sync, test:e2e)
- `.gitignore` — `.env.stage`, `.env.prod`, `.playwright-fixture.json`
- `docs/superpowers/plans/2026-05-01-playwright-e2e.md` — 8 дельт зі спеку Section 4.2
- `CLAUDE.md` — Commands блок + нові секції Environments / Database migrations + Security доповнення
- Netlify Site settings (через web UI, не файл)

**Delete:**
- `.env.local` (після верифікації що `.env.prod` має ті самі значення)

**Не торкатись:**
- `app/`, `server/` — жоден код не змінюється
- Існуючі тести (`tests/composables/`, `tests/server/`, `tests/components/`)
- `netlify.toml` (Variant A — все через UI)
- `scripts/migrate-tracks.mjs` (логіку інлайнимо у sync-supabase.mjs під subset, оригінальний скрипт лишається для one-shot використання)

---

## Task 1: Створити supabase-stage project + baseline migration

**Виконавець:** USER (manual, не subagent — `supabase link` інтерактивний).

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/<timestamp>_remote_schema.sql`

- [x] **Step 1: Створити проєкт `sentimony-stage` на supabase.com** ✅ Done

Manual steps у браузері:
1. Залогінитись на <https://supabase.com/dashboard>.
2. New project → Organization: та сама де `sentimony` prod → Name: `sentimony-stage`.
3. Database password: згенерувати сильний (записати у password manager).
4. Region: **той самий, що prod** (типово eu-central-1 або eu-west-1 — звірити з prod-проєктом у dashboard).
5. Pricing: Free tier.
6. Дочекатись «Project is healthy» (~2 хв).

Скопіювати у тимчасовий файл (для Task 2):
- Project URL: Settings → API → Project URL (`https://<stage-ref>.supabase.co`).
- anon key: Settings → API → Project API keys → `anon` `public`.
- service_role key: Settings → API → Project API keys → `service_role` `secret`.
- Project ref: останній сегмент URL (наприклад `abcdefghij...`).

Expected: stage-проєкт активний, 4 значення скопійовані.

**WARNING:** не комітити service_role key нікуди. Зберігати тільки локально, далі піде у `.env.stage` (gitignored).

- [ ] **Step 2: Встановити Supabase CLI**

Run:
```bash
brew install supabase/tap/supabase
```

Verify:
```bash
supabase --version
```
Expected: версія 1.x або вище. Якщо `brew` недоступний — `npm i -g supabase` як альтернатива (документовано на supabase.com).

- [ ] **Step 3: `supabase init` у корені проєкту**

Run з `/Users/ihororlovskyi/work/github/sentimony-nuxt`:
```bash
supabase init
```

Expected: створено `supabase/config.toml` і порожню `supabase/migrations/`. CLI спитає про IDE — обрати `None` або потрібний (це впливає тільки на додавання `.vscode/settings.json` тощо, не на функціональність).

- [ ] **Step 4: Залінкувати на prod-проєкт і витягнути baseline**

Run (підставити `<prod-ref>` зі Settings → API на prod-Supabase):
```bash
supabase link --project-ref <prod-ref>
```

CLI попросить database password — взяти з password manager (той, що зараз використовується для prod). Якщо забутий — Settings → Database → Reset database password (обережно: впливає тільки на CLI/`psql` доступ, не на runtime).

Run:
```bash
supabase db pull
```

Expected:
- У `supabase/migrations/` з'явився файл `<timestamp>_remote_schema.sql`.
- У ньому SQL з `CREATE TABLE` для `release_likes`, `artist_likes`, `track_likes`, `event_likes`, `playlist_likes`, `video_likes`, можливо `releases` / `artists` / `tracks` (якщо вони вже у Supabase) і політики RLS.

Sanity-check: відкрити файл, переконатись що нема жодних `TRUNCATE` чи `DROP` (`db pull` цього не генерує, але звірка зайвою не буде).

- [ ] **Step 5: Залінкувати на stage і застосувати baseline**

Run (підставити stage-ref зі Step 1):
```bash
supabase link --project-ref <stage-ref>
```

CLI попросить stage database password (з password manager, Step 1).

Run:
```bash
supabase db push
```

Expected: «Applying migration `<timestamp>_remote_schema.sql`...» → success. Якщо стейдж пустий, baseline проходить за один крок без конфліктів.

- [ ] **Step 6: Verify schema parity**

Run:
```bash
supabase db diff --linked --schema public
```

Expected: вивід порожній (або «No schema changes found»). Це підтверджує, що stage-schema = prod-schema.

Якщо є дельта — `db pull` витягнуло не повну prod-schema (буває з extensions/functions). Дослідити, не йти далі.

- [ ] **Step 7: Update .gitignore (часткова, повне оновлення у Task 2)**

Прямо зараз `supabase/` має бути закомічений (`config.toml` + `migrations/`), але треба додати ігнор для тимчасових файлів CLI:

Edit `.gitignore` — додати у кінець:
```
supabase/.branches/
supabase/.temp/
```

(Це CLI artifacts. `supabase/config.toml` і `supabase/migrations/` — комітимо.)

- [ ] **Step 8: [user commits manually]**

Очікувано закомітити: `supabase/config.toml`, `supabase/migrations/<ts>_remote_schema.sql`, `.gitignore`.

**Verification by user перед комітом:**
- `git status` має показувати тільки очікувані файли + (можливо) modified `.gitignore`.
- `cat supabase/migrations/<ts>_remote_schema.sql | head -20` — переконатись, що це SQL, не помилка.

---

## Task 2: Створити env-файли і .env.example.* references

**Виконавець:** SUBAGENT (Haiku) — лишилися тільки створення `.env.example.*` + verify gitignore.

**Files:**
- ✅ Create: `.env.stage` (done by user)
- ✅ Create: `.env.prod` (done by user — переіменовано з `.env.local`)
- Create: `.env.example.stage`
- Create: `.env.example.prod`
- ✅ Modify: `.gitignore` (done by user)
- ✅ Delete: `.env.local` (done by user — переіменовано в `.env.prod`)

- [x] **Step 1: Створити `.env.stage`** ✅ Done by user

Створити `.env.stage` з credentials Task 1 Step 1 (підставити реальні значення):
```
NUXT_PUBLIC_SUPABASE_URL=https://<stage-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<stage-anon-key>
NUXT_SUPABASE_SECRET_KEY=<stage-service-role-key>
```

`E2E_TEST_RELEASE_SLUG` додамо після Task 4, коли матимемо синкнуті релізи.

- [x] **Step 2: Створити `.env.prod` зі значень `.env.local`** ✅ Done by user (rename)

- [ ] **Step 3: Створити `.env.example.stage` (committed reference)**

Створити `.env.example.stage`:
```
NUXT_PUBLIC_SUPABASE_URL=https://<your-stage-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your-stage-anon-key>
NUXT_SUPABASE_SECRET_KEY=<your-stage-service-role-key>

# Optional: pin a release slug for Playwright E2E (login-and-like spec).
# Default fallback: see tests/e2e/helpers/seed-data.ts (created in playwright plan).
# E2E_TEST_RELEASE_SLUG=
```

- [ ] **Step 4: Створити `.env.example.prod`**

Створити `.env.example.prod`:
```
NUXT_PUBLIC_SUPABASE_URL=https://<your-prod-ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=<your-prod-anon-key>
NUXT_SUPABASE_SECRET_KEY=<your-prod-service-role-key>
```

- [x] **Step 5: Оновити `.gitignore`** ✅ Done by user

(Subagent у Step 6 повинен переконатись, що `.playwright-fixture.json` теж є у `.gitignore` — додати, якщо нема.)

- [ ] **Step 6: Verify gitignored**

Run:
```bash
git check-ignore .env.stage .env.prod .playwright-fixture.json
```
Expected: усі три рядки в output (тобто всі ігноруються). Якщо хоч один не виведений — gitignore не спрацював, дослідити.

Run:
```bash
git status --short | grep -E '^\?\? \.env'
```
Expected: порожньо (env-файли не з'являються в untracked).

- [x] **Step 7: Видалити `.env.local`** ✅ Done by user (renamed to `.env.prod`)

- [ ] **Step 8: [user commits manually]**

Очікувано закомітити: `.env.example.stage`, `.env.example.prod`, `.gitignore` (вже modified). `.env.stage` / `.env.prod` — gitignored, не в коміт.

---

## Task 3: Оновити npm-scripts у package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Замінити `dev` і додати `dev:prod`**

Edit `package.json`, в `"scripts"` блоці замінити:
```jsonc
"dev": "node --env-file=.env.local node_modules/.bin/nuxt dev",
```
на:
```jsonc
"dev": "node --env-file=.env.stage node_modules/.bin/nuxt dev --host",
"dev:prod": "node --env-file=.env.prod node_modules/.bin/nuxt dev --host",
```

- [ ] **Step 2: Перейменувати sync скрипт**

Замінити:
```jsonc
"sync:supabase": "node --env-file=.env.local scripts/sync-supabase.mjs",
```
на:
```jsonc
"sync:supabase:stage": "node --env-file=.env.stage scripts/sync-supabase.mjs --subset=stage",
"sync:supabase:prod":  "node --env-file=.env.prod  scripts/sync-supabase.mjs",
```

(Логіка `--subset=stage` буде у Task 4. `sync:supabase:prod` працює одразу — зберігає поточну поведінку.)

- [ ] **Step 3: Додати E2E-скрипти**

Перед `"test"` додати:
```jsonc
"test:e2e": "node --env-file=.env.stage node_modules/.bin/playwright test",
"test:e2e:ui": "node --env-file=.env.stage node_modules/.bin/playwright test --ui",
"test:e2e:headed": "node --env-file=.env.stage node_modules/.bin/playwright test --headed",
```

(Самі тести і `playwright.config.ts` — це робота `playwright-e2e` плану. Скрипти додаємо зараз, щоб env-binding був на місці коли почнеться його виконання.)

- [ ] **Step 4: Verify scripts блок**

Після всіх змін `"scripts"` має виглядати приблизно так:
```jsonc
"scripts": {
  "build": "nuxt build",
  "dev": "node --env-file=.env.stage node_modules/.bin/nuxt dev --host",
  "dev:prod": "node --env-file=.env.prod node_modules/.bin/nuxt dev --host",
  "generate": "nuxt generate",
  "preview": "nuxt preview",
  "postinstall": "nuxt prepare",
  "sync:firebase": "firebase database:set / public/data/sentimony-db-export.json -P sentimony-db -f",
  "sync:supabase:stage": "node --env-file=.env.stage scripts/sync-supabase.mjs --subset=stage",
  "sync:supabase:prod":  "node --env-file=.env.prod  scripts/sync-supabase.mjs",
  "deploy:stage": "netlify deploy --alias stage --context deploy-preview",
  "deploy:prod": "netlify deploy --prod",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "node --env-file=.env.stage node_modules/.bin/playwright test",
  "test:e2e:ui": "node --env-file=.env.stage node_modules/.bin/playwright test --ui",
  "test:e2e:headed": "node --env-file=.env.stage node_modules/.bin/playwright test --headed"
}
```

- [ ] **Step 5: Smoke `npm run dev`**

Run:
```bash
npm run dev
```

Expected: Nuxt стартує без помилок (~10-30s), вивід містить URL `http://[host]:3000` (через `--host`).

Відкрити в браузері `http://localhost:3000` → DevTools → Network → перезавантажити → знайти будь-який request на `*.supabase.co` → URL має містити **stage-ref** з Task 1, не prod-ref.

Стейдж зараз порожній (даних ще не синкали — це Task 4), тож на `/releases` буде пусто. Це ОК. Головне — мережа йде у stage-Supabase.

Stop dev-server (Ctrl+C).

- [ ] **Step 6: Smoke `npm run dev:prod`**

Run:
```bash
npm run dev:prod
```

Expected: Nuxt стартує, `/releases` показує реальний контент (з prod-Supabase). DevTools network → URL має містити **prod-ref**.

Stop dev-server.

- [ ] **Step 7: [user commits manually]**

Очікувано закомітити: `package.json`.

---

## Task 4: Розширити `scripts/sync-supabase.mjs` з `--subset=stage`

**Виконавець:** SUBAGENT (Sonnet) для коду + USER для запуску `npm run sync:supabase:stage` (бо потребує stage schema, що залежить від Task 1 user-частини).

**Передумови:** Task 1 schema applied у stage (через `supabase db push`). Без цього `npm run sync:supabase:stage` падає на UPSERT — таблиць немає.

**Files:**
- Modify: `scripts/sync-supabase.mjs`

- [ ] **Step 1: Замінити вміст `scripts/sync-supabase.mjs`**

Повна заміна файлу:

```js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const args = process.argv.slice(2)
const subset = args.find(a => a.startsWith('--subset='))?.split('=')[1] ?? null
const STAGE_RELEASES_LIMIT = 10
const STAGE_TOP_ARTISTS = 10

const supabase = createClient(process.env.NUXT_PUBLIC_SUPABASE_URL, process.env.NUXT_SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const data = JSON.parse(readFileSync('public/data/sentimony-db-export.json', 'utf-8'))

async function sync(table, rows) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'slug' })
  if (error) { console.error(`${table} error:`, error.message); process.exit(1) }
  console.log(`Synced ${rows.length} ${table}`)
}

function asArtistSlugList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

let releases = Object.values(data.releases).map(({ new: is_new, tracklistCompact: tracklist_compact, creditsCompact: credits_compact, ...rest }) => ({
  ...rest, is_new, tracklist_compact, credits_compact,
}))

if (subset === 'stage') {
  releases = releases
    .filter(r => r.visible !== false)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, STAGE_RELEASES_LIMIT)
  console.log(`[stage subset] selected ${releases.length} latest visible releases`)
}

let artists = [...new Map(Object.values(data.artists).map(a => [a.slug, a])).values()]

if (subset === 'stage') {
  const usageCount = new Map()
  for (const r of Object.values(data.releases)) {
    for (const slug of asArtistSlugList(r.artists)) {
      usageCount.set(slug, (usageCount.get(slug) ?? 0) + 1)
    }
  }
  const topArtistSlugs = [...usageCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, STAGE_TOP_ARTISTS)
    .map(([slug]) => slug)

  const requiredFromSelected = new Set()
  for (const r of releases) {
    for (const slug of asArtistSlugList(r.artists)) requiredFromSelected.add(slug)
  }

  const allowedSlugs = new Set([...topArtistSlugs, ...requiredFromSelected])
  artists = artists.filter(a => allowedSlugs.has(a.slug))
  console.log(`[stage subset] selected ${artists.length} artists (${topArtistSlugs.length} top + ${requiredFromSelected.size - new Set([...topArtistSlugs].filter(s => requiredFromSelected.has(s))).size} extra for FK)`)
}

const videos = Object.values(data.videos)
const playlists = Object.values(data.playlists)
const events = Object.values(data.events)
const friends = Object.values(data.friends)

await sync('releases', releases)
await sync('artists', artists)
await sync('videos', videos)
await sync('playlists', playlists)
await sync('events', events)
await sync('friends', friends)

if (subset === 'stage') {
  const artistByTitle = new Map()
  for (const a of Object.values(data.artists)) {
    artistByTitle.set(a.title.toLowerCase(), a.slug)
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function parseTrack(p, releaseSlug, index) {
    const numMatch = p.match(/<small>(\d+)\.<\/small>/)
    const trackNumber = numMatch ? parseInt(numMatch[1]) : index + 1

    const artistMatch = p.match(/<b>(.*?)<\/b>/)
    const artistName = artistMatch ? artistMatch[1] : ''
    const artistSlug = artistByTitle.get(artistName.toLowerCase()) || slugify(artistName)

    const withoutBpm = p.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/, '')
    const titleRaw = withoutBpm.replace(/^<small>\d+\.<\/small>\s*<b>.*?<\/b>\s*-\s*/, '')
    const title = titleRaw.replace(/<\/?b>/g, '').trim()

    const bpmMatch = p.match(/\((\d+)(?:-(\d+))?bpm\)/i)
    let bpm = null
    if (bpmMatch) {
      bpm = bpmMatch[2] ? parseInt(bpmMatch[2]) : parseInt(bpmMatch[1])
      if (bpm === 0) bpm = null
    }

    return {
      slug: `${releaseSlug}-${trackNumber}`,
      release_slug: releaseSlug,
      track_number: trackNumber,
      title,
      artist_name: artistName,
      artist_slug: artistSlug,
      bpm,
    }
  }

  const seen = new Set()
  const tracks = []
  for (const r of releases) {
    const tracklist = r.tracklist_compact || []
    for (let i = 0; i < tracklist.length; i++) {
      const t = parseTrack(tracklist[i].p, r.slug, i)
      if (!seen.has(t.slug)) {
        seen.add(t.slug)
        tracks.push(t)
      }
    }
  }

  for (let i = 0; i < tracks.length; i += 200) {
    const batch = tracks.slice(i, i + 200)
    const { error } = await supabase.from('tracks').upsert(batch, { onConflict: 'slug' })
    if (error) { console.error(`tracks batch error:`, error.message); process.exit(1) }
  }
  console.log(`[stage subset] synced ${tracks.length} tracks`)
}
```

**Що робить:**
- Читає `--subset=stage` прапорець з argv.
- У повному режимі (без subset) — поведінка ідентична попередній: повний sync releases/artists/videos/playlists/events/friends.
- У stage-subset режимі:
  - releases: 10 останніх з `visible !== false`, sort by `date` desc.
  - artists: топ-10 за кількістю появ у `release.artists` (масив або рядок) + всі артисти, привʼязані до 10 обраних релізів (FK-цілісність).
  - tracks: парсинг з `tracklist_compact` тільки для 10 обраних релізів (інлайнена логіка з `migrate-tracks.mjs`).
  - videos/playlists/events/friends: без фільтрації.
- likes-таблиці не чіпаємо — це user-data.

- [ ] **Step 2: Sanity-check синтаксису**

Run:
```bash
node --check scripts/sync-supabase.mjs
```
Expected: 0 exit, нічого не друкується. Якщо є syntax error — Node вкаже рядок.

- [ ] **Step 3: Підготувати JSON-експорт**

Якщо `public/data/sentimony-db-export.json` не існує або застарілий:
```bash
npm run sync:firebase
```
Expected: Firebase скачує дані → файл оновлюється.

Verify розмір:
```bash
wc -l public/data/sentimony-db-export.json
```
Expected: великий файл (тисячі рядків).

- [ ] **Step 4: Запустити `npm run sync:supabase:stage`**

Run:
```bash
npm run sync:supabase:stage
```

Expected output (приклад):
```
[stage subset] selected 10 latest visible releases
[stage subset] selected 12 artists (10 top + 2 extra for FK)
Synced 10 releases
Synced 12 artists
Synced N videos
Synced N playlists
Synced N events
Synced N friends
[stage subset] synced N tracks
```

(N — повна кількість для videos/playlists/events/friends, яка б не була у Firebase JSON.)

- [ ] **Step 5: Verify у Supabase Dashboard**

У Supabase web UI → stage-проєкт → Table editor:
- `releases`: 10 рядків.
- `artists`: 10-25 рядків (топ + FK).
- `tracks`: всі треки з 10 релізів (зазвичай 50-150).
- `videos`/`playlists`/`events`/`friends`: повна кількість.
- `release_likes` etc.: 0 рядків (likes не синкаємо).

- [ ] **Step 6: Verify через `npm run dev`**

Run:
```bash
npm run dev
```

Відкрити `http://localhost:3000/releases` — має показати 10 релізів. Клікнути будь-який → release detail page завантажується, треки відображаються.

Stop dev-server.

- [ ] **Step 7: Записати дефолтний slug у `.env.stage`**

Скопіювати `slug` будь-якого з 10 релізів (Supabase Table editor → releases → копія slug-у). Додати у `.env.stage`:
```
E2E_TEST_RELEASE_SLUG=<скопійований-slug>
```

(Це опційно зараз — дефолтний `E2E_FIXED_RELEASE_SLUG` створиться у playwright-плані. Але env-var гарантує, що тест не зламається при rotation.)

- [ ] **Step 8: [user commits manually]**

Очікувано закомітити: `scripts/sync-supabase.mjs`. `.env.stage` — gitignored, не в коміт.

---

## Task 5: Налаштувати Netlify per-context env-vars ✅ Done by user

**Status:** Виконано користувачем 2026-05-02 через Netlify Site settings.

**Files:** жодних — все через Netlify web UI. Документація відбитку — у Task 7 (CLAUDE.md).

**Verification (рекомендовано перед першим merge):**
- Запушити невеликий PR → відкрити Netlify deploy-preview URL → DevTools → Network → request на `*.supabase.co` має містити stage-ref.
- Після наступного `npm run deploy:prod` (або auto-deploy з master) — відкрити `sentimony.com` → DevTools → Network → має містити prod-ref.
- Якщо deploy-preview все ще йде у prod-Supabase — перетригернути deploy (env-vars кешуються per build).

- [ ] **Step 1: Відкрити Netlify dashboard**

<https://app.netlify.com> → Site `sentimony-nuxt` → Site settings → Environment variables.

- [ ] **Step 2: Налаштувати `NUXT_PUBLIC_SUPABASE_URL` per context**

1. Знайти змінну `NUXT_PUBLIC_SUPABASE_URL` (зараз має одне глобальне значення = prod URL).
2. Click **Edit** (або **Options** → **Edit**).
3. Toggle **«Different value for each deploy context»**.
4. Заповнити:
   - **Production**: `https://<prod-ref>.supabase.co` (поточне значення)
   - **Deploy Previews**: `https://<stage-ref>.supabase.co` (значення з `.env.stage`)
   - **Branch deploys** (All): `https://<stage-ref>.supabase.co`
5. Save.

- [ ] **Step 3: Налаштувати `NUXT_PUBLIC_SUPABASE_KEY` per context**

Та сама процедура (Step 2):
- Production: prod anon key
- Deploy Previews: stage anon key
- Branch deploys (All): stage anon key

- [ ] **Step 4: Налаштувати `NUXT_SUPABASE_SECRET_KEY` per context**

Та сама процедура (Step 2):
- Production: prod service_role key
- Deploy Previews: stage service_role key
- Branch deploys (All): stage service_role key

**Increased sensitivity:** service_role key дає повний доступ до БД. Точно перевірити, що prod-key потрапив тільки у Production контекст.

- [ ] **Step 5: Verify routing на stage-deploy**

Створити невеликий PR (можна добавити blank рядок у README.md) і запушити → Netlify створить deploy-preview.

Відкрити deploy-preview URL → DevTools → Network → `*.supabase.co` request → URL має містити **stage-ref**.

Якщо URL = prod-ref:
- Перевірити Site settings → Environment variables: чи зберігся per-context split.
- Перевірити, чи деплой відбувся ПІСЛЯ збереження варіабл (старі деплої кешують env).

- [ ] **Step 6: Verify routing на prod-deploy**

Виконати `npm run deploy:prod` (або merge у master, якщо це налаштовано як auto-deploy):
```bash
npm run deploy:prod
```

Очікувано: Netlify побудує і задеплоїть. Відкрити `https://sentimony.com` → DevTools → Network → `*.supabase.co` request → URL має містити **prod-ref**.

- [ ] **Step 7: Видалити тестовий PR (якщо створювали у Step 5)**

Якщо PR суто для smoke — закрити без merge. Або залишити для майбутніх deploy-preview перевірок.

(Цей крок не потребує коміту.)

---

## Task 6: Apply дельти до `docs/superpowers/plans/2026-05-01-playwright-e2e.md`

**Виконавець:** SUBAGENT (Sonnet) — структурні markdown-патчі.

**Files:**
- Modify: `docs/superpowers/plans/2026-05-01-playwright-e2e.md`

- [ ] **Step 1: Делта Task 1 Step 3 (npm-scripts)**

Знайти у `docs/superpowers/plans/2026-05-01-playwright-e2e.md` блок:
```jsonc
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed"
```

Замінити на:
```jsonc
"test:e2e": "node --env-file=.env.stage node_modules/.bin/playwright test",
"test:e2e:ui": "node --env-file=.env.stage node_modules/.bin/playwright test --ui",
"test:e2e:headed": "node --env-file=.env.stage node_modules/.bin/playwright test --headed"
```

(Цей патч уже частково застосовано через Task 3 цього плану — у `package.json`. У плані-файлі playwright теж синхронізуємо для консистентності.)

- [ ] **Step 2: Делта Task 2 Step 2 (`global-setup.ts`)**

Знайти рядок:
```ts
loadDotenv({ path: '.env.local' })
```
(є у двох місцях: `global-setup.ts` і `global-teardown.ts` коді у плані)

Замінити обидва входження на:
```ts
loadDotenv({ path: '.env.stage' })
```

- [ ] **Step 3: Делта Task 2 Step 5 (видалити WARNING)**

Знайти у Task 2 Step 5 блок який починається з:
```
**WARNING:** Якщо `.env.local` вказує на production Supabase, цей запуск створить там реального користувача. Перш ніж запускати, переконайся, що Supabase URL — тестовий (або готовий до тестових даних). Якщо сумніваєшся — пропусти sanity-check, або тимчасово закоментуй `globalSetup` у config.

Якщо запустилось і user створений — `cat .playwright-fixture.json` має показати JSON з `userId`/`email`/`password`. globalTeardown теж запуститься і видалить user-а наприкінці.
```

Замінити на:
```
globalSetup створить test-user у `supabase-stage` (через `.env.stage`). Безпечно — це окремий проєкт, не prod.

Перевір після прогону: `cat .playwright-fixture.json` має показати JSON з `userId`/`email`/`password`. globalTeardown запуститься після тестів і видалить user-а та фікстуру.
```

- [ ] **Step 4: Делта Task 4 Step 2 (`E2E_TEST_RELEASE_SLUG`)**

Знайти у Task 4 Step 2 блок:
```
Знайти будь-який видимий release slug у Supabase (через SQL, через UI чи `npm run dev` + `/releases`). Записати його як `E2E_TEST_RELEASE_SLUG` у `.env.local`:
```
```
E2E_TEST_RELEASE_SLUG=actual-release-slug
```

Замінити на:
```
Slug має бути одним з 10 релізів синкнутих у `supabase-stage` через `npm run sync:supabase:stage`. Перевірити доступні: `https://<stage-ref>.supabase.co` → Table editor → releases. Записати у `.env.stage`:
```
```
E2E_TEST_RELEASE_SLUG=actual-release-slug
```

Альтернативно: створити `tests/e2e/helpers/seed-data.ts` з fallback-константою (див. Step 5).

- [ ] **Step 5: Додати новий sub-step у Task 4 — створення `seed-data.ts`**

Перед існуючим Step 1 у Task 4 додати новий Step 1:

```markdown
- [ ] **Step 1: Створити `tests/e2e/helpers/seed-data.ts`**

`tests/e2e/helpers/seed-data.ts`:
```ts
export const E2E_FIXED_RELEASE_SLUG = '<підставити slug з 10 синкнутих у stage>'
```

Цей дефолт спрацьовує, коли `E2E_TEST_RELEASE_SLUG` env-var не задано. Зручно для нових контриб'юторів — після `npm run sync:supabase:stage` тест запускається без додаткової конфігурації.
```

Перенумерувати решту Step-ів у Task 4 (старий Step 1 → новий Step 2, etc.).

У файлі `login-and-like.spec.ts` (новий Step 2, екс-Step 1) замінити рядок:
```ts
const RELEASE_SLUG = process.env.E2E_TEST_RELEASE_SLUG
```
на:
```ts
import { E2E_FIXED_RELEASE_SLUG } from './helpers/seed-data'
const RELEASE_SLUG = process.env.E2E_TEST_RELEASE_SLUG ?? E2E_FIXED_RELEASE_SLUG
```

Залишити `test.skip(!RELEASE_SLUG, '...')` як safety net (раптом обидва порожні).

- [ ] **Step 6: Делта Task 6 Step 2 (orphan check)**

Знайти у Task 6 Step 2 рядок:
```
перевір через `select * from auth.users where email like 'playwright-%'` у Supabase
```

Замінити на:
```
перевір через `select * from auth.users where email like 'playwright-%'` у **stage-Supabase** (`supabase-stage` проєкт)
```

- [ ] **Step 7: Делта Notes — видалити Production-Supabase warning**

Знайти секцію Notes:
```
**Production-Supabase warning:**
Якщо `.env.local` вказує на production Supabase, тести створять там реального user-а та запис у `release_likes`. Cleanup є, але:
- Перебій під час teardown → orphan user.
- Race з RLS → не зможе видалити user-а.

**Sane defaults для test environment:**
1. **Окремий test-проєкт Supabase** (рекомендую). ...
```

Замінити на:
```
**Test-Supabase invariant:**
`.env.stage` має вказувати на `supabase-stage` проєкт (див. spec `2026-05-02-test-environments-design.md`). Перевірити: запустити `npm run dev` → DevTools network → URL має йти на stage-ref, не prod-ref.

CI коли з'явиться (Roadmap R1 спеку) використовуватиме той самий стек stage-secrets через GitHub Secrets (`E2E_SUPABASE_URL`, `E2E_SUPABASE_KEY`, `E2E_SUPABASE_SECRET_KEY`, `E2E_TEST_RELEASE_SLUG`).

Локальний Docker-Supabase (`supabase start`) — окрема ініціатива, Roadmap R2.
```

- [ ] **Step 8: Sanity-check markdown**

Run:
```bash
head -100 docs/superpowers/plans/2026-05-01-playwright-e2e.md
```
Перевірити, що markdown не зламаний (заголовки, code-блоки закриті). Run:
```bash
grep -c "^- \[ \]" docs/superpowers/plans/2026-05-01-playwright-e2e.md
```
Expected: число task-step-ів > 20 (це після додавання нового Step 1 у Task 4).

- [ ] **Step 9: [user commits manually]**

Очікувано закомітити: `docs/superpowers/plans/2026-05-01-playwright-e2e.md`.

---

## Task 7: Оновити `CLAUDE.md`

**Виконавець:** SUBAGENT (Sonnet) — структурні markdown-секції.

**Note:** Секція `## Git policy` уже додана у CLAUDE.md (між Security і Commands). Subagent повинен це врахувати — НЕ дублювати, тільки додавати Environments / Database migrations / оновити Commands / доповнити Security.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Замінити блок «Commands»**

Знайти у `CLAUDE.md` секцію `## Commands` і її код-блок (зараз ~16 рядків з npm командами).

Замінити весь код-блок на:
```bash
# Development (вимагає .env.stage; .env.prod лише для escape hatch)
npm run dev               # → supabase-stage, з --host (default workflow)
npm run dev:prod          # escape hatch: дебаг прод-багу

# Build & deploy
npm run build
npm run deploy:stage
npm run deploy:prod

# Tests
npm test                  # vitest unit/component (run all once)
npm run test:watch        # vitest watch mode
npm run test:e2e          # → supabase-stage, обов'язково
npm run test:e2e:ui       # Playwright UI mode

# Sync data sources
npm run sync:firebase             # exports Firebase DB → public/data/sentimony-db-export.json
npm run sync:supabase:stage       # 10 топ-артистів + 10 свіжих релізів + всі events/videos/playlists/tracks
npm run sync:supabase:prod        # повний sync, тільки для прода

# Database migrations (Supabase CLI)
supabase migration new <name>     # нова schema-міграція
supabase db push                  # apply до залінкованого проєкту (stage/prod)
supabase db diff --linked         # діфф локальної schema vs залінкованого проєкту
```

Замінити рядок:
```
`.env.local` must define: `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY`. Optional: `RELEASES_SOURCE=supabase` to switch a data source from Firebase to Supabase.
```
на:
```
`.env.stage` (default) і `.env.prod` (escape hatch) обидва мають містити: `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY`, `NUXT_SUPABASE_SECRET_KEY`. Опційно у `.env.stage`: `RELEASES_SOURCE=supabase`, `E2E_TEST_RELEASE_SLUG=<slug>`. Reference templates — `.env.example.stage` / `.env.example.prod` (committed).
```

- [ ] **Step 2: Додати секцію `## Environments`**

Перед існуючою секцією `## Architecture` додати нову:

```markdown
## Environments

Три деплой-environment-и шерять два Supabase-проєкти:

| Environment | Trigger | Supabase project | Env-vars джерело |
|---|---|---|---|
| Local | `npm run dev` | `supabase-stage` | `.env.stage` |
| Stage | Netlify deploy-preview / branch-deploy | `supabase-stage` | Netlify UI (per-context) |
| Prod | Netlify production (master) | `supabase-prod` | Netlify UI (per-context) |

**Invariants:**
- `npm run dev` за замовчуванням → stage. Запустити проти prod можна тільки явно через `npm run dev:prod` (escape hatch).
- `npm run test:e2e` обов'язково через `.env.stage`. Жоден E2E не торкається prod-БД.
- Schema живе у `supabase/migrations/` як single source of truth (див. секцію Database migrations).
- Netlify per-context env-vars налаштовані через Site settings → Environment variables. `netlify.toml` НЕ містить keys — все через UI для consistency.

Detail design: `docs/superpowers/specs/2026-05-02-test-environments-design.md`.
```

- [ ] **Step 3: Додати секцію `## Database migrations`**

Після нової секції `## Environments` (тобто перед `## Architecture`) додати:

```markdown
## Database migrations

Schema-зміни виключно через `supabase/migrations/*.sql`. **Жодних змін через Supabase web UI** — це порушує єдине джерело правди і призведе до schema-drift між stage і prod.

Workflow:

```
1. supabase migration new <name>          # створює <ts>_<name>.sql
2. Заповнити SQL вручну (CREATE/ALTER/...)
3. supabase link --project-ref <stage-ref>
4. supabase db push                        # apply до stage
5. npm run dev → smoke
6. npm run sync:supabase:stage             # якщо нова таблиця/колонка потребує даних
7. npm test && npm run test:e2e
8. (commit migration файл)
9. supabase link --project-ref <prod-ref>
10. supabase db push                       # apply до prod
11. npm run deploy:prod
```

Recovery:
- Stage broken → `supabase db reset --linked` (зносить stage, реаплаїть всі міграції) → `npm run sync:supabase:stage`.
- Prod не зачіпається до кроку 10. Якщо помилка на 9-10 — видалити migration файл, виправити, повторити.
```

- [ ] **Step 4: Доповнити Security блок**

Знайти секцію `Security` (близько початку файлу). Додати після існуючих рядків:

```
- `.env.prod` НІКОЛИ не комітити — service_role key дає повний доступ до БД.
- `sync:supabase:prod` запускати свідомо. Захисний `--confirm` prompt — Roadmap (див. `docs/superpowers/specs/2026-05-02-test-environments-design.md` Section 6 R4).
```

- [ ] **Step 5: Verify markdown**

Run:
```bash
head -80 CLAUDE.md
```
Переконатись, що нові секції додані у правильному місці і структура заголовків (`##`) консистентна.

Run:
```bash
grep -c "^## " CLAUDE.md
```
Expected: збільшилось на 2 (Environments + Database migrations).

- [ ] **Step 6: [user commits manually]**

Очікувано закомітити: `CLAUDE.md`.

---

## Final verification

- [ ] **Step 1: End-to-end smoke**

Run послідовно:
```bash
npm run dev
```
→ відкрити `http://localhost:3000/releases` → побачити 10 релізів зі stage → DevTools network → stage-ref. Stop.

```bash
npm run dev:prod
```
→ `/releases` показує всі прод-релізи → DevTools network → prod-ref. Stop.

```bash
npm test
```
Expected: 35 tests passed (без змін від попереднього стану — цей план не чіпає Vitest).

```bash
npx vue-tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 2: Verify spec invariants**

Перевірити вручну:
- [ ] `npm run dev` без аргументів — ходить у stage-Supabase (DevTools network)
- [ ] `npm run dev:prod` — ходить у prod-Supabase
- [ ] `npm run sync:supabase:stage` — синкає 10 релізів + 10-25 артистів + tracks
- [ ] `npm run sync:supabase:prod` — синкає всі дані (поточна поведінка, не зламана)
- [ ] Netlify deploy-preview URL → DevTools network → stage-ref
- [ ] Netlify production URL (`sentimony.com`) → DevTools network → prod-ref
- [ ] `supabase db diff --linked --schema public` (після `supabase link` на stage) → empty
- [ ] `.env.stage` / `.env.prod` gitignored, `.env.example.*` committed
- [ ] `.env.local` видалений
- [ ] `docs/superpowers/plans/2026-05-01-playwright-e2e.md` без жодних згадок `.env.local`

- [ ] **Step 3: Готово до Playwright плану**

Після завершення цього плану — `docs/superpowers/plans/2026-05-01-playwright-e2e.md` готовий до виконання без блокерів. Запустити його через `superpowers:subagent-driven-development` або `superpowers:executing-plans`.

---

## Notes для виконавця

**Якщо `supabase db pull` падає на Step 4 Task 1:**
- Можливо prod database password неправильний — Settings → Database → Reset (тільки для CLI-доступу, не для runtime).
- Можливо CLI потребує ipv6 або specific port — перевірити firewall.

**Якщо stage Supabase після `db push` має зайві таблиці/колонки:**
- `db pull` міг витягнути не тільки `public` schema. Перевірити migration файл — мають бути тільки таблиці що нас цікавлять.
- Якщо є зайве — відредагувати migration файл руками, видалити сторонні `CREATE` блоки, повторити `db push` на чистий stage (`supabase db reset --linked`).

**Якщо `npm run sync:supabase:stage` падає на FK error:**
- Це означає, що серед 10 обраних релізів є артист, якого немає у `top 10 by usage`. Логіка `requiredFromSelected` мала би це відловити — якщо все одно падає, додати debug log: `console.log('selected release artists:', releases.flatMap(r => asArtistSlugList(r.artists)))` і перевірити, чи всі ці слаги є в `allowedSlugs`.

**Якщо Netlify deploy-preview після Step 5 Task 5 показує prod-ref:**
- Netlify кешує env-vars per build. Тригернути новий deploy: запушити порожній коміт або клікнути «Trigger deploy» у Netlify UI.

**Що далі (Roadmap зі спеку):**
- R1 GitHub Actions CI
- R2 Локальний `supabase start` (Docker)
- R3 Окремий supabase-shop проєкт
- R4 `sync:supabase:prod --confirm` safety prompt
- R5 Cross-browser E2E
- R6 Visual regression
- R7 Test data factory
- R8 Per-test users + parallelism

Кожен — окремий план у `docs/superpowers/plans/` коли тригер спрацює.
