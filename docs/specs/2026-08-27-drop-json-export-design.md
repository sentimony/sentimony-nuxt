# Позбутися `sentimony-db-export.json` як закоміченого файлу

**Дата:** 2026-08-27
**Статус:** Design
**Скоуп:** `server/data/sentimony-db-export.json`, `server/data/sentimony-db.yml`, `scripts/convert-*.mjs`, `package.json`, docs

## Проблема

У репозиторії закомічені **дві повні репрезентації одного каталогу**:

| Файл | Розмір | Роль |
| --- | --- | --- |
| `server/data/sentimony-db.yml` | 787 KB / 18 589 рядків | source of truth (декларовано в `AGENTS.md:95`) |
| `server/data/sentimony-db-export.json` | 938 KB / 23 480 рядків | derived artifact (`npm run convert:yml`) |

JSON — **повністю похідний**. Верифіковано емпірично на поточних робочих копіях:

```
parse(yml) vs JSON.parse(json)  ->  deep equal: true
top keys: artists[242] events[5] friends[7] releases{102} playlists{5} videos[7] tracks[767]
```

Наслідки того, що обидва в git:
- **Drift risk** — JSON можна відредагувати руками, і він розійдеться з YAML мовчки. Нічого це не ловить: ні тестів, ні `docs:check`.
- **Подвійні діфи** — кожна змістовна правка каталогу дає два великі діфи; review-шум, регулярні конфлікти при merge.
- **~940 KB зайвого** в історії репо на кожну ревізію каталогу.

## Чи є сенс

**Так.** YAML уже офіційно є джерелом істини, JSON доводжено похідним. Тримати похідний артефакт у git — це рівно той клас проблеми, який gitignore і build-hook вирішують. Але формулювання «позбутися JSON» має **два різні прочитання** з дуже різною ціною, і саме тут головне рішення.

## Два варіанти

### Варіант A — JSON стає build-артефактом (рекомендований)

JSON лишається на диску й далі годує всіх споживачів, але **зникає з git**: `.gitignore` + `git rm --cached`, а генерується автоматично через п'ять хуків: `predev`, `prebuild`, `pretest:unit`, `pretypecheck`, `pregenerate` (див. пункт 1 нижче).

- Змін у рантаймі — нуль. Логіка sync-скриптів не змінюється (вони й далі читають JSON), правляться лише стейл-докстрінги.
- Знімає обидві реальні болячки: drift і подвійні діфи.
- Ризик — мінімальний і локалізований в одному місці: файл мусить існувати до збірки на свіжому клоні та в CI.

### Варіант B — JSON зникає повністю

Sync-скрипти парсять YAML напряму (тривіально — Node, `yaml` уже в deps), а `server/api/__sitemap__/urls.get.ts` імпортує YAML замість JSON.

**Блокер, який треба верифікувати окремо.** Єдиний рантайм-споживач — статичний import JSON у Nitro server route, а проєкт збирається під **два пресети**: `netlify` (дефолт) і `cloudflare_module` (`npm run build:cf`, `wrangler.jsonc`). У Workers немає fs у рантаймі — дані мусять бути інлайнені на етапі збірки. Перевірено в дереві:

- `@rollup/plugin-json` у `node_modules` є — тому JSON-import працює «безкоштовно»;
- **YAML rollup/vite-плагіна немає жодного.**

Тобто Варіант B вимагає нової залежності (`@rollup/plugin-yaml` або `?raw` + `parse()` на module init), правки `nitro.rollupConfig`, і несе ціну, яку ніхто ще не міряв: парсинг ~790 KB YAML на cold start Worker-а + сам парсер у бандлі. JSON.parse на порядок дешевший за YAML-parse, і в Workers це б'є саме по cold start.

**Рекомендація:** робити A. Він прибирає фактичний біль (drift, діфи) за нульового ризику. B лишити як окрему ініціативу — вона потребує заміру cold start і зеленого `build:cf`, а виграш дає косметичний (мінус один файл на диску), бо drift після A вже неможливий.

## Рішення

Приймаємо **Варіант A**.

## Споживачі JSON (повна карта)

| Місце | Тип | Дія під A |
| --- | --- | --- |
| `server/api/__sitemap__/urls.get.ts:1` | рантайм, статичний import | без змін |
| `scripts/sync-firebase.mjs:7` | `readFileSync` | без змін (`sync:firebase` уже робить `convert:yml`) |
| `scripts/sync-supabase.mjs:12` | `readFileSync` | без змін (те саме) |
| `tests/unit/sitemapEndpoint.test.ts`, `sitemapUrls.test.ts` | через sitemap-ендпоінт | потрібен `pretest:unit` хук |
| `scripts/sync-field.mjs` | пише **лише** в YAML | код без змін, docstring радив редагувати JSON — виправити |
| `scripts/sync-track-audio.mjs` | делегує в `sync-field.mjs` | те саме: стейл-коментар про «local export» |
| `npm run typecheck` | резолвить import без build | потрібен `pretypecheck` |
| `npm run generate` | Rollup резолвить import | потрібен `pregenerate` |
| `scripts/convert-json-yml.mjs` | зворотний напрям JSON → YAML | видалити (див. нижче) |

## Що врахувати

1. **Свіжий клон / CI.** Без JSON на диску падають `build`, `dev`, `test:unit`, а також **`typecheck` і `generate`** — останні два резолвлять import, не запускаючи build, тому потребують власних хуків (`pretypecheck`, `pregenerate`). Без `pretypecheck` CI-job `Typecheck` червоніє на кожному PR (`TS2307`, exit 2). Усі п'ять хуків обов'язкові — це єдина справжня точка відмови цього рішення. `.github/workflows/ci.yml` покритий: `unit` → `test:unit`, `smoke` → `build`, `typecheck` → `pretypecheck`; окремий виклик `convert:yml` у workflow не потрібен.
2. **`convert-json-yml.mjs` (зворотний напрям).** Під A він стає небезпечним: генерувати source of truth із похідного файлу — це шлях повернути drift. Видалити.
3. **Стейл-коментар у конвертерах.** `convert-yml-json.mjs:5-6` і `convert-json-yml.mjs` описують себе як «standalone sandbox pair, unrelated to the canonical export» — це прямо суперечить `package.json`, де `sync:*` викликають `convert:yml`. Коментар застарілий, виправити.
4. **Docs.** Оновити `AGENTS.md` (рядки 43, 95, 149) і `docs/artist-numbering.md:24` (посилається на JSON як джерело порядку артистів — має вказувати на YAML). **Історичні файли в `docs/superpowers/{specs,plans}` не чіпати** — це записи минулого.
5. **Стан робочого дерева.** Обидва db-файли зараз modified. Перед стартом — звірити їх **non-destructively** (`isDeepStrictEqual` YAML-парсу проти JSON на диску, див. Фазу 0 плану), щоб зафіксувати YAML як джерело з чистою совістю. Запускати `convert:yml` до звірки не можна: він перезаписує JSON і знищив би ручну правку, якої немає в YAML.
6. **Git-гігієна.** У дереві є незв'язані незакомічені зміни (`README.md`, `package.json`, `scripts/skills.sh`, `.github/*`). Кожен `git add` перелічує файли явно, `git add -A` заборонено, amend не робити.
7. **Інші чекаути.** Після `git rm --cached` будь-який інший чекаут репо втратить JSON з диска на першому ж `git pull`, бо файл більше не трекається. Деплої це не зачіпає (`prebuild` регенерує), але локальний другий чекаут буде зламаний до першої збірки.
8. **Історію не переписуємо.** `git rm --cached` прибирає файл із майбутніх комітів; ~940 KB попередніх ревізій лишаються в історії. Filter-repo не робимо — ціна не варта.

## Критерії приймання

- `server/data/sentimony-db-export.json` не трекається git-ом, у `.gitignore`.
- Свіжий клон: `npm ci && npm run build` проходить (JSON генерується хуком).
- На чистому checkout кожна з `test:unit` / `build` / `build:cf` / `typecheck` зелена **при видаленому перед нею JSON** (перевіряти exit code, не вивід).
- `generate` на тому ж checkout проходить Rollup-резолв JSON-import-у. Зеленого exit-коду від нього **не вимагається**: він падає на двох передіснуючих prerender-помилках, не пов'язаних із цією ініціативою: `[404] Unknown platform` (`server/utils/platformRedirect.ts:12`, коміт `7093c30`) і `[404] Artist not found` — наслідок зіпсованих `artist_slug` у каталозі (`e`, `no`, `u`, `jai`, `sol`), ідентичних на `main`. Критерій — відсутність `Could not resolve "../../data/sentimony-db-export.json"`.
- `npm run test:unit` зелений; `npm run build:cf` зелений.
- `npm run sync:firebase -- --dry-run` працює як раніше.
- `convert-json-yml.mjs` видалений; **living docs** (`AGENTS.md`, `README.md`, `docs/artist-numbering.md`, `docs/initiatives/`, `docs/completed.md`) не згадують JSON як джерело істини. Історичні записи в `docs/superpowers/{specs,plans}/` під критерій не підпадають — вони фіксують стан на свою дату і навмисно лишаються недоторканими.

## Поза скоупом

- Варіант B (повне прибирання JSON) — окрема ініціатива.
- Переписування git-історії.
- Будь-які зміни вмісту каталогу.
