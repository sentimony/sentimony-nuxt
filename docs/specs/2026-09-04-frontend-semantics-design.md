# Семантика каталогу: списки, імена, стани, токени, контраст

**Дата:** 2026-09-04
**Статус:** Design
**Скоуп:** сім детальних сторінок `app/pages/*/[id].vue`, `tracks.vue`, `releases/all.vue`, `artists/all.vue`, `news.vue`, `Item.vue`, `RelativeItem.vue`, `Header.vue`, `Footer.vue`, `Hero.vue`, `OpenImage.vue`, `AudioMixPlayer.vue`, `Testimonials.vue`, `SvgTriangle.vue`, `HomepageAtmosphere.vue`, `buttons/{PrimaryButton,DefaultButton,LikeButton}.vue`, `player/PagePlayer.vue`, `app/assets/css/tailwind.css`, `nuxt.config.ts` (meta), тести `accessibleNames`, `interactionStates`, `landmarks`
**Джерело:** [аудит frontend-crafting 2026-09-04](../audits/2026-09-04-frontend-crafting-audit.md) — T12–T22, V7–V9, V11
**Ініціатива:** [catalog-semantics](../initiatives/catalog-semantics.md)

## Проблема

Базовий рівень доступності (лендмарки, фокус, імена контролів, стани
списків) закрито 2026-09-01. Повторний аудит знаходить наступний шар — не
відсутні системи, а неправильні елементи й атрибути всередині наявних:
треклісти й списки зв'язків як `<p>` на всьому Read-шарі, alt-тексти, що
дублюють видимий текст посилання або дорівнюють URL файлу, iframe без назви,
`color-scheme` не оголошено, три списки без станів, повзунок міксу без імені,
контраст тексту, з'їдений накладеною прозорістю, і кольори поза токенами.
Спільна риса та сама, що й у попередній спеці: **жоден дефект не є
дизайнерським рішенням**; композиція не змінюється, а кожна правка
закріплюється юніт-тестом по джерелу.

## Скоуп

**Входить:** T12, T13, T14, T15, T16, T17, T18, T19, T20, T21, T22, V7, V8,
V9, V11.

**Не входить, із причинами:** V1 (CTA), V4 (другий рядок картки), V10
(сторінка друга), T23 (розмір розділювачів свайпера) — рішення власника про
композицію або дані; T24 (`ClientOnly` у `Tabs`) — потребує живого прогону
гідратації.

## Рішення, які треба ухвалити

### 1. Списки без зміни вертикального ритму (T12)

Глобальне `p { @apply mb-2 }` дає треклістам їхній ритм. `<ol>`/`<ul>` +
`<li>` цього маргіну не мають. **Рішення:** `<ol class="list-none">` /
`<ul class="list-none">` без відступу, а кожен `<li>` отримує `mb-2` явно
(там, де `<p>` мав додаткові класи — вони переходять на `<li>`). Preflight
Tailwind v4 скидає `padding-inline-start` у списків, тож візуально нічого не
зсувається. Нумерація лишається в `<small class="font-mono">` як зараз —
`list-decimal` дав би другий номер.

Локації: `release/[id].vue` (два варіанти треклісту, два списки зв'язків),
`track/[id].vue` (артисти), `artist/[id].vue` (релізи, події),
`event/[id].vue` (лайнап, організатори, артисти), `tracks.vue` (треклісти
під релізами), `playlist/[id].vue` (переписати `<ol>` так, щоб реліз був
`<li>` з вкладеним `<ol>` треків — зараз `<li>` лежить у `<div>`),
`PagePlayer.vue` (рядки → `<ol>` + `<li>`; класи рядка переходять на `<li>`).

### 2. alt у посиланні з текстом = `""` (T13)

Правило одне: зображення всередині `<a>`/`<button>`, у якого вже є видимий
текст або `aria-label`, — декоративне. `Item.vue` (три `<img>`),
`RelativeItem.vue` (два), `news.vue`, логотип у `Header.vue` (текст
«Sentimony Records» поруч), `PrimaryButton.vue` і `DefaultButton.vue`
(`:alt="img + ' icon'"` → `alt=""`; текст кнопки в `title`). Соцпосилання в
`Header`/`Footer`/`OpenSidebar` не чіпаються: там `aria-label` або текст уже
є, а `<img alt="X Icon">` стоїть у `v-else`-гілці для кастомних SVG — його
теж переводимо на `alt=""`, бо назва вже в `aria-label`.

Тест в `accessibleNames.test.ts`: у `Item.vue`, `RelativeItem.vue`,
`PrimaryButton.vue`, `DefaultButton.vue` немає `:alt="` з конкатенацією
`' Thumbnail'`/`' icon'`.

### 3. Одна карта висот iframe-ів (T22)

Обидві карти (`release` має `tracks-22/25/27`, `track` — ні) зливаються в
одну в `tailwind.css` під `.BandcampIframe` / `.SoundcloudIframe`; обидві
сторінки втрачають `<style>`. Об'єднання — надмножина, тож жоден реліз не
втрачає свою висоту.

### 4. Токени «мох» і спільні градієнти (T18)

`@theme { --color-moss: #b5ccb5; --color-moss-dark: #2a4030; }` — тоді
`bg-moss`, `fill-moss`, `dark:bg-moss-dark` у `Testimonials`, `SvgTriangle`,
`.Content .ContentBg`, `.Content svg path`. Значення ті самі — пікселі не
рухаються. Градієнти головної: `--forest-tint-light` / `--forest-tint-dark` у
`:root`; `html::after` і `.homepage-atmosphere::after` посилаються на них.
`AudioMixPlayer` переходить на `.player-range` (T19) — його `accent-[#…]`
зникає разом із дрейфом.

### 5. Контраст без третього тиру (V7, T20, T21)

- `LikeButton.vue:26` — `opacity-50` на лічильнику → `text-muted-foreground`
  (для `glass`-варіанта) або без модифікатора всередині `soft` (батько вже
  muted).
- `PagePlayer.vue:213,228` — прибрати `opacity-60`, лишити колір батька.
- `Header.vue:53` — `opacity-[0.4]` → `text-muted-foreground`; `:124` —
  `opacity-50` → `text-muted-foreground`.
- `Footer.vue:13` — `text-white/50` → `text-white/70`.
- `artists/all.vue:71` — `hover:text-white/80` → `hover:text-foreground/80`.

Тест в `interactionStates.test.ts`: у `LikeButton`, `PagePlayer`, `Header`
немає `opacity-{40,50,60}` і `opacity-[0.4]` на елементах із текстом (перевірка
— по рядках із `{{`); `Footer` не містить `text-white/50`.

**Снапшоти:** зміни в `Header` і `Footer` потрапляють у незамасковану зону
`homepage-theme.spec.ts`. Порядок: усі задачі → один прогін `test:e2e` →
якщо падає, відкрити diff-зображення і підтвердити, що змінені області —
саме підпис хедера й текст футера → тільки тоді `test:e2e:update` з
причиною в коміті. Diff деінде — ознака, що інша задача зрушила пікселі.

### 6. `<h1>` головної (V9)

`<h1>` стає обгорткою обох рядків: зовнішній `div` з класами розміру →
`h1`, внутрішні `h1`/`div` → `span class="block"`. Preflight скидає розмір,
вагу й маргіни заголовків, тож пікселі ті самі; e2e підтверджує.

## Решта пунктів

| Пункт | Зміна |
|---|---|
| T14 | пробіл у шести `:title="item.title + 'YouTube video player'"`; `title="SoundCloud player"` на iframe артиста; «Iframe» у назвах → «player» |
| T15 | `{ name: 'color-scheme', content: 'dark light' }` у `app.head.meta`; `color-scheme: light` у `:root`, `color-scheme: dark` у `.dark` |
| T16 | `CollectionStatus` у `tracks.vue` (статус із `useFetch('/api/tracks')`), `releases/all.vue`, `artists/all.vue` (деструктуризація `status`, `error`, `refresh` з `useAsyncData`) |
| T17 | `OpenImage` — `:height` (190 / 158); `RelativeItem` — `height="24"`; портфоліо артиста — `width="120" height="120"`; друг — `width="120" height="120"` |
| T19 | `aria-label="Seek"` + `class="player-range"` + `:style="{ '--progress': … }"` у `AudioMixPlayer` |
| V8 | «Related Releases» / «Related Artists» (3), латинська «Credits», один рядок `Coming soon` у трьох заглушках |
| V11 | `artistReleases = computed(() => releasesSortedByDate.filter(r => r.artists?.includes(slug)))`, секція під `v-if="artistReleases.length"` |

## Перевірка

`npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check`
після кожної задачі. Нові юніт-перевірки: треклісти на `<ol>`, `alt=""` у
картках і кнопках, `title` на кожному `<iframe>` у `app/pages`, `color-scheme`
у `nuxt.config.ts` і `tailwind.css`, `CollectionStatus` на 13 списках,
відсутність `opacity-*` на тексті в трьох файлах, `--color-moss` у `@theme`.
`npm run test:e2e` — один раз наприкінці за протоколом п. 5.

## Наступний крок

План: [`docs/plans/2026-09-04-frontend-semantics.md`](../plans/2026-09-04-frontend-semantics.md).
