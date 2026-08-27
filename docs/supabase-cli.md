# Supabase CLI

Довідник для роботи з міграціями та CLI Supabase у цьому репозиторії.

## Встановлення й токен

Використовувати через `npx supabase` — глобальний CLI не встановлюємо.

`SUPABASE_ACCESS_TOKEN` (формат `sbp_...`) — Personal Access Token з
[Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens),
зберігати в `.env/.env.local`.

Прив'язати проєкт перед першим пушем:

```bash
npx supabase link --project-ref dugbgewuzowoogglccue --yes
```

## Застосування міграцій: `.env` — це директорія

`npx supabase db push` падає з `read .env: is a directory`, бо в цьому репозиторії
`.env` — директорія (`.env/.env`, `.env/.env.local`), а CLI очікує файл. Обхідний
шлях — виконувати SQL напряму через `db query --linked --file` з тимчасової
директорії, де `.env` є порожнім файлом:

```bash
# Instead of db push, run SQL directly from a tmp directory with an empty .env file.
TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env/.env.local | cut -d= -f2)
mkdir -p /tmp/sb/supabase && cp supabase/config.toml /tmp/sb/supabase/ && cp -r supabase/.temp /tmp/sb/supabase/ && touch /tmp/sb/.env
cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked --file /path/to/migration.sql
```

Міграції лежать у `supabase/migrations/` з іменами `YYYYMMDD_<topic>.sql`.
