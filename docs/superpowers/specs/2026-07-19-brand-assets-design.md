# Brand assets: PWA-іконки + README (PRODUCT.md §9, ROADMAP P3 #11, #13)

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст

- `public/site.webmanifest` має 4 іконки: 192/512 `any` + 192/512 `maskable`; додатково `apple-touch-icon.png` (180), `favicon.*`. Користувачу не подобається вигляд на macOS: логотип впритул до країв, хочеться «випираючих» елементів.
- Master-джерела: `public/images/sentimony-records-logo-v3.3.svg` (використовується в README) + `app/assets/icons/logo.svg`; окремого master-SVG для іконок немає — PNG генерувалися зовні.
- `scripts/verify-pwa.mjs` перевіряє поля manifest і наявність maskable-записів, але не фактичні PNG-файли/розміри.
- README: один бейдж (Netlify status), технології — inline simpleicons `<img>`; немає CI/tests/node/license бейджів.

## Рішення

1. **Єдине джерело іконок**: канонічний `assets/brand/icon-master.svg` (копія/варіант v3.3, підготований до квадратного кадру) комітиться в репо; усі PNG генеруються з нього.
2. **Композиція**:
   - `any` 192/512: логотип на повний кадр, елементи торкаються країв (без safe-area padding) — саме «випираючий» вигляд для macOS dock/списків;
   - `maskable` 192/512: логотип у safe zone (~80% діаметра) на фоні `#111111` — вимога маскування Android;
   - `apple-touch-icon` 180: фон `#111111`, логотип ~85% (iOS сам заокруглює);
   - favicon-и не чіпаємо (задовільні).
3. **Генерація**: одноразовий скрипт `scripts/generate-pwa-icons.mjs` на `npx sharp-cli`-еквіваленті **без додавання залежності в package.json** — рендер SVG→PNG через `npx --yes sharp-cli` (або, якщо недоступно, ручний експорт із фіксацією в PR, чим саме згенеровано). Скрипт комітиться для відтворюваності.
4. **`verify-pwa` розширення**: перевірка, що всі 4 PNG з manifest існують і мають заявлені розміри (читання width/height з PNG-заголовка — 8 байт IHDR, без залежностей).
5. **README**: рядок shields.io-бейджів під заголовком — GitHub Actions (`web-debug.yml` status), Netlify (наявний), node engine (`>=24`), unit tests count (static), license (якщо файлу LICENSE немає — бейдж не додається). Секції `Used` (simpleicons) не чіпаємо — вона вже в дусі референсу AgileCharts.

## Верифікація

- `npm run verify:pwa` зелений (з новими перевірками).
- Ручна перевірка: Add to Dock (macOS Safari/Chrome), Add to Home Screen (Android/еміляція DevTools → maskable коректно обрізається), iOS-іконка.
- README рендериться на GitHub без битих бейджів.

## Ризики

- «Випираючі» `any`-іконки з прозорим фоном можуть виглядати інакше в темних/світлих доках — перевірити на обох; за потреби легка підкладка-тінь у master SVG.
