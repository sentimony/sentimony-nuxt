# CI quality gate (PRODUCT.md §4, ROADMAP P0 #3)

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст (фактичний стан, ROADMAP тут застарів)

- `package.json` **вже має** `typecheck` (`nuxt typecheck`) і `typecheck:ts7` (`tsc -p netlify/tsconfig.json` для edge functions) — пункт ROADMAP про «немає typecheck script» неактуальний.
- `.github/workflows/web-debug.yml` **вже існує** і на push у `main` / PR ганяє: `npm ci` → `typecheck` → `typecheck:ts7` → `test:unit` → `build` (`NITRO_PRESET=node-server`) → старт сервера → `npm run web-debug` smoke.
- Прогалини:
  1. **e2e (Playwright) не запускаються ніде в CI** (`playwright.config.ts` має CI-режим — `forbidOnly`, `retries: 2` — але workflow його не викликає).
  2. CI будує `node-server` preset, а прод — `netlify` preset (CJS lambda); ESM/CJS-mismatch у lambda CI не ловить (задокументовано коментарем у самому workflow).
  3. **Gate не блокує деплой**: Netlify деплоїть за git-trigger незалежно від результатів GitHub Actions; `deploy:stage`/`deploy:prod` — ручні через `netlify-cli`.
  4. `sync:*` ніде не документовано як заборонені в CI.

## Рішення

1. **Розширити наявний workflow, а не створювати паралельний**: `web-debug.yml` перейменовується на роль ci-gate (файл лишаємо тим самим, щоб зберегти історію required-check назв; job `smoke` доповнюється, додається job `e2e`).
2. **e2e у CI**: окремий job із `npx playwright install --with-deps chromium`, `npm run test:e2e` проти dev-сервера (як локально; `PLAYWRIGHT_BASE_URL` дефолтний). Скріншотні тести (`homepage-theme`) чутливі до платформи — у CI запускаємо лише функціональні спеки (`api-security`, `layout-loading`) через `--grep-invert` до стабілізації снапшотів на linux.
3. **Netlify-preset build check**: додатковий крок `NITRO_PRESET=netlify npm run build` (без запуску) — ловить ESM/CJS-помилки бандлінгу lambda, які пропускає node-server build. Це компіляційний smoke, не деплой.
4. **Enforcement**: Netlify (git-triggered deploys) вмикається «Wait for CI» неможливо без Netlify UI; натомість фіксуємо у README/AGENTS правило: прод-деплой (`deploy:prod`) виконується лише після зеленого CI на `main`; у GitHub — branch protection на `main` з required checks `smoke` та `e2e` (налаштовується власником репо в UI; у репо додаємо лише документацію цього правила). Автоматизація Netlify «builds blocked by CI» — поза скоупом (потребує зміни продукту деплою).
5. **`sync:*` у CI заборонені**: явний абзац у workflow-коментарі та в AGENTS.md (уже частково є: «Do not run sync:* unless explicitly asked»); у CI немає секретів `FIREBASE_DB_SECRET`, що робить запуск фізично неможливим — фіксуємо це як інваріант (секрет не додавати).

## Помилки та ризики

- Playwright у CI проти dev-сервера — headers-асерти `api-security` уже написані під dev і проходять локально; якщо на CI headers відрізняються, тест виявить це одразу (falls fast, виправляти асерти не наосліп).
- `netlify` preset build може потребувати env-заглушок — використовуються ті самі GitHub secrets, що вже прокинуті в workflow.
- Час CI зросте (~+3–5 хв на e2e + другий build); прийнятно для gate.

## Тести/верифікація

- Зелений прогін workflow на PR-гілці (обидва jobs).
- Навмисно зламаний тест у PR → червоний gate (перевірка, що checks справді фейлять).
- Документаційні правки: README розділ CI, AGENTS.md рядок про required checks.
