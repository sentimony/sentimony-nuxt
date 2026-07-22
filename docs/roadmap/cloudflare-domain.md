# Cloudflare domain and platform migration

- Status: Idea
- Priority: Future
- Last reviewed: 2026-07-22
- Related: [documentation organization spec](../superpowers/specs/2026-07-22-documentation-organization-design.md)

## Навіщо

Cloudflare може дати централізоване DNS/CDN керування, додатковий security layer
і потенційний шлях до Pages/Workers. Водночас поточний Nuxt runtime, deploy
contexts, image provider та edge functions прив'язані до Netlify.

## Очікуваний результат

Є поетапне рішення без прихованого припущення, що перенесення DNS автоматично
означає перенесення application runtime.

## Обсяг

- Фаза 1: оцінити registrar/DNS, proxy, CDN, SSL і rollback зі збереженням Netlify runtime.
- Фаза 2: окремо оцінити Pages/Workers, Nitro support, image pipeline, redirects,
  edge functions, preview deploys і operational cost.
- Описати zero-downtime cutover і rollback для кожної схваленої фази.

## Залежності

- Повний inventory DNS records, Netlify contexts, environment variables, redirects,
  edge functions та image delivery.
- Доступ до Cloudflare і site-owning Netlify account потрібен лише після design approval.

## Критерії завершення

- Є decision record для DNS/CDN phase і окремий keep/migrate verdict для runtime.
- Зафіксовано compatibility gaps, cost, rollback і zero-downtime checklist.
- Жодна фаза не починається без перевіреного rollback path.

## Наступний крок

Інвентаризувати поточні DNS records, Netlify context behavior, edge functions,
image provider і rollback requirements.
