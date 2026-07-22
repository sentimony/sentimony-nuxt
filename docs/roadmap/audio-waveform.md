# Audio waveform visualization

- Status: Idea
- Priority: Future
- Last reviewed: 2026-07-22
- Related: [global player spec](../superpowers/specs/2026-07-07-global-audio-player-design.md), [play-count synchronization](play-count-sync.md)

## Навіщо

Waveform може дати плеєру виразнішу label identity, швидке візуальне читання
структури треку та точніший seek interaction. Runtime analysis великого audio
catalog може водночас погіршити mobile performance.

## Очікуваний результат

Обраний підхід показує responsive waveform і доступний seek control без важкого
runtime decoding, SSR issues або CORS/R2 regressions.

## Обсяг

- Порівняти precomputed peak data з runtime Web Audio analysis.
- Перевірити generation/storage format, R2 CORS/range behavior і cache policy.
- Спроєктувати canvas/SVG rendering, responsive density і theme states.
- Зберегти keyboard та screen-reader accessible seek semantics.

## Залежності

- Стабільний global player state та seek contract.
- [Mobile performance](mobile-performance.md) budgets.
- Можливість генерувати peak data під час catalog/audio sync.

## Критерії завершення

- Один підхід проходить performance/accessibility budgets на track і release pages.
- Waveform не декодує повний audio asset на main thread під час першого render.
- Mouse, touch, keyboard і assistive seek behavior узгоджені.

## Наступний крок

Перевірити CORS/range behavior audio assets і можливість генерації peaks під час sync.
