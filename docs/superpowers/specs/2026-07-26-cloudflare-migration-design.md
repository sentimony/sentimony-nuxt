# Cloudflare migration

Дата: 2026-07-26. Гілка: `main`. Roadmap: [cloudflare-domain.md](../../roadmap/cloudflare-domain.md).
Плану відповідає [2026-07-26-cloudflare-migration.md](../plans/2026-07-26-cloudflare-migration.md).

## Контекст

Roadmap-пункт існував як `Idea` з 2026-07-22 і явно вимагав інвентаризації перед
будь-яким рішенням. Інвентаризацію виконано 2026-07-26 через Netlify API
(`NETLIFY_AUTH_TOKEN` з `.env/.env.local`), запити до авторитетних DNS-серверів
і HTTP-проби. Нижче — факти, а не припущення; кілька з них змінюють план
порівняно з тим, що передбачав roadmap.

### DNS: зона вже **не** на Netlify

| факт | значення |
|---|---|
| Registrar | Internet Invest, Ltd. dba Imena.ua |
| Domain status | `clientTransferProhibited` |
| Авторитетні NS | 12 × `ns{a,b,c,d}{1,2,3}.srv53.{net,com,org}` (DNS-хостинг Imena.ua) |
| SOA | `nsa1.srv53.net. support.dnshosting.org.` |
| Netlify DNS zone | `sentimony.com` id `592b340ecf321c3f9608c3c4`, NS `dns{1..4}.p03.nsone.net` — **не делеговано** |

Тобто зона в Netlify DNS існує, але мертва: вона тримає лише 4 записи й apex A
`75.2.60.5`, тоді як живий apex — `104.198.14.52`. Наслідок для міграції
позитивний: **переїзд DNS — це зміна NS у панелі Imena.ua**, а не відв'язування
від Netlify DNS. Мертву зону в Netlify треба видалити окремо, щоб вона не
збивала майбутню діагностику.

### Живі записи (з `nsa1.srv53.net`)

| host | тип | значення | HTTP |
|---|---|---|---|
| `sentimony.com` | A | `104.198.14.52` | 200 |
| `sentimony.com` | TXT | `google-site-verification=1weMlNgNhGhSlAC_zfNU9w0nk_eCfipsNF9wTv-OpAE` | — |
| `www` | CNAME | `sentimony-nuxt.netlify.com` | 301 → apex |
| `content` | CNAME | `sentimony-content.netlify.com` | 200 |
| `img` | CNAME | `sentimony-content.netlify.com` | **000 (TLS fail)** |
| `jekyll` | CNAME | `sentimony-jekyll.netlify.com` | 200 |
| `gatsby` | CNAME | `sentimony-gatsby.netlify.com` | 200 |
| `irukanji` | CNAME | `irukanji-gatsby.netlify.com` | 200 |
| `aquadeep` | CNAME | `aquadeep-jekyll.netlify.com` | 200 |

MX-записів немає — пошта на домені не обслуговується, тому найтиповіший ризик
NS-міграції (втрата пошти) тут відсутній. CAA немає, тому Cloudflare зможе
випустити сертифікат без додаткових дій.

Дві аномалії, знайдені при інвентаризації:

1. **`img.sentimony.com` зламаний.** Запис вказує на `sentimony-content`, але
   цей хост не доданий доменним аліасом на сайті, тому сертифікат його не
   покриває і TLS-хендшейк падає. Запис або мертвий, або залишок; його треба
   свідомо або видалити, або полагодити — не переносити мовчки.
2. **`sentimony.com` A вказує на legacy-IP Netlify** `104.198.14.52`; поточний
   рекомендований apex — `75.2.60.5` (саме він лежить у мертвій Netlify-зоні).
   Після переїзду apex стане CNAME-flattened записом Cloudflare, і питання
   зникає, але це підтверджує, що зона роками не переглядалась.

### Піддомени та сайти Netlify

Обліковий запис Netlify тримає 30 сайтів; до `sentimony.com` дотичні шість:

| Netlify site | repo | домен |
|---|---|---|
| `sentimony-nuxt` | `sentimony/sentimony-nuxt` | `sentimony.com` (цей проєкт) |
| `sentimony-content` | `sentimony/sentimony-images` | `content.sentimony.com` |
| `sentimony-jekyll` | `sentimony/sentimony-jekyll` | `jekyll.sentimony.com` |
| `sentimony-gatsby` | `ihororlovskyi/sentimony-gatsby` | `gatsby.sentimony.com` |
| `irukanji` | `ihororlovskyi/irukanji-gatsby` | `irukanji.sentimony.com` |
| `aquadeep-jekyll` | `sentimony/aquadeep-jekyll` | `aquadeep.sentimony.com` |

Розбіжність, яку треба тримати в голові: Netlify-сайт `irukanji` заявляє
custom domain `irukanji.sentimony.com`, але DNS указує на
`irukanji-gatsby.netlify.com` — тобто на **іншу**, старішу назву сайту.
Перевірити перед перенесенням запису.

### Cloudflare вже частково використовується

735 значень `audio_url` у `server/data/sentimony-db.yml` вказують на
`https://pub-38745cb64da2489d8cc71777425fd24b.r2.dev/...` — це публічний
dev-домен бакета Cloudflare R2 (наповнюється з `sentimony-audio-manager`). Отже
обліковий запис Cloudflare **вже існує**, і аудіо вже роздається Cloudflare,
просто через небрендований, слабко кешований `r2.dev`. Це знімає з плану крок
«створити обліковий запис» і додає окрему можливість (`audio.sentimony.com`).

Картинки натомість лежать на `content.sentimony.com` — окремому Netlify-сайті з
іншого репозиторію. Він **не** входить в обсяг цієї міграції як runtime, але
входить як DNS-запис і як окрема ціль вимірювань: 667 посилань каталогу ведуть
саме туди, тому його TTFB прямо впливає на LCP сторінок.

### Прив'язки до Netlify в коді

| місце | що саме |
|---|---|
| `nuxt.config.ts:82` | `nitro.preset: 'netlify'` |
| `nuxt.config.ts:173` | sitemap gate читає `process.env.URL` і `process.env.CONTEXT` — build-env Netlify |
| `server/utils/cachePolicy.ts:7,14,20` | три правила на заголовку `Netlify-CDN-Cache-Control` |
| `tests/unit/cachePolicy.test.ts` | закріплює саме цей заголовок |
| `netlify.toml` | build/contexts, `[images] remote_images`, `[functions] node_bundler`, `@netlify/plugin-lighthouse`, 8 прив'язок edge-функцій |
| `netlify/edge-functions/` | `blocking.ts`, `redirects.ts` активні; `trailing-slash-*.ts` закоментовані в `netlify.toml` |
| `package.json` | `deploy:stage` / `deploy:prod` через `netlify-cli@26` |
| `app/utils/sanitizeHtml.ts:80` | коментар про CJS-lambda Netlify (обмеження зникає на Workers) |
| `.github/workflows/web-debug.yml` | білдить `node-server`, а не `netlify` — CI вже платформо-нейтральний |

Головний позитивний висновок ревізії коду: **у `server/` і `app/` немає жодного
імпорту `node:*`**. Єдина неHTTP-залежність — статичний `import` JSON-експорту
каталогу в `server/api/__sitemap__/urls.get.ts`, який бандлиться. Тобто
серверний код портується на Workers без переписування.

## Рішення

### Рішення 1: чотири фази з окремими воротами, а не один переїзд

| фаза | що змінюється | request path | зворотність |
|---|---|---|---|
| 0. Baseline | нічого в проді; додається вимірювальний інструмент | без змін | н/д |
| 1. DNS | NS у Imena.ua → Cloudflare, режим **DNS-only** | **без змін** | NS назад, ~TTL |
| 2. Runtime stage | Nuxt на Workers під тимчасовим хостом | без змін для прода | видалити Worker |
| 3. Runtime cutover | `sentimony.com` → Worker | змінюється | DNS назад на Netlify |
| 4. Опції | `audio.sentimony.com`, чистка `img`, `content` | точково | точково |

Ключове рішення всередині: **фаза 1 йде в режимі DNS-only (сірa хмара), без
проксі**. Проксіювання Netlify через Cloudflare додало б зайвий мережевий хоп і
другий рівень кешу поверх уже наявного, і зіпсувало б порівнюваність замірів.
Мета фази 1 — лише отримати керування зоною; підтвердженням її коректності є
те, що заміри **не змінилися** в межах шуму. Оранжева хмара вмикається тільки
там, де Cloudflare стає походженням (фаза 3).

### Рішення 2: заміри є передумовою, а не побічним продуктом

Roadmap-пункт [mobile-performance](../../roadmap/mobile-performance.md) уже
вимагає baseline, але вимірює лабораторний Lighthouse на stage. Для міграції
потрібне інше: **час першого завантаження реальних сторінок з мережі**, знятий
однаково до і після, інакше після переїзду не буде даних для наступних кроків
оптимізації.

Інструмент — `scripts/perf-baseline.mjs`, без нових залежностей:

- **Network-збирач (завжди).** Для кожного маршруту: `ttfbMs` (до заголовків),
  `totalMs` (до кінця тіла), `bytes`, `status`, стан кешу з відповіді
  (`cf-cache-status` / `cache-status` / `x-nf-request-id`), `age`.
- **Cold vs warm.** `cold` — унікальний `?_pb=<uuid>`, який гарантовано промахує
  повз CDN (і Netlify, і Cloudflare за замовчуванням варіюють ключ кешу за
  повним query string), тобто міряє SSR-походження. `warm` — той самий URL
  двічі, береться друга спроба, тобто міряє edge-hit. Різниця між ними — і є
  та величина, яку міграція має зрушити.
- **Повтори й агрегація.** `PERF_RUNS` (типово 5) прогонів; у звіт ідуть
  `min`, `median`, `p95` — не середнє, бо хвіст важливіший за середину.
- **Маршрути.** Один представник кожного типу сторінки — той самий набір, що
  вже описаний у `scripts/web-debug.mjs`. Щоб два скрипти не розходились,
  список витягується в спільний `scripts/lib/routes.mjs`, який обидва
  споживають. Це не нова абстракція заради абстракції: два споживачі є одразу.
- **Асети окремо.** До набору додаються не-HTML цілі, бо вони визначають LCP:
  одна картинка `content.sentimony.com` (`_th` і `_xl`) і один `audio_url` з
  `r2.dev`. Вони живуть поза Nuxt, але всередині користувацького досвіду.
- **PSI-збирач (опційно).** Якщо задано `PSI_API_KEY`, скрипт додатково тягне
  PageSpeed Insights (mobile) для підмножини маршрутів і кладе в той самий
  JSON `performance`, `LCP`, `TBT`, `CLS`, `FCP`. PSI обрано замість
  локального Lighthouse свідомо: він не залежить від навантаження ноутбука,
  тому «до» і «після» справді порівнювані. Без ключа збирач тихо пропускається
  — не блокує фазу 0.

Артефакти: JSON у `docs/audits/data/<label>.json`, читабельний звіт —
датований аудит у `docs/audits/`. Кожна фаза дописує в той самий аудит нову
колонку, а не створює новий файл, щоб порівняння лишалось в одному місці.

### Рішення 3: preset `cloudflare_module`, не Pages

Nitro пропонує `cloudflare_module` (Workers) і `cloudflare_pages`. Workers —
рекомендований провайдером шлях і єдиний, що дає прямий доступ до KV/R2/D1
bindings; Pages лишаються для випадків, яких тут немає. Конфігурація:

```jsonc
// wrangler.jsonc
{
  "name": "sentimony-nuxt",
  "main": ".output/server/index.mjs",
  "compatibility_date": "2026-07-26",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".output/public", "binding": "ASSETS" },
  "observability": { "enabled": true }
}
```

`compatibility_date` мусить бути ≥ `2024-09-19` (нижче — Workers не вміють
static assets), `nodejs_compat` обов'язковий для транзитивних залежностей
Supabase SDK.

### Рішення 4: заголовки кешу — стандартні, з перевіркою, а не з вірою

`Netlify-CDN-Cache-Control` Cloudflare не розуміє. Замість заміни правил
`server/utils/cachePolicy.ts` починають віддавати **обидва** заголовки:
`Netlify-CDN-Cache-Control` (щоб фаза 2 не зламала живий прод на Netlify) і
стандартний `CDN-Cache-Control` з тим самим значенням. Netlify ігнорує чужий
стандартний заголовок, Cloudflare — свій.

Свідоме обмеження: те, що Cloudflare шанує `CDN-Cache-Control` на поточному
тарифі, **не приймається на віру**. У плані є окремий крок, який на stage
дивиться на `cf-cache-status` і фіксує факт. Якщо заголовок не спрацює,
запасний шлях — Cache Rules у зоні, описані як конфігурація в репозиторії.

Друге обмеження, важливіше: `defineCachedEventHandler` на Workers має
in-memory сховище **на ізолят**, а не спільне. Тобто серверний кеш каталогу
після переїзду перестає бути спільним шаром і вироджується в кеш «теплого»
ізоляту. Це не регресія за умови, що CDN-шар працює (він і був основним), але
має бути виміряно, а не припущено: саме тому cold/warm розділені у замірах.
Якщо різниця виявиться значущою — прив'язується KV через
`nitro.cloudflare.wrangler` і Nitro-сторедж переводиться на нього.

### Рішення 5: edge-функції розходяться за призначенням

Дві активні функції мають різну природу, і зливати їх в одне рішення шкідливо:

- **`blocking.ts`** (сканери PHP/WP/admin) — це фільтр сміттєвого трафіку. На
  Cloudflare йому місце в WAF custom rule на рівні зони: спрацьовує до
  Worker-а, не витрачає його виклики й CPU. Логіка залишається в репозиторії
  як декларація правила, а не як код.
- **`redirects.ts`** (legacy `.htm`/`.html`, `/login`, мертвий `googleplay`) —
  це частина контракту сайту, вона мусить лишатись версійованою й тестованою
  разом із кодом. Переноситься в Nitro (`routeRules` для статичних відповідників
  і серверний middleware для регулярних), тобто працює на будь-якому хості й
  покривається Vitest. Побічний виграш: ці редиректи почнуть працювати і в
  локальній розробці, де edge-функцій просто немає.

`trailing-slash-*.ts` закоментовані в `netlify.toml` — вони видаляються, а не
переносяться. Переносити неактивний код на нову платформу немає підстав.

`@netlify/plugin-lighthouse` не має аналога і зникає; його роль перебирає
вимірювальний інструмент з фази 0, який до того ж працює однаково на обох
платформах.

### Рішення 6: sitemap-gate стає платформо-нейтральним

`nuxt.config.ts:173` вимикає sitemap за `process.env.URL?.includes('stage')` і
`process.env.CONTEXT !== 'deploy-preview'`. Обидві змінні — Netlify-специфічні,
на Workers вони порожні, тому stage почав би індексуватись. Умова замінюється
на явну `NUXT_SITEMAP_ENABLED` (типово `true`), яку кожне середовище виставляє
самостійно. Це прибирає приховану залежність від імені платформи.

### Рішення 7: що **не** входить в обсяг

- Міграція `content.sentimony.com` як runtime (інший репозиторій, окреме
  рішення). Тут переноситься лише DNS-запис і додаються заміри.
- Міграція `jekyll`, `gatsby`, `irukanji`, `aquadeep` як runtime — переносяться
  тільки DNS-записи, сайти лишаються на Netlify.
- Supabase, Firebase, R2-бакет — не змінюються.
- Перепис 735 `audio_url` на `audio.sentimony.com` — окрема фаза 4 з власними
  воротами, бо це зміна даних каталогу з ресинком, а не інфраструктури.

## Ризики

| ризик | ймовірність | пом'якшення |
|---|---|---|
| Ліміт розміру Worker-скрипта (1 MiB gzip на free, 3 MiB на paid) | середня | виміряти `.output/server` одразу після першого білда, до будь-якого DNS-руху |
| CPU-ліміт Worker на SSR важких сторінок | низька | `observability` увімкнено, cold-заміри на stage до cutover |
| `CDN-Cache-Control` не шанується на тарифі | середня | окремий крок перевірки `cf-cache-status`; запасний шлях — Cache Rules |
| Втрата спільного Nitro-кешу | висока (за замовчуванням) | розділені cold/warm заміри; за потреби KV-binding |
| NS-зміна ламає невідомий піддомен | низька | повний інвентар вище знято до руху; TTL знижується до 300 s заздалегідь |
| Немає per-PR deploy previews як у Netlify | середня | Workers version preview URLs; CI лишається на `node-server` |
| Регресія SEO через зміну заголовків/редиректів | низька | `web-debug` + новий тест редиректів; sitemap-gate стає явним |

## Критерії приймання

- Baseline знято до будь-якої зміни інфраструктури і закомічено.
- Після фази 1 заміри збігаються з baseline у межах шуму (медіана TTFB ±15%).
- Після фази 3 є заповнена таблиця «до / після» по кожному типу сторінки,
  cold і warm окремо.
- Усі маршрути `web-debug` здорові на новому хості до перемикання DNS.
- Кожна фаза має описаний і **перевірений** відкат, а не лише задекларований.
- `netlify/edge-functions/` видалено тільки після того, як їхня поведінка
  відтворена й покрита тестами.
