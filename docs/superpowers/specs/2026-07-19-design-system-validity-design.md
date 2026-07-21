# Design system validity (PRODUCT.md §10, ROADMAP P3 #12)

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст (аудит уже знято)

- Токени **повні й валідні**: `app/assets/css/tailwind.css` має повний light (`:root`) / dark (`.dark`) набір семантичних кольорів (`background/foreground`, `card`, `muted`, `accent`, `border`, `ring`, …), зареєстрованих у `@theme inline`.
- Проблема — використання: **304** входження hardcoded `(text|bg|border)-(white|black)/N` у `app/`; **89** `dark:`-варіантів. Два патерни:
  1. «парні дублі» — `border-black/10 dark:border-white/10` (рукописна light-адаптація там, де мав бути токен `border-foreground/10`);
  2. «без light-адаптації» — фіксовані white-on-dark без `dark:` (у light-темі ламається контраст): `GenreTabs`, `ReleasesFiltered`, `ThemeToggle`, `error.vue`, сторінки `artists/*`, `news`, `releases/all`, `tracks`, і частково `Header` (hover-стани `hover:bg-white/30` невидимі в light).
- Топ-файли: `track/[id].vue` (16), `OpenSidebar` (15), `Header` (15), `profile/index` (13), `release/[id]` (11), `artist/[id]` (11), плеєр-компоненти.
- **Свідомий виняток**: `Footer.vue` — темна поверхня в обох темах (bg-black/90 + white-текст) — це дизайн-рішення, не борг.

## Рішення

1. **Конвенція мапінгу** (фіксується в AGENTS.md):
   - `X-black/N dark:X-white/N` (та дзеркальні) → `X-foreground/N`;
   - `bg-white/N dark:bg-black/N`-подібні поверхні → `bg-background/N` або `bg-card`;
   - фіксовані white-on-dark у компонентах на звичайному фоні → токенні еквіваленти з `dark:`-переглядом;
   - навмисно темні поверхні (Footer, оверлеї на обкладинках, градієнти атмосфери) позначаються коментарем `<!-- intentional dark surface -->` один раз на компонент і НЕ мігруються.
2. **Порядок міграції** — за впливом на light-тему: (а) файли взагалі без `dark:` (найгірший контраст): `GenreTabs`, `ReleasesFiltered`, `error.vue`, `news`, `artists/index`, `artists/all`, `releases/all`, `tracks`, `ThemeToggle`; (б) hover-стани `Header`/`OpenSidebar`; (в) парні дублі у `profile/index`, detail-сторінках, плеєрах.
3. **Механічна перевірка**: тест `tests/unit/designTokens.test.ts` — грепає `app/` на патерн парних дублів (`-black/\d+ dark:[a-z-]*-white/\d+` і дзеркальний) та на нові hardcoded у мігрованих файлах; список винятків (intentional) — явний масив у тесті. Це зупиняє регрес без ESLint-плагінів.
4. **Верифікація контрасту**: після кожного кластера — обидві теми очима + Lighthouse Accessibility (контраст) на головній, `/releases`, `/artists`, `/track/[id]`, профілі.
5. Поза скоупом: зміна самих токенів, редизайн компонентів, повне «полірування» light-теми за межами контрасту/видимості станів.

## Критерії успіху

- 0 парних `black/white`-дублів поза списком винятків; файли з групи (а) мають коректний вигляд у light.
- Lighthouse Accessibility 100 зберігається в обох темах.
- AGENTS.md містить конвенцію (нові компоненти пишуться токенами).
