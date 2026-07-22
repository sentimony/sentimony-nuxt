# Завершені ініціативи

- Status: Implemented
- Last reviewed: 2026-07-22

Це стислий історичний індекс. Детальні рішення та кроки залишаються у
відповідних спеках і планах.

## Документовані реалізації

- [Theme toggle](../superpowers/specs/2026-06-01-theme-toggle-design.md) і
  [homepage light theme](../superpowers/specs/2026-06-06-homepage-light-theme-design.md).
- [Sitemap та indexing policy](../superpowers/specs/2026-07-01-sitemap-indexing-design.md).
- [Catalog features](../superpowers/specs/2026-07-02-catalog-features-design.md):
  portfolio, organized events, `/artists/all`, category dividers і genre pages.
- [Review fixes від 2026-07-02](../superpowers/plans/2026-07-02-review-fixes.md).
- [First-class tracks migration](../superpowers/plans/2026-07-06-tracks-first-class-migration.md).
- [Global audio player](../superpowers/specs/2026-07-07-global-audio-player-design.md);
  persistent UI згодом еволюціонував у bottom player.
- [Lighthouse LCP optimization](../superpowers/specs/2026-07-13-lighthouse-lcp-design.md).
- [Lazy media tabs та спрощені inline players](../superpowers/specs/2026-07-16-lazy-media-tabs-design.md).
- [Array export sync, `track_artists` і `like_counters`](../superpowers/specs/2026-07-18-export-sync-roadmap-2-4-7-design.md).
- [Release tracklist performance optimization](../superpowers/specs/2026-07-21-release-tracklist-perf-design.md).

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

## Уточнення

- Visible filtering працює для list/sitemap і більшості detail API, але artist
  detail exception лишається активним P0 у
  [catalog visibility security](catalog-visibility-security.md).
- Footer SVG із WEB-2 виправлений у поточному коді без окремої implementation spec.
- Custom audio player foundation існує, але Hagen mix activation не завершена:
  у canonical export немає mix fields. Ця фіча не рахується завершеною.
