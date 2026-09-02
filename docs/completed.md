# Завершені ініціативи

- Status: Implemented
- Last reviewed: 2026-07-25

Це стислий історичний індекс. Детальні рішення та кроки залишаються у
відповідних спеках і планах.

## Документовані реалізації

- [Theme toggle](superpowers/specs/2026-06-01-theme-toggle-design.md) і
  [homepage light theme](superpowers/specs/2026-06-06-homepage-light-theme-design.md).
- [Sitemap та indexing policy](superpowers/specs/2026-07-01-sitemap-indexing-design.md).
- [Catalog features](superpowers/specs/2026-07-02-catalog-features-design.md):
  portfolio, organized events, `/artists/all`, category dividers і genre pages.
- [Review fixes від 2026-07-02](superpowers/plans/2026-07-02-review-fixes.md).
- [First-class tracks migration](superpowers/plans/2026-07-06-tracks-first-class-migration.md).
- [Global audio player](superpowers/specs/2026-07-07-global-audio-player-design.md);
  persistent UI згодом еволюціонував у bottom player.
- [Lighthouse LCP optimization](superpowers/specs/2026-07-13-lighthouse-lcp-design.md).
- [Lazy media tabs та спрощені inline players](superpowers/specs/2026-07-16-lazy-media-tabs-design.md).
- [Array export sync, `track_artists` і `like_counters`](superpowers/specs/2026-07-18-export-sync-roadmap-2-4-7-design.md).
- [Release tracklist performance optimization](superpowers/specs/2026-07-21-release-tracklist-perf-design.md).

- [Accessibility baseline](specs/2026-09-01-accessibility-baseline-design.md) за
  [аудитом 2026-09-01](audits/2026-09-01-frontend-crafting-audit.md): лендмарки й
  скіп-лінка, видимий фокус на кнопках і повзунках, доступні імена для
  іконкових табів і стрілок свайпера, два текстові рівні в каталозі та
  спроєктовані порожній і помилковий стани списків.

## Закрито з попередніх аудитів

- DB export прибрано з public path.
- Public/private API cache rules розділено.
- `v-html` проходить через локальний sanitizer; `isomorphic-dompurify/jsdom` не використовується.
- Firebase/Supabase list endpoints уніфіковано через компактні DTO.
- `/api/tracks/[release_slug]` кешується і не читає весь Firebase tracks collection напряму.
- Release related дані винесено в `/api/release/[id]/related`.
- Sitemap/indexing закрито: dynamic URLs генеруються з
  `server/data/sentimony-db-export.json` через `/api/__sitemap__/urls`, auth/profile
  routes мають noindex route rules, public pages — canonical.
- Like composables/API узагальнено через `createLikes` і `server/utils/likes.ts`.
- Profile summary endpoint додано.
- `/tracks` споживає first-class `/api/tracks` contract із
  `track_number`/`bpm`/`audio_url`, а не `tracklistCompact` з `useReleases()`.
- Like counters відокремлено від content DTO через `like_counters`, atomic RPC і
  public batch count endpoints.
- Track-artist модель нормалізовано через `track_artists`; Supabase paths читають
  індекс, Firebase має CSV fallback.
- Artist sorting винесено в `app/utils/artists.ts` і покрито тестами.
- Відомі TS-помилки track/likes mapping закрито typed `mapReleaseFromSupabase`.
- A11y `link-name` виправлено для social і signin links; зафіксований Accessibility score — 100.
- Catalog source production і stage переведено на Supabase, що відновило актуальне аудіо.

## Закрито у 2026-07 після аудиту документації

- Кнопки уніфіковано: `ui/button` `buttonVariants` — єдине джерело стилів, а
  `PrimaryButton`/`DefaultButton`/`LikeButton` лише його обгортають.
- `@nuxt/image` прибрано; рендер медіа використовує статичні `_th` варіанти через
  auto-imported `thumb()`, повний `_xl` відкриває лише `OpenImage`.
- `npm run typecheck` і `npm run typecheck:ts7` додані й виконуються в CI
  (`.github/workflows/ci.yml`) разом з unit tests, `node-server` build і HTTP smoke.
- On-page плеєр і tracklist злиті в `PagePlayer`, що прибрало розділений
  play-count state (див. [play-count synchronization](initiatives/play-count-sync.md)).
- `/event/[id]` переверстано за макетом release detail: двоколонковий hero,
  Tabs з lineup, `ItemContent` з Organizers і Relative Artists.

## Уточнення

- Visible filtering працює для list endpoints і sitemap. Detail endpoints
  артиста й релізу навмисно віддають hidden записи за прямим URL — див.
  [catalog visibility security](initiatives/catalog-visibility-security.md), знято з обсягу.
- Footer SVG із WEB-2 виправлений у поточному коді без окремої implementation spec.
- Custom audio player foundation існує, але Hagen mix activation не завершена:
  у canonical export немає mix fields. Ця фіча не рахується завершеною.
