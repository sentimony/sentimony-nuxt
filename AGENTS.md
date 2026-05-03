# Repository Guidelines

## Project Structure & Module Organization

This Nuxt 4 site keeps app code in `app/`: `pages/` for routes, `components/` for Vue components, `composables/` for data/UI logic, `constants/` for shared data, and `types/` for models. Server handlers live in `server/api/` and `server/routes/`, with helpers in `server/utils/`. Static files and exported content are in `public/`, including `public/data/sentimony-db-export.json`. Supabase schema files are under `supabase/migrations/`; Netlify edge functions are in `netlify/edge-functions/`. Tests are under `tests/components/`, `tests/composables/`, `tests/server/`, `tests/utils/`, and `tests/mocks/`.

## Build, Test, and Development Commands

- `npm i`: install dependencies and run `nuxt prepare`.
- `npm run dev` / `npm run dev:prod`: start Nuxt with `.env.stage` or `.env.prod`.
- `npm run build` / `npm run preview`: build and preview production output.
- `npm test` / `npm run test:watch`: run Vitest once or in watch mode.
- `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:headed`: run/debug Playwright with `.env.stage`.
- `npm run sync:firebase`: push `public/data/sentimony-db-export.json` to Firebase.
- `npm run sync:supabase:stage` / `npm run sync:supabase:prod`: sync source data into Supabase.
- `npm run deploy:stage` / `npm run deploy:prod`: deploy through Netlify.

Use Node `v24.15.0` and npm `11.12.1` as declared in `package.json`. Development commands expect `.env.stage`; production-like commands expect `.env.prod`. Never log secrets or full environment values.

## Coding Style & Naming Conventions

Use TypeScript and Vue SFCs with `<script setup lang="ts">`. Match existing style: two-space indentation, single quotes, no semicolons, PascalCase components such as `OpenSidebar.vue`, and camelCase composables such as `usePlaylistLikes.ts`. Keep Tailwind classes inline unless a shared pattern exists. Prefer self-documenting names; do not add code comments unless the surrounding file already uses them. No lint or format script is configured.

## Testing Guidelines

Vitest uses Nuxt environment, globals, and `tests/setup.ts`. Name tests `*.spec.ts` by surface area, for example `tests/components/Tabs.spec.ts` or `tests/server/api/likes.spec.ts`. Use `tests/utils/` helpers for mounted components and composables. For server API tests, mock Nitro globals with `vi.stubGlobal(...)`. No coverage threshold is configured; add focused tests for changed components, composables, and handlers.

## Commit & Pull Request Guidelines

Recent commits are short and informal (`upd`, `supabase`, `fix conflicts`), so there is no strict format. Prefer concise, imperative messages, for example `add playlist like tests`. Pull requests should include a summary, test results, linked issue or context, and screenshots for UI changes. Never include secrets or full env values. Agents should leave changes unstaged and uncommitted unless explicitly asked to commit.
