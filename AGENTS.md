# AGENTS.md

Guidance for coding agents working in this repository.

- Last reviewed: 2026-09-15

## Conventions

- **Instruction files:** the canonical file at every level is `AGENTS.md`; the `CLAUDE.md` beside it holds the single line `@AGENTS.md`. Claude Code does not read `AGENTS.md` natively, so a nested `AGENTS.md` without its shim is invisible to it. Write rules in `AGENTS.md` and touch `CLAUDE.md` only when the import scheme changes. Do not symlink them.
- **Instruction size:** the governing unit is bytes on the deepest root-to-cwd chain, capped at 32 KiB by Codex `project_doc_max_bytes`; Codex fixes that chain at session start and stops adding files once the cap is reached. This root file is ~11 KB, `app/AGENTS.md` ~14 KB and `server/AGENTS.md` ~11 KB, so any single chain fits. Claude Code separately targets under 200 lines per file. A topic longer than ~800 characters becomes sub-bullets. Compress what is here before adding a section: drop what is obvious from the code and per-component visual detail that changes weekly, keep invariants and gotchas. Detail that only concerns one directory belongs in that directory's `AGENTS.md`; cross-cutting reference material that agents need only on demand lives in `docs/agent-context/` and is linked from here.
- **Language:** Ukrainian in conversation. **Exception — artifacts that live in GitHub: PR title and description, issue text and commit messages are English**, because the team reads them and they stay in the repo history.
- **Code comments are English**, and only where the name cannot carry the meaning: an external constraint, a deliberate workaround, a non-obvious invariant. A comment restating the code is not wanted.
- **No git worktrees.** Do not create them (`git worktree add`, the `git-worktree-isolation` skill, `isolation: worktree`); work directly in the main checkout.

## Workflow

> Source of truth for skill names is `ls .claude/skills/` — do not invoke invented ones. Code review and security review are built-in slash commands (`/code-review`, `/security-review`), not skills.

- **New feature:** `scope-triage` → `plan-crafting` → `inline-plan-dev` (independent parallel tasks — `subagent-plan-dev`). Along the way as needed: `typescript` · `vitest`. Finish with `review-request` → `verification-gate` → **check**.
- **Bug / regression:** `debugging` → `tdd` → `verification-gate` → **check**.
- **UI work:** `web-debug` · `frontend-crafting` → **check**.
- **Prose (docs, README, UI copy):** `dashfix` · `negafix`.
- **Received review feedback:** `review-resolution` → fixes → `verification-gate` → **check**.

> **check** = `npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check` — green before any task is called done. Playwright (`test:e2e`) and the Netlify preset build are not in CI, so run them by hand when the change touches rendering or the deploy path.

## Project Overview

Sentimony Records - JAMstack portfolio for a psychedelic music label. Nuxt 4 (SSR via Netlify serverless), Firebase Realtime DB or Supabase (switchable catalog content), Supabase (auth + likes/profile), Tailwind v4.

Live: [sentimony.com](https://sentimony.com) · Staging: `stage--sentimony-nuxt.netlify.app`

## Commands

Node `24.15.0` (`.nvmrc`).

The canonical local gate is `npm run test:unit && npm run typecheck && npm run typecheck:tests && npm run docs:check`.
`typecheck:tests` runs `vue-tsc` over `tsconfig.tests.json` (extends the generated `.nuxt/tsconfig.app.json`, `exclude: []`, no Vitest globals) so `tests/`, `vitest.config.ts` and `playwright.config.ts` are typed; strictness flags for the app/server programs live in `typescript.tsConfig` / `nitro.typescript.tsConfig` in `nuxt.config.ts`, never in `.nuxt/`. `noUnusedLocals`/`noUnusedParameters` are on in every program, so an unused import fails the gate. Use `npm run typecheck:ts7` for edge-function types, `BASE_URL=... npm run web-debug`
for HTTP smoke, and `npm run verify:pwa` after PWA asset changes. The package scripts
remain the source of truth for routine dev, build, test, sync, and deploy commands.

**Performance baselines.** Use `PERF_LABEL=... npm run perf:baseline` and `LH_LABEL=... npm run perf:lighthouse`; do not hand-roll `curl`. For methodology, cache behavior, host comparison, and Cloudflare evaluation details, read [`docs/agent-context/frontend-and-docs.md`](docs/agent-context/frontend-and-docs.md).

Do not run `sync:*` unless explicitly asked; these scripts write to remote Firebase/Supabase stores. **The exception is deploying:** `predeploy:stage` / `predeploy:prod` run `sync:supabase && sync:firebase` before every `deploy:stage` / `deploy:prod`; those npm scripts are the only path to prod and stage (the CLI uploads a local build, so the `netlify.toml` build commands do not run there). Netlify deploy previews are built from a PR push (the site is linked to `sentimony/sentimony-nuxt`) and run `sync:supabase:preview && npm run build` (`[context.deploy-preview]` in `netlify.toml`), because previews read the same Supabase catalog and would otherwise show the content of the last manual deploy. `scripts/sync-supabase-preview.mjs` runs the sync only when the branch contains `origin/main` **and** its catalog inputs (the YAML, the convert, sync and guard scripts, `package.json`, the lockfile and `.nvmrc`) are identical to it, so a preview writes what a prod deploy of `main` would; this covers accidental drift, not a hostile PR, which only credential isolation would stop; a branch with catalog edits builds without syncing, because the store is shared by prod, stage and every preview and an unmerged catalog would otherwise rewrite or delete prod rows. This is what keeps `sentimony-db.yml` from silently diverging from the store prod reads. Two consequences: a manual deploy needs both `SUPABASE_SECRET_KEY` and `FIREBASE_DB_SECRET` present locally or it aborts before uploading, and `sync-supabase.mjs` deletes stale `tracks` / `track_artists` rows, so a bad YAML edit propagates deletions at deploy time.
CI (`.github/workflows/ci.yml`) runs `docs:check`, `typecheck`, `typecheck:ts7`, `typecheck:tests`, `test:unit`, a `node-server` build and `web-debug` on push/PR — Playwright and the Netlify preset build are **not** in CI yet. **CI runs on Linux, so file-path casing matters** even though macOS hides mismatches locally.

`npm install` is not inert: `preinstall` → `scripts/setup.sh` (creates `.env/`, `.claude/skills/`, seeds `.claude/settings.json` attribution flags) and `postinstall` → `scripts/skills.sh` (re-installs the pinned agent skills via `npx skills add`, network required). `npm run clean` wipes `node_modules`, `package-lock.json`, `.nuxt` and the installed skills — do not run it casually.

**Dev servers:** respect the user's already-running dev environments. Ports 3000–3002 (and any other running `nuxt dev`) are likely the user's — never stop them. Never run a broad `pkill -f "nuxt dev"`; it kills the user's servers too. If you need your own server for verification, start it on a distinct free port (e.g. `--port 3100`) via `.agents/skills/web-debug/scripts/with_server.py`, and stop only that instance once your work is done.
`npm run typecheck` passes locally with Supabase env warnings when the secrets are absent — that warning is not a failure.
Unit tests mock Nitro auto-imported utils (`supabaseAdmin`, `defineEventHandler`, `fetch*` helpers) through `installNitroGlobals(overrides)` from `tests/setup/nitroMocks.ts` (returns a `restore()` for `afterEach`; `fakeEvent()` for handler calls) with `vi.resetModules()` + dynamic import — see `tests/unit/likeCountersHandler.test.ts`. `restoreMocks: true` in `vitest.config.ts` restores spies, so no manual `vi.restoreAllMocks()`. Do not enable Vitest's suggested `isolate: false`: files mutate `globalThis`.

**Supabase CLI / міграції:** усі команди CLI, токен `SUPABASE_ACCESS_TOKEN` і обхідний шлях для `db push` (падає з `read .env: is a directory`, бо `.env` — директорія) — у [`docs/supabase-cli.md`](docs/supabase-cli.md). Читай його перед тим, як застосовувати міграцію або лінкувати проєкт.

**Env.** `.env/.env` (team defaults, gitignored) then `.env/.env.local` (personal) - both auto-loaded by the npm scripts. `.env` is a **directory**; a stray `.env.local` at the repo root is **not** loaded by anything.

- **Supabase:** define `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY` (canonical `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_KEY` / `NUXT_SUPABASE_SECRET_KEY` also work).
- **Catalog source:** `CATALOG_SOURCE=firebase|supabase` chooses the content source at process start; `NUXT_CATALOG_SOURCE` can override it in deployed Nuxt/Nitro runtime. As of 2026-07, all Netlify contexts (prod + stage) run `NUXT_CATALOG_SOURCE=supabase`. Track `audio_url` (R2 links from `sentimony-audio-manager`) is synced to Supabase only - Firebase stays stale on audio, so under `firebase` mode most tracks show no audio. Change the source with `npx netlify env:set NUXT_CATALOG_SOURCE <val> --context <ctx>` + redeploy.
- **`NETLIFY_AUTH_TOKEN`** in `.env/.env.local` (personal access token of the site-owning Netlify account) makes `deploy:stage`/`deploy:prod` independent of the active `netlify switch` account, and is required by `env:set` — the active `netlify` CLI account has read-only rights → writes fail with `JSONHTTPError: Not Found`.
- **`FIREBASE_DB_SECRET`** in `.env/.env.local` (Firebase Console → Project Settings → Service Accounts → Database secrets) is required by `sync:firebase`, which writes via a REST `PUT` (`scripts/sync-firebase.mjs`) instead of the `firebase-tools` CLI.

The nuxt scripts (`dev`/`build`/`generate`/`preview`/`postinstall`) are prefixed `TMPDIR=/tmp` - don't remove it. Nuxt 4.x's vite-node IPC uses a Unix socket under `os.tmpdir()`; on macOS the default `$TMPDIR` (`/var/folders/…/T/`) pushes the socket path past the 104-char `sun_path` limit → `connect EINVAL …sock` on the first request. `/tmp` keeps it short. Harmless on Linux/Netlify (already short) and Windows (named pipes, not affected).

## Architecture

Detailed architecture lives in two nested instruction files, loaded on demand when
you work in that directory. A Codex session started at the repository root does not
load them automatically — open the relevant one before touching that subtree.

| Directory | File | Contains |
| --- | --- | --- |
| `app/` | [`app/AGENTS.md`](app/AGENTS.md) | Audio player and queue, composables, pages and the releases genre filter, Tailwind v4 styling, PWA, images, `ui/` primitives and buttons, text tiers and focus states, landmarks |
| `server/` | [`server/AGENTS.md`](server/AGENTS.md) | Catalog sources and export, first-class tracks, server utils, PostgREST row cap, likes (identity, RPC, counters, migrations), rendering and caching, auth, profile, artist numbering |

**User ID у `@nuxtjs/supabase`:** `useSupabaseUser()` повертає JWT-об'єкт де ID знаходиться в `user?.sub`, а не `user?.id` (як у стандартному Supabase JS SDK). Завжди використовуй `user?.sub ?? user?.id` — див. `server/utils/likes.ts`.

## Docs

`docs/roadmap.md` і поле `- Status:` у кожному initiative-файлі мають залишатися синхронними; після змін у документах запускай `npm run docs:check`. Деталі про naming, архівні каталоги, індекси аудитів і dated snapshots описані в [`docs/agent-context/frontend-and-docs.md`](docs/agent-context/frontend-and-docs.md).
