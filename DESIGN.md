# DESIGN.md — Sentimony Records

Дизайн-система сайту psychedelic-лейблу. Документ описує **чинні правила** (як уже зроблено в коді) і **обовʼязкові орієнтири** при розробці нових сторінок та компонентів. Він має пріоритет над абстрактними рекомендаціями: спершу зберігаємо естетику бренду, потім полірування за чек-лістами доступності та якості.

> Tech: Nuxt 4 (SSR/ISR через Netlify) · Tailwind CSS · Vue 3 SFC · `@nuxt/icon` (Iconify) · `v-wave` для тактильного відгуку.

---

## 1. Brand & Mood

| Параметр | Значення |
|----------|----------|
| Назва | Sentimony Records |
| Опис | Psychedelic Music Label |
| URL | https://sentimony.com |
| Тон | Психоделічний, immersive, природа + ніч, ритуальний, контент перш за все |
| Mode | **Dark only**. Світла тема не планується |
| Лого | `https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg` |

**Anti-mood:** корпоративне, плоско-мінімалістичне, неонове кіберпанк, гламур, “SaaS landing”.

---

## 2. Foundations

### 2.1 Колір

Базова палітра побудована на **темно-зеленому фоні з природним фото-бекграундом** і **прозорій шкалі білого** для всіх інтерактивних поверхонь. Бренд НЕ використовує жорстких primary/secondary токенів — натомість живе на opacity-шкалі поверх фото.

| Роль | Значення | Де застосовується |
|------|----------|-------------------|
| Page bg (base) | `bg-green-950` (#052e16) | `body`, fallback під фото |
| Page bg (image) | `https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg` | `body` (fixed, cover) |
| Footer bg | `bg-black` | `Footer.vue` |
| Surface (skim) | `bg-white/5` + `backdrop-blur-sm` | Header, sticky-бари |
| Surface hover | `bg-white/30` | Кнопки, нав-айтеми |
| Surface active | `bg-white/20` | Активний пункт навігації |
| Border | `border-white/30` (header), `border-white/10` (footer nav) | — |
| Text primary | `text-white` | Заголовки, основний текст |
| Text muted | `opacity-60` / `opacity-50` / `opacity-40` | Дескриптори, підписи |
| Text link (на світлому контенті) | `text-blue-700` | Клас `.Content a` |
| Light content surface | `bg-[#b5ccb5] text-black` | Клас `.Content` (тіло релізу/артиста) |
| Badge "Coming Soon" | `bg-green-600` | `Item.vue` |
| Badge "Out Now" | `bg-red-600` | `Item.vue` |
| Tooltip (footer soc) | `bg-[#8a0202]` | Tooltip під соцмережами |
| Shadow | `shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]` | Картки, кнопки, медіа |

**Правила:**
- НЕ вводити нові HEX-и в компонентах. Використовуй чинну opacity-шкалу `white/5 → white/10 → white/20 → white/30`.
- Будь-який новий **акцентний** елемент бере колір із семантики (success → `green-600`, danger → `red-600`).
- Тіло довгого тексту (опис релізу, біо) — на **світлій плашці** (`.Content`), бо біле на фото-фоні погано читається.
- Контраст основного тексту мусить лишатись ≥4.5:1 поверх фото — НЕ опускати білий нижче `opacity-70` для смислового тексту.

### 2.2 Типографіка

Дві шрифтові сімʼї, обидві з Google Fonts:

| Шрифт | Tailwind | Призначення |
|-------|----------|-------------|
| **Montserrat** | `font-montserrat` (default) | Body, navigation, картки, кнопки |
| **Julius Sans One** | `font-julius` | Hero, монументальні заголовки лейбла |

**Шкала розмірів** (responsive, з `tailwind.css` body):
- Body: `text-xs md:text-sm lg:text-base` (12 → 14 → 16px).
- Hero (Julius): від `text-[40px]` (mobile) до `text-[100px]` (xl) з трекінгом `2px → 14px`.
- Підпис hero: від `12px/4px tracking` до `20px/20px tracking`.
- Бадж: `text-[8px] md:text-[10px]`.
- Заголовок логотипа в хедері: `16px / 12px` (тайтл / сабтайтл).

**Правила:**
- Display-текст (uppercase + великий letter-spacing) — тільки для бренд-моментів (Hero, секційні заголовки). Не зловживати в UI-кнопках.
- Body завжди ≥12px на мобільному (Montserrat). Менше — лише декоративні підписи (бейджі, tooltip) і тільки коли поряд є контекст.
- Для довгого читомого тексту ширина рядка 60–75 символів — використовувати плашку `.Content` з max-width.
- НЕ міксувати інші шрифти. Якщо потрібен variety — лише вага/трекінг/кейс Montserrat.

### 2.3 Простір і сітка

Базова ритм-одиниця Tailwind (4px). Найчастіші значення в проєкті: `2 / 3 / 4 / 6 / 8 / 10 / 24`.

- Контейнер: `container max-w-7xl` (хедер) / `container` (футер). Для контент-сторінок використовувати `max-w-[777px]` для довгого тексту або `max-w-7xl` для сіток.
- Хедер sticky: висота `h-[75px]`, внутрішні цілі `h-[56px]`.
- Картка `Item` (мобайл / desktop): `70×70` / `140×140` із внутрішнім зображенням `60×60` / `120×120`.
- Радіус: за замовчуванням `rounded-sm` (2px). Кнопки можуть бути `rounded-md`. Tooltips — `rounded-sm`.
- Vertical rhythm: секції — `py-24` (footer), Hero — `py-[7.5em]…py-[11.5em]` для драматичної тиші навколо.

### 2.4 Ефекти

| Ефект | Значення |
|-------|----------|
| Backdrop blur | `backdrop-blur-sm` (хедер, кнопки) |
| Shadow | `shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]` |
| Transition | `transition-[background-color] ease-in-out duration-300` (hover); `duration-200` (картки) |
| Press feedback | директива `v-wave` на всіх клікабельних елементах |
| Фрактальний шар | компонент `<Fractal />` з `z-[1]`, контент над ним `z-[2]` |
| Анімовані ключкадри | `spin2`, `spin2rev` (декоративне обертання) |

**Правила:**
- `v-wave` обовʼязковий на будь-якому новому клікабельному елементі (NuxtLink, кнопка, соц-айкон).
- Hover завжди робить зміну `bg-white/{20|30}` + `transition-[background-color]`. НЕ використовувати `transform: scale` для hover в навігації.
- Тривалість мікроінтеракцій 200–300ms; вихід трохи швидший за вхід (~70%).

### 2.5 Z-index шкала

З `app.vue` / `Header.vue` / `Footer.vue`:

| Шар | z-index |
|-----|---------|
| Фрактал-фон | `z-[1]` |
| Контент | `z-[2]` |
| Sticky header | `z-20` |
| Соц-tooltip | `z-30` |
| Footer (поверх sticky-елементів за потреби) | `z-100` |

При додаванні модалок/sheet — використовувати `z-[60]` (поверх tooltip, нижче за гіпотетичний overlay `z-[200]`).

### 2.6 Light surfaces (винятки з dark-only)

Сайт dark-only, але існують **точкові світлі поверхні** для випадків, коли білий текст на фото-фоні падає по контрасту або не підходить семантично (форми, довга проза). Це не light mode — це локальні «острівці» з власним контрактом, що співіснують у межах темної сторінки.

| Surface | Bg | Text | Link | Border | Use case |
|---------|----|----|------|--------|----------|
| `.Content` | `bg-[#b5ccb5]` | `text-black` | `text-blue-700` | `border-black/30` | Довга проза: release info, artist bio, tracklist, credits |
| Form input (TBD) | `bg-white/95` | `text-black` | — | `border-black/20` | Текстові інпути логіну/контактів — біле на фото неюзабельно |
| Modal body (TBD) | `bg-[#b5ccb5]` | `text-black` | `text-blue-700` | `border-black/30` | Розширені діалоги з прозою. Швидкі toast'и лишаються dark. |

**Правила введення нової світлої поверхні:**

1. **Тригер:** довжина тексту >2 абзаци АБО потрібен формовий input АБО потрібна висока легібельність незалежно від фото-бекграунду. Інакше — лишаємось dark.
2. **Палітра:** один з токенів вище. НЕ вводити нові HEX. Текст — `text-black`, muted — `text-black/60`, divider — `border-black/30`, link — `text-blue-700`.
3. **Контейнер:** обовʼязкова чітка межа з dark-фоном через `border-t border-white/30` зверху АБО padding-обгортку, щоб світла плашка не виглядала як «помилка теми».
4. **Не перетворювати:** Header / Footer / Item-картки / BtnPrimary / Tabs / Hero — це бренд-поверхні, лишаються dark. Light — тільки контент і форми.
5. **Like/CTA-кнопки на світлій плашці:** використовувати `border-black/30 text-black/60` (як уже зроблено для track-like у release-page).

**Anti-patterns (всередині §2.6):**

- ❌ Світлі картки в темному гриді (картка релізу `bg-white text-black` — ні).
- ❌ Світлий хедер чи футер.
- ❌ Світлі кнопки-CTA на dark-фоні (BtnPrimary лишається translucent-white).
- ❌ Toggle dark↔light на рівні сторінки.
- ❌ Mix: dark-нав поверх світлої секції без `border-t border-white/30` як шва.

---

## 3. Components

### 3.1 Header (`app/components/Header.vue`)
- Sticky, top-0, висота 75px, `bg-white/5 backdrop-blur-sm border-b border-white/30`.
- Лого ліворуч (іконка SVG 40×40 + назва + дескриптор Psychedelic Music Label).
- Центр: горизонтальна нав від `sm`. Mobile — використовується `OpenSidebar`.
- Соцмережі від `md`, з кастомним tooltip-микро-аніматом (letter-spacing animation).
- Профіль/login справа (`heroicons:user-circle` / `heroicons:user`).
- Вказана висота тач-таргетів **56px** (≥ 44pt — ✓).

### 3.2 Hero (`app/components/Hero.vue`)
- Тільки на головній. `font-julius`, gradient `from-transparent to-black/50` для затемнення низу.
- Назва "Sentimony" + розкладене "RECORDS" (по літері в `<span>` для майбутніх анімацій).
- Дескриптор з широким трекінгом.

### 3.3 Item card (`app/components/Item.vue`)
- Універсальна картка для releases / artists / videos / playlists / events.
- Квадрат із обкладинкою (`cover_th` / `photo_th` / `flyer_a_xl`), бейдж статусу (Coming Soon / Out Now), нижче — дворядковий тайтл (`line-clamp-2`).
- Активна (active route) стан — `bg-white/20`, hover — `bg-white/30`.

### 3.4 Swiper rows (`app/components/Swiper.vue`)
- Горизонтальна стрічка карток з заголовком категорії. На головній видно одночасно Releases і Artists. На сторінці деталей — лише відповідна стрічка з підсвіченим активним айтемом.

### 3.5 Footer (`app/components/Footer.vue`)
- `bg-black text-white/50`, `py-24`.
- Перелік усіх nav-айтемів (включно з прихованими в хедері) у вигляді rounded-bordered групи.
- Соцмережі з tooltip `bg-[#8a0202]`.
- Копірайт + лого + кредити (Web Design / Web Development).

### 3.6 BtnPrimary (`app/components/BtnPrimary.vue`)
- Висота `36px / 42px` (mobile / md+).
- `rounded-md border hover:bg-white/30 backdrop-blur-sm shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]`.
- Підтримує `iconify`, `img`, `svg`, `title`. Зовнішні URL автоматично відкриваються в новій вкладці з `rel="noopener"`.

### 3.7 Service-elements
- `<Fractal/>` — декоративний фон, не повинен перекривати інтеракцію.
- `<Testimonials/>` — секція над футером.
- `<Tabs/>` + `<Tab/>` — табовий перемикач (наприклад, на сторінках детального перегляду).

### 3.8 Modals & overlays

Будь-яка плаваюча поверхня поверх контенту (lightbox, drawer, майбутні діалоги) повинна реалізувати **єдиний контракт закриття** — інакше це A11y-баг.

**Чинні реалізації:**
- `<OpenImage/>` (`app/components/OpenImage.vue`) — lightbox для повнорозмірних зображень. Бекдроп `bg-black/30 backdrop-blur-sm`, контент центрований, кнопка закриття 56×56 у правому верхньому куті.
- `<OpenSidebar/>` (`app/components/OpenSidebar.vue`) — мобільний навігаційний drawer (256px справа). Бекдроп + панель з role="dialog".

**Обовʼязковий контракт (DoD для нової модалки):**
- [ ] Закриття на `Escape` через глобальний `keydown`-listener (зареєстрований у `onMounted`, знятий у `onBeforeUnmount`). Гард `if (!isOpen.value) return` обовʼязковий.
- [ ] Закриття на клік по бекдропу (`@click="close"` на overlay-елементі). Контент модалки — `@click.stop`, щоб клік усередині не проксився.
- [ ] Кнопка закриття з `aria-label="Close"`, тач-ціль ≥44×44pt (у проєкті 56×56).
- [ ] `role="dialog"` + `aria-modal="true"` + `aria-label` на контейнері панелі.
- [ ] `inert` на панелі коли закрита (виключає її з tab-порядку та screen reader).
- [ ] Тригер — `<button>` (не `<div>`) з `aria-expanded`, `aria-controls`, `aria-label`.
- [ ] Lock body-scroll: `document.body.style.overflow = 'hidden'` при відкритті, відновити при закритті та в `onBeforeUnmount`.
- [ ] Z-index: бекдроп `z-30`, панель `z-40`, кнопка закриття `z-50` (поверх tooltip `z-30`, нижче за гіпотетичний global overlay `z-[200]`).
- [ ] Анімація через `transform`/`opacity` (не `width/height`). Для `OpenImage` — `<Transition name="modal-fade">`, для drawer — `transition-transform duration-300 ease-in-out`.
- [ ] `prefers-reduced-motion`: тривалість анімації обнулити або скоротити (TODO якщо ще не додано).

**Не робити:**
- Не використовувати нативний `<dialog>` без полyfill — Safari < 15.4 не підтримує програмний `showModal()`.
- Не блокувати Esc через `e.stopPropagation()` всередині інпутів модалки — користувач має змогу скасувати дію.
- Не покладатися лише на клік по бекдропу — клавіатурні користувачі мусять мати Esc.

---

## 4. Іконки

- Джерело: **Iconify** через `@nuxt/icon` (`<Icon :name="heroicons:user" size="22" />`).
- Базовий пак: **Heroicons**. Додатково — кастомні SVG через URL у `app/constants/icons.ts`.
- Розмір за замовчуванням `size="22"` для хедера/футера/соц.
- ❌ **Заборонено** використовувати emoji як структурні іконки (нав, тулбар, статуси). Тільки SVG/Iconify.
- Для соц-мереж, які мають фірмові SVG (Bandcamp, Beatport тощо), — підтягувати з `content.sentimony.com/assets/img/svg-icons/...`.

---

## 5. Motion

- **Press feedback:** `v-wave` директива на всіх інтерактивних елементах. Не замінювати кастомним JS.
- **Hover/active surface:** `transition-[background-color] ease-in-out duration-300`.
- **Карткові hover:** `duration-200`.
- **Tooltip (хедер соц):** анімація `letter-spacing` + `opacity` + `translate-y` (унікальний бренд-микро-момент, зберігати).
- Поважати `prefers-reduced-motion`. Декоративний `<Fractal/>` має мати фолбек: при reduced motion — статичний кадр (TODO, якщо ще не реалізовано).
- Не анімувати `width/height/top/left` — лише `transform`, `opacity`, `background-color`.

---

## 6. Layout & Responsive

- **Mobile-first.** Базовий стан = mobile (`text-xs`, без сайд-навігації). Розгортаємо вгору через `sm: md: lg: xl:`.
- Брейкпоінти Tailwind за замовчуванням: `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`. Контейнер `max-w-7xl`.
- `min-w-[320px]` на body — нижчі ширини не підтримуємо.
- Sticky-хедер 75px — нові сторінки **не повинні** ховати критичний контент під ним (додати `pt-` коли треба).
- Уникати горизонтального скролу на mobile, окрім свайперів (`<Swiper>` свідомо горизонтальний).
- Зображення (covers, photos) обовʼязково з `width/height` або фіксованим `size-[Npx]`, щоб уникнути CLS.

---

## 7. Data, ISR & SEO (контекст для дизайну)

- Сторінки рендеряться через ISR (`maxAge: 86400` у `nuxt.config.ts`). Це означає: дизайн **не повинен** залежати від клієнтського часу/локалі без гідрації.
- API-ендпоінти кешуються 1 годину. Skeleton/loading стан потрібен лише для клієнт-only fetch (likes/auth).
- Кожна сторінка викликає `useSeoMeta()` з повними OG/Twitter тегами. Дефолтний OG — `app.config.ts`.
- Сайтмап вимкнено на staging (`stage--`).

---

## 8. Доступність — мінімальні правила

| Перевірка | Правило |
|-----------|---------|
| Touch target | ≥ 44×44pt. У проєкті — `h-[56px]` для хедера/нав, `40px` для соц у футері. Іконки 22px усередині 40–56px зони — OK. |
| Контраст | Білий поверх фото-бекграунда — ризик. Для read-heavy контенту використовувати плашку `.Content`. Для UI-чипів — додатковий `bg-white/5` або тінь. |
| Focus | Зберігати focus ring на клавіатурній навігації. Не прибирати `:focus-visible`. **Кожен `hover:` має парний `focus-visible:` з тим самим ефектом** (bg/opacity/text). Hover-only стани = баг. |
| Aria | Іконкові кнопки (профіль, соц) — додавати `aria-label` коли поряд немає текстового лейбла. У проєкті всі `<img>` мають `alt`, продовжувати. |
| Reduced motion | Поважати `prefers-reduced-motion: reduce` для `<Fractal/>` та будь-яких автоплей-аніматів. |
| Color-only | Бейджі Coming Soon / Out Now мають **і** колір, і текст — це правильно. Не вводити статуси лише кольором. |
| Keyboard | Tab-порядок = візуальний. Уникати `tabindex` крім випадків модалок (`-1` для неактивних табів у `role="tablist"` — OK). Інтерактивні елементи завжди `<button>` / `<a>` / `<NuxtLink>`, а не `<div>`/`<span>` з `@click`. |
| Tooltips | Будь-який тултіп, що зʼявляється на `hover`, мусить також зʼявлятись на `focus` тригера. Реалізація: `group` на контейнері + парні класи `group-hover:* group-focus-within:*`. Тултіп — `aria-hidden="true" pointer-events-none` (бо інформація вже в `aria-label` тригера). |
| Tabs | Патерн `role="tablist"` + `<button role="tab">` з `aria-selected`, керованим `tabindex` (`0` для активного, `-1` для решти) і навігацією стрілками (`ArrowLeft/Right`, `Home/End`). Реалізовано в `<Tabs/>`. |

---

## 9. Чек-ліст перед коммітом нового UI

**Візуал**
- [ ] Без emoji-іконок, тільки Heroicons / Iconify / SVG з `content.sentimony.com`.
- [ ] Поверхні через opacity-шкалу `white/5..30`, без нових HEX.
- [ ] Нові тіні відповідають `shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]`.
- [ ] Заголовки — `font-julius` лише для бренд-моментів; решта — `font-montserrat`.
- [ ] Для довгого тексту використано плашку `.Content`.

**Інтеракція**
- [ ] `v-wave` на всіх клікабельних елементах.
- [ ] Кожен `hover:` має парний `focus-visible:` (bg / opacity / text — той самий ефект).
- [ ] Тултіпи відкриваються і на `:hover`, і на `:focus-within` тригера.
- [ ] Клікабельні елементи — `<button>` / `<a>` / `<NuxtLink>`, не `<div>`/`<span>` з `@click`.
- [ ] Hover змінює `bg-white/{20|30}` через `transition-[background-color] duration-300`.
- [ ] Тач-цілі ≥44×44pt.
- [ ] Disabled-стан візуально й семантично відрізняється від активного.
- [ ] Зовнішні посилання — `target="_blank" rel="noopener"`.

**Перформанс**
- [ ] `<img>` з `width/height` та `loading="lazy"` для below-the-fold.
- [ ] Без layout shift (`aspect-ratio` або фіксовані розміри).
- [ ] Третьосторонні скрипти async/defer.
- [ ] Перевірено на 375 / 768 / 1024 / 1440.

**Доступність**
- [ ] Контраст ≥4.5:1 для основного тексту.
- [ ] `alt` у всіх змістовних `<img>`.
- [ ] `aria-label` у іконкових кнопках.
- [ ] `prefers-reduced-motion` поважається.
- [ ] Tab-порядок логічний; focus видно.

**SEO/Meta**
- [ ] `useSeoMeta()` з `title`, `description`, `ogImage`, `twitterCard`.
- [ ] Канонічний URL коректний для деталей-сторінки.

---

## 10. Anti-patterns (чого не робити)

- ❌ Глобальна світла тема: `prefers-color-scheme: light`, theme switcher, Tailwind `dark:` utilities, інверсія всіх поверхонь. Сайт dark-only за дизайном.
- ❌ Перетворення темної UI-поверхні (картка, кнопка, нав, плеєр, хедер, футер) на світлу без обґрунтування з §2.6. Світло — лише для контенту/форм, не для бренд-UI.
- ❌ Emoji як іконки.
- ❌ Нові кольорові токени без узгодження зі шкалою (`green-950`, `white/X`, `green-600`, `red-600`, `#8a0202`, `#b5ccb5`).
- ❌ Шрифти, відмінні від Montserrat / Julius Sans One.
- ❌ Радіус `rounded-full` для UI-блоків (псує бренд-естетику). Винятки — аватар у профілі.
- ❌ Анімація `width/height` (jank).
- ❌ Модалки/оверлеї без повного контракту закриття з §3.8 (Esc, бекдроп-клік, focus-кнопка, body scroll-lock, `aria-modal`).
- ❌ `position: fixed` поверх sticky-хедера без правильного z-index і safe-area.
- ❌ Hover-only інтеракції: кожен `hover:` мусить мати парний `focus-visible:` (див. §8). Тултіпи — `group-focus-within:` поряд з `group-hover:`. Інтерактивні `<div>`/`<span>` з `@click` без `role`/`tabindex`/keyboard-обробника — заборонені.
- ❌ Видалення focus ring без альтернативного візуального індикатора.

---

## 11. Маршрут розширення системи

Коли потрібен новий компонент/сторінка:

1. Спершу прочитати `DESIGN.md` (цей файл) і `CLAUDE.md`.
2. Перевірити, чи задачу вже вирішує `Item`, `BtnPrimary`, `Tabs`, `Swiper`. Якщо так — переюзати.
3. Дотримуватись opacity-шкали і radius `rounded-sm` за замовчуванням.
4. Після імплементації — пройтись чек-лістом §9.
5. Якщо вводимо нову патерн-категорію (модалка, форма, dashboard-картка) — оновити цей файл у відповідній секції.

---

_Cтан документа: основа задокументована з фактичних компонентів, патерн модалок/оверлеїв формалізовано в §3.8. Розширювати при додаванні форм, плеєра, dashboard-розділу._
