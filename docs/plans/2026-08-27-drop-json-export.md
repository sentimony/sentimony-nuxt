# План: `sentimony-db-export.json` → build-артефакт

**Спека:** [`docs/specs/2026-08-27-drop-json-export-design.md`](../specs/2026-08-27-drop-json-export-design.md)
**Дата:** 2026-08-27
**Варіант:** A — JSON лишається на диску, зникає з git.

## Контекст для виконавця

- Гілка `main`. У дереві є **незв'язані незакомічені зміни** (`README.md`, `package.json`, `scripts/skills.sh`, `.github/workflows/*`, обидва db-файли). Тому кожен `git add` перелічує файли явно; **`git add -A` заборонено**, amend у попередні коміти — теж.
- Кожна фаза — свій коміт.
- **Перед кожним `git commit` звіряти індекс з allowlist фази:** `git diff --cached --name-only`. `git add <paths>` не захищає від того, що в індексі вже лежить чужа зміна, застейджена раніше.
- Вміст каталогу (`sentimony-db.yml`) у цьому плані **не редагується**.

---

## Фаза 0. Precondition: звірити YAML і JSON

Мета — переконатися, що поточні modified-копії не розійшлися, перш ніж фіксувати YAML як єдине джерело.

**Порівнювати треба non-destructively:** `npm run convert:yml` беззастережно перезаписує JSON (`scripts/convert-yml-json.mjs`), тому спершу генеруємо очікуваний результат у temp і робимо semantic diff проти файлу на диску — інакше ручна правка JSON зникне ще до того, як ми її побачимо.

```bash
node -e "
const {isDeepStrictEqual}=require('util'); const {parse}=require('yaml'); const fs=require('fs');
const j='server/data/sentimony-db-export.json';
if (!fs.existsSync(j)) { console.log('no JSON on disk - nothing to compare'); process.exit(0) }
const ok = isDeepStrictEqual(
  parse(fs.readFileSync('server/data/sentimony-db.yml','utf-8')),
  JSON.parse(fs.readFileSync(j,'utf-8'))
);
console.log('in sync:', ok); process.exit(ok ? 0 : 1)
"
```

`isDeepStrictEqual` замість порівняння серіалізованих рядків: `JSON.stringify` залежить від порядку ключів і дав би хибний drift на еквівалентних даних. Відсутній файл і drift розрізняються exit-кодом (0 / 1), а не лише виводом у stdout.

**Очікування:** `in sync: true` — JSON відповідає YAML, генерація нічого не втратить.

**Якщо `in sync: false` (exit 1) — зупинитись і показати розбіжність користувачу.** Це означає, що JSON редагували руками повз YAML, і треба вирішити, який бік правильний. Не запускати `convert:yml` до цього рішення: він знищить правку, якої немає в YAML.

Якщо JSON на диску відсутній — команда це друкує і виходить з 0: звіряти нічого, крок пройдено.

Комітів немає.

---

## Фаза 1. Хуки генерації

Без них свіжий клон і CI ламаються — робимо це **до** видалення файлу з git.

У `package.json#scripts` додати п'ять хуків:

```json
"predev": "npm run convert:yml",
"prebuild": "npm run convert:yml",
"pretest:unit": "npm run convert:yml",
"pregenerate": "npm run convert:yml",
"pretypecheck": "npm run convert:yml"
```

`pretypecheck` і `pregenerate` — **обов'язкові, не опційні**: обидві команди резолвлять import `sentimony-db-export.json`, не запускаючи build. На чистому checkout без них `typecheck` падає з `TS2307` і виходить з кодом 2 (тобто CI-job `Typecheck` червонітиме на кожному PR), а `generate` — з Rollup `Could not resolve`.

Зауваги:
- `prebuild` покриває і `build:cf`, бо той викликає `npm run build` всередині.
- `sync:firebase` / `sync:supabase` уже роблять `convert:yml` явно — не чіпати.
- `sync:*` викликають `convert:yml` явно всередині, тож дублювати хук для них не треба.

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

   Обидва твердження хибні: пише він саме в `sentimony-db-export.json`, і він канонічний. Замінити на опис, що це єдиний генератор похідного export-у, який запускається автоматично п'ятьма хуками (`predev`, `prebuild`, `pretest:unit`, `pretypecheck`, `pregenerate`) і всередині `sync:*`.

**Перевірка:**
```bash
# executable references only - historical docs are allowed to mention it
grep -rn "convert-json-yml" --include="*.json" --include="*.mjs" --include="*.sh" --include="*.yml" . | grep -v node_modules
```
Очікування: **жодного** збігу. Docs шукати окремо (`--include="*.md"`) — там легальні згадки лишаються в `docs/superpowers/` і в цих спеці й плані, тож змішувати обидві перевірки в один grep не можна: він завжди «щось знаходить» і перестає бути сигналом.

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

- **`AGENTS.md:43`** — рядок про `npm run convert:yml`: додати, що JSON gitignored і генерується автоматично хуками `predev` / `prebuild` / `pretest:unit` / `pretypecheck` / `pregenerate`.
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
# операційні коментарі в скриптах - окремо
grep -rn "sentimony-db-export\|editing the JSON" scripts/
```
Кожен вцілілий збіг має описувати JSON як похідний артефакт, не як джерело. Зокрема `scripts/sync-field.mjs` і `scripts/sync-track-audio.mjs` радили редагувати JSON — під варіантом A це тихий data loss при наступному `sync:supabase`, тому їхні docstring-и правляться теж.

**Коміт:**
```bash
git add AGENTS.md docs/artist-numbering.md docs/specs/2026-08-27-drop-json-export-design.md docs/plans/2026-08-27-drop-json-export.md scripts/sync-field.mjs scripts/sync-track-audio.mjs
git commit -m "docs: describe catalog JSON export as a generated build artifact"
```

---

## Фаза 5. Фінальна верифікація

Симуляція свіжого клону — головний ризик цього плану:

**Видаляти JSON перед КОЖНОЮ командою.** Перша ж команда генерує його хуком, тож наступні перевірятимуть уже наявний файл — і відсутність артефакту не протестується. Найнадійніше — одноразовий checkout:

```bash
src=$PWD
verify=$(mktemp -d) || exit 1
git clone --no-hardlinks -b drop-json-export "$src" "$verify" || exit 1
cd "$verify" || exit 1
npm ci || exit 1
cp "$src"/.env/.env "$src"/.env/.env.local .env/ || exit 1    # креди для nuxt

json=server/data/sentimony-db-export.json
fail=0
for cmd in test:unit build build:cf typecheck; do
  rm -f "$json" || { echo "FAILED: rm before $cmd"; fail=1; continue; }
  npm run "$cmd" || { echo "FAILED: $cmd"; fail=1; }
done
npm run docs:check || fail=1

# generate: дозволена лише передіснуюча prerender-помилка, будь-яка інша - fail
log=$(mktemp)
rm -f "$json" || { echo "FAILED: rm before generate"; fail=1; }
npm run generate > "$log" 2>&1; gen=$?
markers='ERROR|FATAL|npm error|Error:|error during build|Exception'
plain="$log.plain"
sed $'s/\033\\[[0-9;]*m//g' "$log" > "$plain"   # Nitro фарбує вивід ANSI-кодами

# Could not resolve - завжди регресія цієї ініціативи, навіть при exit 0
if grep -q 'Could not resolve' "$plain"; then
  echo "FAILED: generate (JSON resolve)"; fail=1
elif [ $gen -eq 0 ]; then
  echo "generate: green"
elif [ $gen -ne 1 ]; then
  # prerender-падіння Nuxt - це рівно exit 1; 2, 137, 139 - щось інше
  echo "FAILED: generate (unexpected exit code $gen)"; tail -30 "$plain"; fail=1
elif ! grep -q '^Errors prerendering:' "$plain" || ! grep -q 'Exiting due to prerender errors\.' "$plain"; then
  echo "FAILED: generate (exit 1 without the known prerender block)"; tail -30 "$plain"; fail=1
elif grep -E '├──[[:space:]]*\[[0-9]{3}\]' "$plain" | grep -qvE '\[404\] (Unknown platform|Artist not found)'; then
  # серед failed-маршрутів є помилка, відмінна від двох відомих (код + текст разом)
  echo "FAILED: generate (prerender error other than the known ones)"
  grep -E '├──[[:space:]]*\[[0-9]{3}\]' "$plain" | grep -vE '\[404\] (Unknown platform|Artist not found)' | head -5; fail=1
elif ! grep -qE '├──[[:space:]]*\[404\] Unknown platform' "$plain"; then
  echo "FAILED: generate (no Unknown platform route error found)"; tail -30 "$plain"; fail=1
else
  # зняти рядки відомого блоку і перевірити, чи лишились failure-маркери
  grep -vE '\[404\] (Unknown platform|Artist not found)|Exiting due to prerender errors\.|Linked from |^Errors prerendering:' "$plain" \
    | grep -E "$markers" > "$log.rest"
  if [ -s "$log.rest" ]; then
    echo "FAILED: generate (extra errors beyond the known prerender one)"
    head -5 "$log.rest"; fail=1
  else
    echo "generate: pre-existing prerender failure only, allowed"
  fi
fi

# заявлені preconditions - теж частина harness-а, а не ручна перевірка
git status --short | grep -q 'sentimony-db-export.json' && { echo "FAILED: JSON is dirty"; fail=1; }
git ls-files --error-unmatch "$json" >/dev/null 2>&1 && { echo "FAILED: JSON is still tracked"; fail=1; }
[ -f "$json" ] || { echo "FAILED: JSON missing on disk after builds"; fail=1; }

exit $fail
```

Підготовка harness-а завершується `|| exit 1` на кожному кроці: без цього падіння `git clone`, `npm ci` чи `cp` не зупинило б сценарій і решта команд виконалася б у **поточному** дереві, де JSON уже є, — тобто перевірка свіжого клону не відбулася б узагалі. `mktemp -d` замість фіксованого `/tmp/verify`, щоб повторний прогін не впирався в зайняту теку. `set -e` для самого циклу не годиться — він обірве на першій помилці, а хочеться побачити всі за один прогін, тому цикл накопичує exit-коди й завершується ненульовим.

**Виняток для `generate`** тому й винесений з циклу: він доходить до **двох** передіснуючих prerender-помилок — `[404] Unknown platform` (`server/utils/platformRedirect.ts:12`, з коміту `7093c30`) і `[404] Artist not found` — і жодна не є регресією цієї ініціативи, а всередині циклу `fail=1` від нього робив би результат ненульовим завжди. Пройденим крок вважається, якщо `generate` зелений **або** виконані всі умови: `Could not resolve` у лозі відсутній, exit-код рівно `1`, у лозі є обидва маркери блоку (`Errors prerendering:` і `Exiting due to prerender errors.`), кожен рядок-помилка маршруту (`│ ├── [код] …`) — одна з двох відомих (`[404] Unknown platform` або `[404] Artist not found`), і після зняття рядків блоку не лишилося failure-маркерів.

Кожна з умов закриває конкретний false green, який давали простіші версії:
- **`Could not resolve` — до розгалуження за exit-кодом.** Це маркер регресії саме цієї ініціативи (JSON-import не резолвиться), тож зелений вихід із ним у лозі — теж fail; гілка «exit 0 → пропустити аналіз» його проковтувала.
- **Exit-код рівно `1`.** Prerender-падіння Nuxt дає `1`; `2`, `137` (OOM-kill) чи `139` означають щось геть інше, і без цієї перевірки лог із валідною парою плюс тихий signal-kill проходив як зелений.
- **Перевіряється кожен рядок-помилка маршруту, а не їх кількість.** Nitro друкує `  │ ├── [404] Unknown platform` на кожен упалий маршрут (18 у прогоні 2026-08-27; число плаває між прогонами залежно від того, скільки маршрутів встигло обійти), плюс необов'язковий `  │ └── Linked from …`. Зайва помилка іншого роду з'явиться в такому ж рядку серед сотень однакових і не додасть жодного нового `ERROR`-рядка, тому лічильники й фільтри по `ERROR` її не бачать.
- **Дозволені рівно дві помилки маршрутів, обидві іменовані.** `[404] Unknown platform` (424 маршрути в прогоні 2026-08-27) — з `platformRedirect.ts:12`. `[404] Artist not found` (12 маршрутів, лінковані з `/playlist/psychill-psybient`, `/playlist/dark-prog-zenonesque` і шести релізів) — наслідок зіпсованих `artist_slug` у самому каталозі: `e`, `no`, `u`, `jai`, `sol` і порожні рядки, з яких `splitTitleByArtists` (`app/utils/tracks.ts:42`) будує неіснуючі маршрути `/artist/e`. Що це передіснує, доведено звіркою з `main`: `git show 6c1ca79:server/data/sentimony-db.yml` дає ті самі значення в тій самій кількості, а код (`app/`, `server/`, `nuxt.config.ts`) між `main` і гілкою не змінювався взагалі. Виправлення цих даних — окрема ініціатива: спека виносить «будь-які зміни вмісту каталогу» за скоуп, і кожен запис потребує рішення, який артист мався на увазі. Обидві звіряються **разом із кодом** (`\[404\] (Unknown platform|Artist not found)`), а не лише за текстом: інакше `[500] Unknown platform` — знайомий текст під чужим кодом — прослизнув би як відомий, бо позитивна перевірка нижче вимагає лише **одного** справжнього `[404] Unknown platform` у лозі. Будь-який інший код чи текст крок далі валить.
- **Обидва маркери блоку обов'язкові.** `Errors prerendering:` відкриває перелік, `Exiting due to prerender errors.` — рядок, з яким Nitro кидає фінальний `Error` (`nitropack/dist/core/index.mjs:2191`). Exit 1 без них означає падіння геть іншої природи. Заголовка `ERROR  Nuxt prerender error` в Nitro **не існує** — рання версія цього harness-а перевіряла саме його і давала хибний fail на першому ж реальному прогоні.
- **Набір маркерів ширший за `ERROR`:** `npm error`, `Error:`, `FATAL`, `error during build`, `Exception` — інакше падіння самого npm або невідформатований stack trace проходили повз uppercase-фільтр. Лічильники ERROR-рядків не годяться зовсім: вони пропускають зайву помилку, якщо очікуваний блок дає стільки ж збігів.

Патерни звірені з **реальним логом** прогону 2026-08-27 (збережений як артефакт), а не з синтетичних прикладів. Формат рядка — `  │ ├── [404] Unknown platform`: box-drawing префікс без слова `Error:`. Дві попередні версії цього класифікатора вигадували формат (`ERROR  Nuxt prerender error`, потім `└── Error:`) і давали хибний fail на першому ж живому прогоні. Якщо майбутня версія Nitro змінить формулювання, крок впаде як `no prerender block` або `no Unknown platform route error` — хибний fail, а не хибний green.

**ANSI.** Nitro фарбує вивід escape-кодами, тому лог спершу проганяється через `sed` і всі перевірки йдуть по очищеній копії: `grep` по сирому логу не збігався б з `Exiting due to prerender errors.`, обгорнутим у `\033[31m…\033[0m`.

Класифікатор перевірений на синтетичних логах — цей набір лишається як регресійні фікстури, будь-яка його зміна має пройти всі дев'ять:

| Лог (у форматі, який реально друкує Nitro) | Очікування |
| --- | --- |
| `Errors prerendering:` + `│ ├── [404] Unknown platform` + `Exiting due to prerender errors.` | ALLOWED |
| те саме + `│ └── Linked from /release/…` | ALLOWED |
| те саме + `Could not resolve "…sentimony-db-export.json"` | FAIL (resolve) |
| exit 0, чистий лог | ALLOWED (green) |
| exit 0, але в лозі `Could not resolve` | FAIL (resolve) |
| валідний блок, але exit 137 | FAIL (unexpected exit code) |
| exit 1 без `Errors prerendering:` / `Exiting due to…` | FAIL (no prerender block) |
| серед маршрутів є `│ ├── [404] Artist not found` | ALLOWED (друга відома помилка) |
| серед маршрутів є `│ ├── [500] Internal Server Error` | FAIL (other route error) |
| серед маршрутів є `│ ├── [500] Unknown platform` (знайомий текст, чужий код) | FAIL (other route error) |
| відомий блок + окремий `npm error code 137` | FAIL (extra) |

Ключовий рядок — передостанній: зайва помилка не додає нового `ERROR`-рядка, а ховається серед однакових рядків маршрутів (`Artist not found` серед `Unknown platform` — реальний випадок із прогону 2026-08-27). Тому перевіряється кожен рядок `│ ├── [код] …`, а не їх кількість.

`typecheck` перевіряти саме на exit code (`echo $?`), а не на вивід: `nuxt typecheck` друкує помилки `TS2307` і виходить з кодом 2, який легко пропустити у хвості логу.

Sync-скрипти — без мережі:
```bash
npm run sync:firebase -- --dry-run
```

E2E — якщо середовище налаштоване (`npm run test:e2e`); інакше явно зазначити в звіті, що пропущено і чому.

**Критерій готовності:** harness завершується з exit 0. Це покриває все: `test:unit` / `build` / `build:cf` / `typecheck` / `docs:check` зелені, `generate` або зелений, або впав саме на `Unknown platform`, `git status --short` не показує `sentimony-db-export.json`, `git ls-files --error-unmatch` не знаходить його серед tracked (окрема перевірка: чистий tracked-файл у `git status` не з'явився б узагалі), а файл при цьому лежить на диску. Останні дві умови перевіряє сам скрипт — окремих ручних кроків після нього немає.

---

## CI (вирішено)

`.github/workflows/ci.yml` закомічено (замінив видалений `web-debug.yml`). Його job-и покриті хуками: `unit` іде через `test:unit` (`pretest:unit`), `smoke` — через `build` (`prebuild`), `typecheck` — через `pretypecheck`. Окремого виклику `convert:yml` у workflow не потрібно.

## Rollback

Відображення фаз на коміти **не 1:1** — хуки додавалися трьома заходами, тому revert робиться за SHA, не за номером фази:

| Що | Коміт |
| --- | --- |
| Фаза 1: три хуки (`predev`, `prebuild`, `pretest:unit`) | `1e0515b` |
| Фаза 1 (добірка): `pretypecheck`, `pregenerate` | `67ea3a4` |
| Фаза 2: untrack + `.gitignore` | `9076802` |
| Фаза 3: видалення reverse-конвертера | `3c34830` |
| Фаза 4: документація | `decccc6` |
| Поза планом: `prepare:types` (фікс CI) | `17bb5b8` |
| Поза планом: атомарний запис export-у | `8176622` |

- **Частковий** (повернути лише tracking JSON): `git revert 9076802`. Цей коміт містить і видалення файлу, і правило в `.gitignore`, тож revert відновлює обидва узгоджено — `git add -f` після нього не потрібен. Хуки, видалений reverse-конвертер і docs лишаються зміненими: стан буде змішаний, але робочий.
- **Повний** (повернути ініціативу цілком): revert у зворотному хронологічному порядку — `8176622`, `decccc6`, `3c34830`, `9076802`, `67ea3a4`, `1e0515b`. `17bb5b8` (`prepare:types`) **не чіпати**: він лагодить падіння vitest на чистому checkout, яке існує незалежно від цієї ініціативи.
