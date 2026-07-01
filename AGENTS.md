## Communication

- Спілкування з користувачем — українською.
- Опис своїх дій — українською.
- Коментарі в коді — англійською.
- Якщо зустрічаються коментарі в коді іншою мовою, запропонувати вибір: "перекласти англійською зараз" або "не виправляти в цій сесії".

## Project Notes

- Canonical catalog export: `server/data/server/sentimony-db-export.json`.
- Artist records in the export are keyed by slug, not numeric array indexes.
- Artist list order: `musician → dj → mastering → designer`; within each category sort by ascending `category_id`.
- Do not sync Firebase/Supabase unless the user explicitly asks; `sync:*` scripts write to remote data stores.

## Workflow

- Prefer `rg` for search.
- Use focused tests for changed behavior before broad verification.
- Do not revert unrelated user changes in the worktree.
