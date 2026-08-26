# План: `sentimony-db-export.json` → build-артефакт

**Спека:** [`docs/specs/2026-08-27-drop-json-export-design.md`](../specs/2026-08-27-drop-json-export-design.md)
**Дата:** 2026-08-27
**Варіант:** A — JSON лишається на диску, зникає з git.

## Контекст для виконавця

- Гілка `main`. У дереві є **незв'язані незакомічені зміни** (`README.md`, `package.json`, `scripts/skills.sh`, `.github/workflows/*`, обидва db-файли). Тому кожен `git add` перелічує файли явно; **`git add -A` заборонено**, amend у попередні коміти — теж.
- Кожна фаза — свій коміт.
- Вміст каталогу (`sentimony-db.yml`) у цьому плані **не редагується**.

---

## Фаза 0. Precondition: звірити YAML і JSON

Мета — переконатися, що поточні modified-копії не розійшлися, перш ніж фіксувати YAML як єдине джерело.

```bash
npm run convert:yml
git diff --stat server/data/sentimony-db-export.json
```

**Очікування:** діф порожній — JSON уже точно відповідає YAML.

**Якщо діф НЕ порожній — зупинитись і показати його користувачу.** Це означає, що JSON редагували руками повз YAML, і треба вирішити, який бік правильний. Не продовжувати автоматично: мовчазний `convert:yml` тут може знищити правку, якої немає в YAML.

Комітів немає.

---

## Фаза 1. Хуки генерації

Без них свіжий клон і CI ламаються — робимо це **до** видалення файлу з git.

У `package.json#scripts` додати три хуки:

```json
"predev": "npm run convert:yml",
"prebuild": "npm run convert:yml",
"pretest:unit": "npm run convert:yml"
```

Зауваги:
- `prebuild` покриває і `build:cf`, бо той викликає `npm run build` всередині.
- `sync:firebase` / `sync:supabase` уже роблять `convert:yml` явно — не чіпати.
- `generate` не має хука; якщо ним користуються — додати `pregenerate` так само.

**Перевірка:**
```bash
rm server/data/sentimony-db-export.json
npm run test:unit          # має згенерувати JSON і пройти
ls -la server/data/sentimony-db-export.json
```

**Коміт:**
```bash
git add package.json
git commit -m "build: regenerate catalog JSON export before dev, build and unit tests"
```

> `package.json` уже modified у дереві. Перед `git add` перевірити `git diff package.json` і переконатися, що в коміт іде тільки додавання хуків; якщо там є чужі зміни — закомітити хуки окремо через `git add -p`.

---

## Фаза 2. Прибрати JSON з git

```bash
git rm --cached server/data/sentimony-db-export.json
```

У `.gitignore` додати (з коментарем, бо це неочевидно):

```
# Derived from server/data/sentimony-db.yml via `npm run convert:yml`
server/data/sentimony-db-export.json
```

**Перевірка:**
```bash
git check-ignore -v server/data/sentimony-db-export.json   # має показати правило
git status --short                                          # JSON не в untracked
test -f server/data/sentimony-db-export.json && echo "file still on disk: ok"
```

**Коміт:**
```bash
git add .gitignore
git commit -m "chore: untrack derived catalog JSON export"
```

> **Side effect на інших чекаутах.** Після `git pull` цього коміту git **видалить** `sentimony-db-export.json` з диска в кожному іншому чекауті репо — файл більше не трекається. Для деплоїв це безпечно (Netlify/CF ідуть із локального `.output`, а `prebuild` регенерує файл), але другий локальний чекаут буде зламаний до першого `npm run build` / `npm run test:unit`. Попередити, якщо такий чекаут існує.

---

## Фаза 3. Прибрати зворотний конвертер і стейл-коментар

1. **Видалити** `scripts/convert-json-yml.mjs` — під варіантом A генерувати source of truth із похідного файлу означає повернути drift.
2. У `scripts/convert-yml-json.mjs` виправити шапку. Зараз рядки 3-6 стверджують:
   > `Converts server/data/sentimony-db.yml to server/data/sentimony-db.json.`
   > `This is a standalone sandbox pair, unrelated to the canonical server/data/sentimony-db-export.json used by the app/sync scripts.`

   Обидва твердження хибні: пише він саме в `sentimony-db-export.json`, і він канонічний. Замінити на опис, що це єдиний генератор похідного export-у, який запускається автоматично перед dev/build/test і всередині `sync:*`.

**Перевірка:**
```bash
grep -rn "convert-json-yml" --include="*.json" --include="*.mjs" --include="*.md" . | grep -v node_modules | grep -v docs/superpowers
```
Очікування: жодних згадок поза історичними планами.

**Коміт:**
```bash
git add scripts/convert-yml-json.mjs
git rm scripts/convert-json-yml.mjs
git commit -m "chore: drop reverse JSON->YAML converter, fix generator docstring"
```

> `package.json` навмисно **не** в цьому коміті: скрипта на `convert-json-yml.mjs` там немає (`convert:yml` вказує на `convert-yml-json.mjs`, який лишається), а файл modified чужими змінами — сліпий `git add package.json` затягнув би їх. Якщо grep вище все ж знайде скрипт на видалений файл — прибрати його і додати точково через `git add -p package.json`.

---

## Фаза 4. Документація

Оновити так, щоб ніде не лишилось «JSON — джерело»:

- **`AGENTS.md:43`** — рядок про `npm run convert:yml`: додати, що JSON gitignored і генерується автоматично перед dev/build/test.
- **`AGENTS.md:95`** («Catalog export») — головний абзац. Зафіксувати: YAML — єдине, що комітиться; JSON — локальний build-артефакт, не в git; ручний `convert:yml` потрібен лише щоб оглянути результат.
- **`AGENTS.md:149`** (Sitemap) — уточнити, що `buildSitemapUrls()` читає **згенерований** export.
- **`docs/artist-numbering.md:24`** — зараз каже визначати порядок «за першою появою в `server/data/sentimony-db-export.json`». Перевести на `sentimony-db.yml`.
- **`README.md:173`** — перевірити формулювання про `sentimony-db.yml` як catalog source of truth; воно вже коректне, правити лише якщо згадує JSON.
- **`AGENTS.md:161`** — зараз каже «Спеки й плани — `docs/superpowers/specs|plans/YYYY-MM-DD-<topic>.md`». Ця спека й план лежать у нових `docs/specs/` і `docs/plans/`, тож рядок оновити: нові документи йдуть туди, `docs/superpowers/` лишається архівом historical-записів.

**Не чіпати** `docs/superpowers/{specs,plans}/*` — історичні записи. Нові спека й план живуть у `docs/specs/` і `docs/plans/`.

**Перевірка:**
```bash
npm run docs:check
grep -rn "sentimony-db-export" AGENTS.md README.md docs/artist-numbering.md docs/completed.md docs/initiatives/
```
Кожен вцілілий збіг має описувати JSON як похідний артефакт, не як джерело.

**Коміт:**
```bash
git add AGENTS.md docs/artist-numbering.md docs/specs/2026-08-27-drop-json-export-design.md docs/plans/2026-08-27-drop-json-export.md
git commit -m "docs: describe catalog JSON export as a generated build artifact"
```

---

## Фаза 5. Фінальна верифікація

Симуляція свіжого клону — головний ризик цього плану:

```bash
git stash list                                  # переконатись, що нічого не загубимо
rm server/data/sentimony-db-export.json

npm run test:unit          # зелений
npm run build              # зелений (netlify preset)
npm run build:cf           # зелений (cloudflare_module preset)
npm run docs:check         # зелений
npm run typecheck          # зелений
```

Sync-скрипти — без мережі:
```bash
npm run sync:firebase -- --dry-run
```

E2E — якщо середовище налаштоване (`npm run test:e2e`); інакше явно зазначити в звіті, що пропущено і чому.

**Критерій готовності:** усі команди вище зелені, `git status --short` не показує `sentimony-db-export.json`, а файл при цьому лежить на диску.

---

## Відкрите питання для користувача

`.github/workflows/ci.yml` зараз **untracked** у дереві (і `web-debug.yml` видалений). Якщо CI буде закомічено — його job-и мусять або викликати `npm run convert:yml`, або йти через `test:unit`/`build`, які тягнуть хук самі. Оскільки файл поза git, цей план його не редагує — але при коміті CI перевірити цей пункт.

## Rollback

Кожна фаза — окремий коміт, тож `git revert` точковий. Повне повернення: revert фази 2 і `git add -f server/data/sentimony-db-export.json`.
