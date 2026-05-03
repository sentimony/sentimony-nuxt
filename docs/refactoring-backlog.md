# Refactoring backlog

Список ідей після аудиту `pages/index.vue`, `pages/releases.vue`, `pages/release/[id].vue` (зокрема те, що дублюється в інших list/detail-сторінках). Не виконувати «оптом» — перед кожним пунктом узгодити з власником, бо частина впливає на API/дані.

## High impact — code duplication

1. **Уніфікувати likes-композаблі.** `useLikes`, `useArtistLikes`, `useTrackLikes`, `useEventLikes`, `usePlaylistLikes`, `useVideoLikes` — це шість майже ідентичних 57-рядкових файлів. Замінити фабрикою:
   ```ts
   // app/composables/createLikes.ts
   export function createLikes(entity: 'release'|'artist'|'track'|'event'|'playlist'|'video') {
     // керуємо ключем useState, базовим API-шляхом і повертаємо однаковий контракт
   }
   export const useLikes = createLikes('release')
   export const useArtistLikes = createLikes('artist')
   // ...
   ```
   Скорочення з ~340 до ~60 рядків. Дзеркальна правка на сервері: фабрика для `*-likes.{get,post}.ts` через `defineLikesHandler({ table })`.

2. **Уніфікувати list-сторінки.** `releases.vue`, `artists.vue`, `events.vue`, `videos.vue`, `playlists.vue`, `tracks.vue` повторюють: `useXxx()` → `toArray<T>()` → `filter(visible) → sort(date desc)` → `useSeoMeta(...)` → шапка → `<Item v-for>`. Витягнути:
   - `useSortedByDate(items, { filterVisible })` — компонована шкала в `app/composables/`.
   - `useDefaultSeo({ title, description, ogImage? })` — обгортка над `useSeoMeta`, що сама підтягує `appConfig.brand.defaultOgImage` і `absoluteUrl`. Зараз 12-рядковий блок копіюється у ВСІ сторінки (~120 рядків бойлерплейту).
   - `<EntityList :items :category :title>` — компонент-обгортка з `<h1>` і flex-сіткою.

3. **Прибрати дублювання у detail-сторінках.** `release/[id].vue` тягне `useReleases()` і `useArtists()` лише щоб відрендерити «Relative Releases / Artists». Це фетч усього каталогу на кожен detail. Перенести логіку на сервер: `/api/release/[id]` має повертати вже резолвлені `relative_releases_full` + `relative_artists_full` (відсортовані, з мінімальним набором полів — slug/title/cover_th/photo_th/date). Економія: −2 fetch на detail, −клієнтська computed-сортування.

## High impact — `release/[id].vue` (446 рядків)

4. **`<MediaPlayers>` компонент.** Блок `<Tabs>` із чотирма iframe-плеєрами (Bandcamp / YouTube / SoundCloud / YT Music) — це однаковий патерн для release/track/playlist (а далі може й для video). Витягнути в `app/components/MediaPlayers.vue` з пропом `:links` і `:tracks-number`. Lazy-mount iframe лише активної вкладки (`<Tab v-slot="{ selected }">`) — зараз усі 4 iframe вантажаться одразу.

5. **`<EntityLinks>` компонент для зовнішніх платформ.** Зараз в release/[id].vue ~14 хардкоднутих `<BtnPrimary v-if=...>`. Замінити декларативним списком:
   ```ts
   // app/constants/platforms.ts
   export const PLATFORMS = [
     { id: 'bandcamp_url', group: 'download', title: 'Bandcamp', iconify: 'cib:bandcamp' },
     { id: 'spotify',      group: 'stream',   title: 'Spotify',  iconify: 'fa-brands:spotify' },
     // ...
   ] as const
   ```
   Темплейт: `<EntityLinks :links="item.links" group="stream" />`. Один компонент → release/track/artist детально однаково.

6. **Видалити фрагільний CSS `tracks-N`.** Глобальний `<style>` з `.BandcampIframe.tracks-1..27` і `.SoundcloudIframe.tracks-1..27` ламається при будь-якому tracks-number поза переліком (14–21, 23–24, 26, 28+). Замінити обчисленим `:style="{ height: bandcampHeight(tracks_number) + 'px' }"` за формулою `BASE + PER_TRACK * n`.

7. **`useFetch('/api/tracks/...')` → `useAsyncData`.** Зараз `useFetch` без явного ключа: SSR-кеш не консистентний з рештою (всі інші використовують `useAsyncData('release:'+id)`). Перевести на `useAsyncData(`release-tracks:${id}`, () => $fetch(...))`. Тип `Track` локально перевизначається — використати спільний з `app/types/index.ts` (або імпортувати з server response типу).

8. **Виправити невалідну розмітку tracklist.** `<p v-for><NuxtLink>...<button>...</button></NuxtLink></p>` — `<p>` не може містити інтерактивні блокові елементи; крім того `<button>` всередині `<a>`/`<NuxtLink>` — невалідно і ламає screen-reader-и. Замінити на `<ol>` + `<li class="flex">` з окремими `<NuxtLink>` (для назви) і `<button>` (для лайку) поряд, не вкладеними.

9. **404-кидок підняти над `onMounted`.** Зараз `onMounted` (рядки 12–15) реєструється до `await useRelease()` і використовує `item.value!`. Працює завдяки TDZ + closure, але читається як баг. Порядок: `await useRelease(...)` → 404-throw → `onMounted(...)`.

10. **Хардкод-плейсхолдер `comingMusic`.** Дубль патерну `comingImage` з `OpenImage.vue`. Витягнути `<MediaComingSoon />` компонент (один рядок, але змістовно повторюється).

## Medium impact — home та list

11. **`pages/index.vue`: винести about-копію.** ~8KB HTML-літерал у `<script setup>` (`aboutDescription`). Перенести в `app/constants/about.ts` (або `content/` якщо буде Nuxt Content) — це контент, не код. Видалити мертві `logoNew{v2,v3}` (не використовуються), залишити тільки активний логотип. Лінки в about'ах використовують `text-green-500 hover:text-green-300` — конфлікт з DESIGN.md §2.1 (для `.Content` — `text-blue-700`); або переїхати на плашку `.Content`, або задокументувати green-варіант для dark-плашки в DESIGN.md.

12. **Контейнер: одна шкала.** `releases.vue` і `artists.vue` використовують `container max-w-[112rem]`, тоді як DESIGN.md §2.3 каже `max-w-7xl` (1280px). Або привести list-сторінки до `max-w-7xl`, або додати в DESIGN.md токен `max-w-[112rem]` як «wide grid» з обґрунтуванням.

13. **`<PageTitle>` компонент.** `<h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ ... }}</h1>` повторюється на кожній list-сторінці і в release/[id]. Замінити на `<PageTitle>{{ title }}</PageTitle>` — заголовок шкалює один раз.

## Medium impact — UX/A11y

14. **Like-button на release detail.** Усі стани hover-only: `hover:bg-white/10`, `hover:text-white/70`. Додати `focus-visible:` парність (правило з DESIGN.md §8). Те саме для track-like-кнопок у tracklist.

15. **`hover:underline` на tracklist-лінку** — без focus-visible. Додати `focus-visible:underline`.

16. **Breadcrumb / "back to releases".** Detail-сторінка не має навігаційного контексту; користувач після прямого приземлення з пошуку губиться. Додати breadcrumbs або хоча б `<NuxtLink to="/releases">← Releases</NuxtLink>` зверху.

17. **Семантика «section labels».** `<small><b>Tracklist:</b></small>`, `Credits:`, `Relative Releases:` — це секційні заголовки, але в розмітці — інлайнові. Замінити на `<h2 class="text-sm font-bold">` (візуал той самий, семантика правильна → краща навігація для screen-reader-ів і outline).

## Low impact — polish

18. **Fractal та iframe — eager-load.** На detail-сторінці одночасно: `<Fractal>` (canvas/animation), 4 iframe-плеєри. Лімітувати: iframe рендерити тільки для активного `<Tab>`; `<Fractal>` поважати `prefers-reduced-motion` (з DESIGN.md §5 — позначено як TODO).

19. **`comingImage` snowman.** В `OpenImage.vue` декоративний `⛄` лишився попри DESIGN.md §10 заборону emoji-як-структурних-іконок. Якщо це декоративний placeholder — обернути в `<span aria-hidden="true">` (зараз він не aria-hidden).

20. **API tracks ендпоінт.** Шлях `/api/tracks/[release_slug]` концептуально належить до релізу — переіменувати в `/api/release/[slug]/tracks` або вкласти tracks безпосередньо в `/api/release/[slug]` payload (один round-trip замість двох на detail-сторінці).

## Sequencing

Рекомендований порядок: **1 → 7 → 4 → 5 → 2 → 3 → 6 → решта**. Пункт 1 (likes-фабрика) автономний і дає найбільший виграш у LOC; 7 — мінімальна фіксація бага; 4–5 розвантажують найбільший файл; 2–3 — після того як detail-сторінки спростяться, легше уніфікувати list. CSS-фікс 6 робити одночасно з 4, бо там же.

## Profile page (`pages/profile.vue` + `composables/usePaginatedLikes.ts`)

Аудит виявив окремий шар дублікації, що частково перетинається з пунктами 1 і 2 вище — виносимо в підсекцію, бо точка входу інша (приватна сторінка з 6 пагінованими секціями).

21. **`<LikedSection>` компонент.** На сторінці 6 однакових блоків з відмінністю лише в title/category/limit. Зараз 80+ рядків template-дублювання. Витягнути:
    ```vue
    <LikedSection title="Liked Releases" category="release" :collection="releases" :step="5" />
    ```
    де `collection` — об'єкт з `usePaginatedLikes` (`items`, `total`, `loading`, `hasMore`, `loadMore`). Для tracks-секції — окрема `<LikedTracksSection>` (інша розмітка), або prop `variant="row"`.

22. **Серверна `defineLikedEntitiesHandler({ likesTable, slugColumn, entityTable, columns, order })`.** 6 хендлерів (`likes/releases.get.ts`, `artist-likes/artists.get.ts`, `track-likes/tracks.get.ts`, `video-likes/videos.get.ts`, `playlist-likes/playlists.get.ts`, `event-likes/events.get.ts`) — копія-в-копію з різницею в назвах таблиць/колонок. Один helper → −150 рядків серверного коду. Дзеркалить пункт 1 на сервері.

23. **One-shot dashboard endpoint.** Поточний профіль на mount шле 6 паралельних запитів (`onMounted(load)` × 6 інстансів `usePaginatedLikes`). Якщо у користувача немає лайків у 4 з 6 категорій — це 4 марних round-trip-и. Додати `/api/me/dashboard?limit=5` що повертає `{ releases, tracks, artists, ... }` з первинною сторінкою + total для кожної. `usePaginatedLikes` стартує з seed-даних, мережі стукає тільки на `loadMore()`.

24. **Magic-numbers `5` / `20` дублюються в темплейті.** `Show more 5 (...)`, `Show more 20 (...)` — рядкові літерали з тим самим числом, що і limit. Витягнути:
    ```ts
    const STEP = { releases: 5, tracks: 20, artists: 5, ... } as const
    ```
    Текст кнопки → `Show more ${STEP[entity]} (${left} left)`. При зміні `STEP` нічого не «розсинхрониться».

25. **`font-['Julius_Sans_One']` → `font-julius`.** Inline-arbitrary value обходить токен з DESIGN.md §2.2. На сторінці зустрічається 7×. Заодно перевірити, чи це не вилазить деінде в коді — той самий arbitrary-літерал є і в `login.vue` (рядок 39).

26. **`noindex` для приватних сторінок.** `/profile`, `/login`, `/confirm` — auth-only або транзитні, але індексуються. Додати `useSeoMeta({ robots: 'noindex,nofollow' })` (або `routeRules` в `nuxt.config.ts` через `@nuxtjs/robots`). Те саме для login — щоб уникнути потрапляння в SERP.

27. **Track-лінк веде на release, не на track.** `/release/${t.release_slug}` ігнорує існуючу сторінку `pages/track/[id].vue`. Має бути `/track/${t.slug}`. Це функціональний баг, не рефакторинг.

28. **Empty state.** Якщо користувач не лайкнув нічого, профіль = email + Sign Out. Додати friendly fallback з CTA на `/releases` (умова: усі 6 `total === 0` після завантаження).

29. **Track-list розмітка непослідовна.** 5 секцій рендерять `<Item>` (картка), tracks-секція — кастомний `<NuxtLink class="flex">` без `v-wave`, без focus-visible (порушує DESIGN.md §2.4 і §8). Або витягнути `<TrackItem>` (компанйон до `<Item>` для рядкового вигляду), або привести стиль до tracklist-а з `release/[id].vue` (після пункту 8 — вже з валідним HTML).

30. **Sign Out — `await navigateTo` + `replace: true`.** Зараз `navigateTo('/login')` без `await` і без replace, тому back-кнопка повертає на свіжо-розлогінений профіль (мідлвейр перенаправить, але це зайвий рендер). Краще: `await navigateTo('/login', { replace: true })`.

31. **`Liked*` локальні типи.** 6 типів в `<script setup>` (`LikedRelease`, `LikedArtist`, ...) — частковий `Pick<>` спільних типів з `app/types/index.ts`. Перевизначення створює дрейф (наприклад `LikedTrack` має `bpm: number | null`, але глобальний `Track` може еволюціонувати інакше). Замінити на `type LikedRelease = Pick<Release, 'slug'|'title'|'cover_th'|'date'>` — і експортувати в `types/index.ts` для шерингу з серверним handler-ом.

32. **A11y: «Show more» без `aria-controls` і `aria-live`.** Кнопка додає елементів у список вище — screen-reader не знає про оновлення. Додати `aria-controls="liked-releases-list"` на кнопку, `id` на список і опційно `aria-live="polite"` на контейнер списку (або фокус на перший новододаний елемент після `loadMore`).

33. **Visible-фільтр непослідовний.** `likes/releases.get.ts` фільтрує `eq('visible', true)`, а `track-likes/tracks.get.ts` — ні. Якщо реліз сховали (`visible=false`), у профілі він зникне з Releases-секції, але треки з нього залишаться видимими в Tracks-секції — і ведуть на 404 (бо release-deтейлка кидає `createError 404`). Винести правило в helper з пункту 22: завжди джойнити `entity.visible = true` якщо колонка існує.
