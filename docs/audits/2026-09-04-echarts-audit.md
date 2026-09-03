# Аудит ECharts за скілом echarts: перевірка застосовності

- Дата: 2026-09-04
- Гілка: `quality-audits-2026-09` від `accessibility-baseline` (`1667326`)
- Скіл: `.claude/skills/echarts` v1.1.3, `references/audit.md`
- Формат: read-only; код не змінено, залежностей не додано.

## Висновок

У проєкті **немає Apache ECharts і немає жодної діаграми**. Повний чекліст
`references/audit.md` (§1–§8: state inventory, registration matrix, lifecycle,
interactive-state ownership, HTML tooltip trust, cardinality, zero-size gate,
browser evidence) не має об'єкта застосування, і жоден із його пунктів не
виконувався. Це не «аудит із нульовими знахідками», а перевірка, що аудит
не потрібен; ремедіацій немає.

## Інвентар

| Перевірка | Результат |
|---|---|
| `echarts` / `vue-echarts` / `echarts-for-react` у `package.json` (committed і working copy) | 0 |
| `echarts` у `package-lock.json` | 0 входжень |
| `import … from 'echarts'` / `echarts/core` у `app/`, `server/`, `scripts/`, `netlify/`, `tests/` | 0 |
| `<VChart>` / `echarts.init` / `registerTheme` / `setOption` | 0 |
| `<canvas>` у `app/` | 0 |
| Згадки `echarts` у репозиторії поза `node_modules` | лише `skills-lock.json` і `scripts/skills.sh` — реєстрація самого скіла |

## Де в проєкті живе візуалізація даних

- **Числові дані користувачу** показуються як текст: статистика на `/tracks`
  (`app/pages/tracks.vue:96-105`, шість карток «Tracks / Releases / Artists /
  Playlists / Videos / Events» у `font-mono`), лічильники лайків і
  прослуховувань у плеєрі, лічильники на табах жанрів (`GenreTabs.vue`).
  Для чисел такого масштабу (6 значень, 4 значення) таблиця чи картка —
  правильний носій; діаграма тут була б структурою без інформації.
- **Вимірювання продуктивності** (`scripts/perf-baseline.mjs`,
  `scripts/lighthouse-baseline.mjs`) пишуть Markdown-таблиці й JSON у
  `docs/audits/data/`; графіків не будують, і для датованих знімків
  «до/після» таблиця з `min/median/p95` читається краще за графік.
- **Аудіо-візуалізація**: ініціатива
  [audio-waveform](../initiatives/audio-waveform.md) (`Idea`, Future) планує
  waveform для плеєра через canvas/SVG із precomputed peaks. Це не діаграма
  даних, а рендер сигналу з власним seek-контрактом; скіл прямо каже «Not for
  choosing chart types or for other charting libraries», тож він тут не
  застосовний і в майбутньому. Якби waveform колись будувався на ECharts
  (bar-серія з тисячами стовпчиків), §6 «cardinality and measurement» став би
  першим релевантним пунктом — але це рішення поза цим аудитом.

## Що це означає для наступних аудитів

Повторювати цей аудит не потрібно, доки в `package.json` не з'явиться
`echarts`. Достатньо одного рядка в наступному quality-аудиті: «`echarts` у
lockfile — 0».
