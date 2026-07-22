# Auth and Supabase client bundle

- Status: Planned
- Priority: P1
- Last reviewed: 2026-07-22
- Related: [spec](../superpowers/specs/2026-07-19-auth-bundle-design.md), [plan](../superpowers/plans/2026-07-19-auth-bundle.md)

## Навіщо

Auth state, Supabase client і глобальний Toaster впливають на public layout, хоча
авторизація та профіль є другорядними відносно каталогу.

## Очікуваний результат

Публічні маршрути завантажують менше початкового JavaScript, а signin, session,
profile і likes зберігають поточну поведінку.

## Обсяг

- Зняти production bundle baseline.
- Винести auth-залежні header/sidebar частини у lazy boundaries.
- Перевірити відкладену гідратацію Toaster.
- Зафіксувати ADR щодо глибшої заміни Supabase module integration.

## Залежності

- Стабільні auth/browser scenarios у CI.
- Рішення мають спиратися на bundle measurements, а не лише на source imports.

## Критерії завершення

- Initial JS public routes зменшено й числа зафіксовано.
- Signin, signup, password reset, session menu, likes і profile працюють.
- Немає hydration або delayed-interaction regressions.

## Наступний крок

Зняти bundle analyze baseline і виконати екстракції з наявного plan по одній.
