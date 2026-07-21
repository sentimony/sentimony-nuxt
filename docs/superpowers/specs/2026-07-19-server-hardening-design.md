# Server hardening: likes validation, rate limiting, logging privacy (PRODUCT.md §8, ROADMAP P2 #9–10)

Дата: 2026-07-19. Гілка: `json-to-yml`.

> Спека написана в автономному режимі (користувач заборонив питання).

## Контекст (фактичний стан)

- `likesAddHandler`/`likesDeleteHandler` (`server/utils/likes.ts`) валідують slug лише на truthy: немає trim, max length, формату, перевірки існування сутності. Єдиний зразок кращої валідації — `track-plays.post.ts` (`trim`, `length > 200`).
- Rate limiting відсутній повністю (grep підтверджено); `netlify/edge-functions/blocking.ts` — лише signature-блокування сканерів за URL.
- `server/utils/logger.ts` (`logRequest`) логує IP, повний URL із query та referer у plaintext на кожен запит, без redaction/sampling, включно з production.

## Рішення

1. **Спільний slug-валідатор** `server/utils/slugValidation.ts`: `normalizeSlug(input: unknown): string | null` — рядок → `trim()`, довжина 1–200, формат `^[a-z0-9][a-z0-9-]*$` (усі каталожні slug-и — lowercase-slugify). Невалідний → `null` → handler відповідає 400. Застосовується в `likesAddHandler`, `likesDeleteHandler`, `track-plays.post.ts` (замінює локальну перевірку).
2. **Перевірка існування сутності перед insert**: мапа `release_likes → releases`, … `event_likes → events`; перед RPC `increment_like` — `supabaseAdmin().from(entityTable).select('slug').eq('slug', slug).maybeSingle()`; немає рядка → 404. Supabase content-таблиці — канонічне джерело існування (вони синхронізовані з export незалежно від активного catalog source). Кеш існування не вводимо (один PK-lookup на клік — прийнятно, YAGNI).
3. **Rate limiting — in-memory token bucket** `server/utils/rateLimit.ts`: `assertWithinRateLimit(key, { limit, windowMs })` кидає 429; ключ — `identity:routeFamily` (identity = userId/anon-id, інакше IP). Ліміти: likes-мутації 30/хв, track-plays 60/хв, auth-роути не чіпаємо (ними керує Supabase). **Чесне обмеження:** лічильник живе в пам'яті lambda-інстанса — на Netlify це м'який ліміт per-instance, не глобальний; цього достатньо проти випадкових циклів/агресивних клікерів, а не проти розподіленого abuse (для нього — Netlify rate limiting rules, поза скоупом, зафіксувати в ROADMAP як опцію).
4. **Логування**: `logRequest` у production логує pathname без query, referer лише hostname, IP маскується до /24 (`1.2.3.x`); повний verbose-режим — тільки коли `import.meta.dev` або env `LOG_VERBOSE=1`. Sampling не вводимо (обсяг прийнятний після redaction; YAGNI).

## Помилки

- 400 — невалідний slug/відсутня identity (як зараз); 404 — сутність не існує; 429 — перевищено ліміт (з `Retry-After: 60`). Тексти помилок не розкривають внутрішніх деталей.

## Тести

- Юніт: `normalizeSlug` (trim, довжина, формат, не-рядок); rate limiter (пропускає до ліміту, 429 після, вікно скидається); likesAddHandler — 400 на невалідний slug, 404 на неіснуючу сутність, happy path незмінний; logger — redaction у prod-режимі.
- e2e `api-security.spec.ts`: додати кейс `POST /api/likes` зі сміттєвим slug → 400 (не залежить від identity, бо валідація перша після identity — кейс із cookie).
