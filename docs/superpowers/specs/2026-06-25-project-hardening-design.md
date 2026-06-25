# Project Hardening Design

## Goal

Закрити вісім підтверджених проблем безпеки, продуктивності та підтримуваності, не змінюючи видиму поведінку каталогу.

## Architecture

Публічне кешування застосовується лише до явно перелічених read-only API. Усі likes endpoints отримують `private, no-store`. Detail endpoints повертають лише видимі сутності, а HTML із бази проходить через єдиний sanitizer на основі `isomorphic-dompurify`.

Firebase export переміщується з `public/` у приватну `data/` директорію. List endpoints використовують спільний mapper, який одночасно відбирає DTO-поля і відкидає `visible: false`.

Nuxt Icon отримує явний список потрібних колекцій. Невикористана Tabler-колекція видаляється. Swiper монтується лише для активних категорій, а компонент завантажується як Nuxt lazy component.

Profile отримує один агрегований endpoint. Він виконує шість незалежних likes-запитів паралельно на сервері та повертає початкові вкладки одним HTTP response. Наступна пагінація залишається на існуючих category endpoints.

## Testing

- Vitest перевіряє cache classification, HTML sanitization, Firebase list filtering і profile aggregation helpers.
- Playwright використовує `localhost`, щоб відповідати Nuxt IPv6 listener.
- API/security tests перевіряють cache headers, приховані detail records і відсутність небезпечного HTML.
- Production build використовується як regression check для client і icon bundles.

## Constraints

- Не змінювати поточні незакомічені UI-правки користувача.
- Не змінювати формат Firebase database import, крім локального шляху до export-файлу.
- Не вимагати тестового Supabase користувача для базового test suite.
