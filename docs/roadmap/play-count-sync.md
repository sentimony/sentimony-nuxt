# Optimistic play-count synchronization

- Status: Planned
- Priority: P3
- Last reviewed: 2026-07-22
- Related: [release performance spec](../superpowers/specs/2026-07-21-release-tracklist-perf-design.md)

## Навіщо

Release page і `AudioTrackPlaylist` тримають окремі копії play counts. Після
натискання play дочірній player оптимістично додає `+1`, але tracklist row не
оновлюється до reload.

## Очікуваний результат

Player і tracklist читають одне узгоджене optimistic state, яке не занижується
після короткокешованого server response.

## Обсяг

- Підняти play-count state на page level або додати typed emit/v-model contract.
- Зберегти `Math.max` merge semantics.
- Синхронізувати global/inline player events із рядком tracklist.

## Залежності

- Поточний global audio player і `/api/track-plays` contract.

## Критерії завершення

- Row count змінюється одразу після успішного play registration.
- Cached server response не зменшує optimistic value.
- Немає duplicate play registration або duplicate fetch.

## Наступний крок

Написати окрему коротку spec для ownership state та event contract.
