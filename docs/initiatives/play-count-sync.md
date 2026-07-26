# Optimistic play-count synchronization

- Status: Descoped
- Priority: —
- Ініційовано: 2026-07-21
- Last reviewed: 2026-07-25
- Related: [release performance spec](../superpowers/specs/2026-07-21-release-tracklist-perf-design.md), [status audit](../audits/2026-07-25-implementation-status-audit.md)

## Чому знято з обсягу

Причиною ініціативи були два джерела правди між release page і
`AudioTrackPlaylist`. Компонент видалено, а on-page плеєр і tracklist злиті в
`app/components/player/PagePlayer.vue`, тому розділеного state більше немає.

## Поточна поведінка

- `PagePlayer` тримає один `playCounts` ref, з якого рендеряться і контроли, і
  рядки tracklist, тож оптимістичний `+1` у `registerPlay()` одразу видно в рядку.
- `mergePlayCounts` (`app/utils/playCounts.ts`) зберігає `Math.max` семантику,
  тому короткокешована server-відповідь не занижує значення.
- Watch на `playToken` реєструє play і для переходів у черзі з `GlobalPlayer`,
  тому рядок лишається синхронним при керуванні з нижньої панелі.

## Якщо симптом повернеться

Перевіряти саме ownership `playCounts` у `PagePlayer` і merge-порядок у
`mergePlayCounts`, а не відновлювати page-level state.
