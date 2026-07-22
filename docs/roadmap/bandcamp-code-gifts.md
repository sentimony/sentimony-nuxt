# Bandcamp-code gifts

- Status: Idea
- Priority: Future
- Last reviewed: 2026-07-22
- Related: [profile aggregation](profile-aggregation.md), [mutation hardening](mutation-hardening.md)

## Навіщо

Bandcamp redemption codes можуть бути корисною винагородою для зареєстрованих
фанів, але raw code pool і одноразова видача потребують сильнішого захисту, ніж
звичайний public catalog content.

## Очікуваний результат

Eligible user отримує один доступний код через idempotent claim, а невикористані
коди ніколи не потрапляють у public або client-bulk responses.

## Обсяг

- Визначити eligibility, campaign/release scope і disclosure rules.
- Спроєктувати secure import/storage та admin operations.
- Додати transactional one-time claim, audit trail і exhaustion behavior.
- Врахувати concurrent claims, повторні requests і support/revocation policy.

## Залежності

- Auth/profile identity та [profile aggregation](profile-aggregation.md).
- [Mutation validation and rate limiting](mutation-hardening.md).
- Власник процесу імпорту й operational handling кодів.

## Критерії завершення

- Concurrent claims не можуть видати той самий код двічі.
- Повторний idempotent request не споживає новий код.
- Raw unused codes не доступні через public/client responses або logs.
- Claim history придатна для support та audit.

## Наступний крок

Задокументувати eligibility та operational ownership імпорту кодів до schema design.
