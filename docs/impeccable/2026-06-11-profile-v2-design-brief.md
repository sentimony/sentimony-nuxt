# Design Brief — Profile v2

> Артефакт `/impeccable shape`. План, не код. Передається в `/impeccable craft profile v2`.
> Звірено з `PRODUCT.md` (register: `brand`; profile — product-виняток, що лишається secondary).

## Підтверджені рішення

| Питання | Вибір |
|---|---|
| Обсяг | **Повний акаунт** (аватар + display name + редагування) |
| Організація 6 категорій | **Вкладки** з бейджами-лічильниками |
| Атмосфера | **Тихо й зручно** (у межах матеріалів сайту) |
| Аватар | **Набір пресетів** (без upload/Storage/модерації) |
| profiles / безпека | **Server-endpoints на admin** (як likes, без RLS/тригера) |

## 1. Feature Summary

Редизайн авторизованої сторінки `/profile`. Це product-поверхня всередині brand-світу: зручна як інструмент, але «вдягнена» в матеріали сайту (лісове полотно, контрольовані поверхні, Julius Sans One). Аудиторія — фани, що увійшли, аби повернутись до збереженої музики й керувати акаунтом. За `PRODUCT.md` акаунт лишається secondary і не конкурує з брендом/релізом/каталогом.

## 2. Primary User Action

Швидко повернутись до збереженого контенту за категоріями. Вторинне — впізнавана особиста ідентичність (аватар + ім'я) і керування акаунтом.

## 3. Design Direction

- **Color strategy**: Restrained product-поверхні поверх успадкованого drenched-полотна сайту (лісове фото + фрактал додає layout, не ця сторінка). У світлій темі фото немає — поверхні працюють через токени.
- **Scene sentence**: «Фан психоделік-трансу пізно вночі у темній кімнаті відкриває телефон, щоб повернутись до релізів і мікс, які зберіг у лейбла» → темна тема як база.
- **Anchor references**: Bandcamp collection (збережена музика як особиста, image-first стіна обкладинок) і власні detail-сторінки сайту (контрольовані поверхні + ліс + Julius — матеріал для успадкування). Вкладкова IA — узагальнений library-патерн (категорії + лічильники); від streaming-клону її утримує саме атмосфера/матеріал, не сам патерн. (Spotify/Beatport — anti-reference у `PRODUCT.md`, не орієнтир вигляду.)
- **Голос**: ritual, restrained, nocturnal. Мікрокопі стримане й «у світі», не бадьорий product-тон. Лейбли англійською (як на сайті).

## 4. Scope

Fidelity: production-ready. Breadth: уся поверхня `/profile` + новий backend для ідентичності. Interactivity: shipped-quality. Time intent: довести до релізу. Світла тема не полірується піксельно, але має бути коректною by construction (див. §6).

## 5. Layout Strategy

Контрольована колонка (`max-w-4xl`, `mx-auto`), **локально скасувати глобальний `text-center`** → ліве вирівнювання. Зверху вниз:

- **Зона ідентичності** — контрольована поверхня поверх фото: backdrop-blur + **достатньо темний scrim**, щоб стати надійним фоном. Слабкий `white/5` (`bg-card`) над фото контрасту НЕ гарантує. Увесь текст міряється проти scrim, не проти фото; scrim має бути такий, щоб body-текст брав AA (≥4.5:1), а вторинний/muted — свій поріг. Це purposeful legibility-scrim (дозволений виняток), не декоративне скло: не вкладати, не застосовувати декоративно. Контейнерить текст: жодного тексту прямо на фото; важливий текст не йде muted-токеном (`white/50`). Аватар (пресет або монограма-fallback) у колі з тонким ring, ім'я (Julius), email, «з нами з …». Дії: `Edit profile` (первинна) + `Sign out` (тиха, вторинна). Зона лишається стриманою — не hero.
- **Вкладки колекції** — по одній на категорію (Releases / Tracks / Artists / Playlists / Events / Videos); кожен триггер = іконка + назва + **бейдж-лічильник**. Показуємо лише категорії з ≥1 лайком; усі 0 → глобальний empty-стан замість вкладок.
- **Контент вкладки** — Tracks списком (рядки), решта — сітка `Item`-карток (artwork owns the color) + `Load more`.

Лічильники живуть **тільки як бейджі вкладок** — без окремої metric-hero/статистичної шапки (anti-ref: dashboard conventions).

## 6. Key States

- **Default**: ідентичність + вкладки з контентом.
- **Empty (новий користувач, 0 лайків)**: ідентичність + навчальний стан зі стриманим копі, що веде в каталог (CTA: `Explore releases`, `Browse artists`) — відповідає принципу «support exploration». Не порожнеча.
- **Loading**: skeleton-сітка/рядки у формі карток + skeleton-лічильники в триггерах. Без blank-then-pop.
- **Error**: `usePaginatedLikes` зараз ковтає помилки (повертає порожньо) — v2 показує inline-помилку з `Retry` у вкладці; мутації → `toast.error` (як у likes).
- **Edit profile**: viewing → editing (форма: ім'я, вибір пресет-аватара) → saving → success/error.
- Порожні вкладки сховані, тож окремий per-tab empty не потрібен.

## 7. Interaction Model

- **Вкладки**: reka-ui Tabs (`unmount-on-hide=false`), клавіатурно-керовані, видимий focus. **Lazy-load**: активна вкладка вантажиться на mount, решта — при першій активації (фікс 6 паралельних запитів і layout shift).
- **Лічильники**: один легкий запит totals (`/api/likes/counts`) для бейджів — не тягнути першу сторінку кожної категорії.
- **`Item`**: успадкований hover, тихіший; клік → detail.
- **`Load more`**: лишити, але переписати copy на `Load more` (+ чип кількості), замість «Show more 5 (N left)».
- **`Edit profile`**: панель (reka-ui) або inline; вибір аватара з пресетів; save оптимістично, `toast` на помилку.
- **Calm motion** (150–250ms): tab-switch crossfade, лагідний stagger при reveal карток; усе з `prefers-reduced-motion`-альтернативою (instant). Без glow, без gradient text, без purple-pink.
- Стан ніколи **лише кольором** (заповнена/порожня вкладка читається з тексту лічильника).

## 8. Content & Backend Requirements

**Контент / копі**
- Вкладки: Releases / Tracks / Artists / Playlists / Events / Videos + лічильники.
- Empty: стриманий заголовок + підказка + CTA в каталог.
- Форма: `Display name`, `Avatar` (вибір пресету).
- Кнопки (verb + object): `Edit profile`, `Save changes`, `Cancel`, `Sign out`, `Load more`.
- Аватар-fallback: ініціал з display name або email.
- Display name: вільний текст, без унікальності; fallback на локальну частину email.

**Backend (нова поверхня, server-endpoints на admin — як likes)**
- **`profiles`**: `id uuid PK → auth.users(id)`, `display_name text`, `avatar_url text` (зберігає ключ пресету, напр. `preset:mandala-03`), `updated_at timestamptz`. Без RLS-залежності й DB-тригера.
- **Endpoints** (`serverSupabaseUser` + admin-клієнт, snake→camel за `supabase.ts`): `GET /api/profile` (lazy-upsert рядка, якщо нема → `{ displayName, avatarUrl, email, createdAt }`); `PATCH /api/profile` (оновити `display_name`/`avatar_url` авторизованого).
- **Пресети аватарів**: фіксований набір у `app/constants/avatars.ts` (ключ → SVG/asset в органічній/сакрально-геометричній/нічній стилістиці — **не** неон-рейв, **не** purple-pink). Рендер резолвить ключ→asset; монограма-fallback коли `null`. Без Storage/upload/модерації.
- **Лічильники**: `GET /api/likes/counts` — 6 паралельних `count: 'exact', head: true` по `*_likes` для авторизованого → `{ releases, tracks, artists, playlists, events, videos }`. Живить бейджі, визначає видимі вкладки (≥1) і глобальний empty (усі 0).

## 9. Recommended References

`onboard.md` (навчальний empty-стан першого входу), `harden.md` (edit/error-стани + edge-cases нового backend), `layout.md` (контрольована колонка + ритм вкладок), `animate.md` (тиха tab/reveal-motion), `interaction-design.md` (форма редагування).

## 10. Звірка з PRODUCT.md (внесені уточнення)

1. **arbitrary glassmorphism** (anti-ref) → поверхні як контейнери для читабельності через токени, без вкладеного скла/важкого blur/надмірного заокруглення.
2. **AA-контраст в обох темах** → токени для світлої теми (суцільний фон, коректно by construction). У темній над фото слабкий `white/5` контрасту НЕ дає: текст-несучі поверхні потребують backdrop-blur + достатній scrim як надійний фон, а важливий текст над фото не йде muted-токеном. Поріг (AA над фото) — обовʼязок craft/audit.
3. **dashboard conventions / hero-metric** (anti-ref) → лічильники лише як бейджі вкладок.
4. **a11y (WCAG 2.2 AA)** → клавіатурні вкладки, видимий focus скрізь, стан не лише кольором.
5. **neon/cyber-rave, purple-pink, glow** (anti-ref) → пресети органічні/нічні; жодного світіння; узгоджено з «тихо й зручно».
6. **голос ritual/nocturnal** → стримане мікрокопі empty-стану, не product-тон.
7. **repeated eyebrow labels** (anti-ref) → v2 не повертає uppercase-tracked мітки (стару `Email`-мітку зокрема).

## Open Questions (дефолти зафіксовано)

- Lazy tab-load + `/api/likes/counts` — прийнято (фіксує layout shift і точність бейджів).
- Світла тема: коректна через токени, але не полірується піксельно в v2.
