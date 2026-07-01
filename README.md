<p align="center">
  <img src="./public/images/sentimony-records-logo-v3.3.svg" alt="Sentimony Records Logo SVG v3.3" title="Sentimony Records Logo SVG v3.3" width="56" height="56">
</p>

# sentimony-nuxt

[![Netlify Status](https://api.netlify.com/api/v1/badges/77f60e5a-3062-4880-9ee0-b8407611c9c1/deploy-status)](https://app.netlify.com/projects/sentimony-nuxt/deploys)

JAMstack development of Sentimony Records portfolio website

Catalog content can be served from Firebase Realtime Database or Supabase. Supabase is also used for auth, profile storage, and favourites.

### Used:
* [Nuxt](https://nuxt.com)
* [Firebase](https://firebase.google.com)
* [Supabase](https://supabase.com)
* [Netlify](https://netlify.com)
* [Tailwind](https://tailwindcss.com)
* [Reka UI](https://reka-ui.com)
* [Shadcn Vue](https://www.shadcn-vue.com)
* [Iconify](https://icon-sets.iconify.design)
* [Swiper](https://swiperjs.com)

### Links:

* [sentimony.com](https://sentimony.com)
* [sentimony-nuxt.netlify.app](https://sentimony-nuxt.netlify.app)

### Monitoring

* [Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/functions/server)
* [Edge Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/edge-functions)
* [Requests Left](https://app.netlify.com/projects/sentimony-nuxt/configuration/functions#overview)

### Run

```zsh
npm i

npm run dev
```

Switch catalog source:

```zsh
CATALOG_SOURCE=firebase npm run dev
CATALOG_SOURCE=supabase npm run dev
NUXT_CATALOG_SOURCE=supabase npm run build
```

### Deploy

```zsh
npm run sync:firebase

npm run sync:supabase

npm run deploy:stage

npm run deploy:prod
```

### Skills

```zsh

# META
npx skills add anthropics/claude-plugins-official -s claude-md-improver -a codex claude-code -y

# FRONTEND
npx skills add anthropics/skills -s frontend-design -a codex claude-code -y
# npx skills add giuseppe-trisciuoglio/developer-kit -s tailwind-css-patterns -a codex claude-code -y
# npx skills add skilld-dev/vue-ecosystem-skills -s reka-ui-skilld -a codex claude-code -y
# npx skills add unovue/shadcn-vue -s shadcn-vue -a codex claude-code -y

# TESTS
npx skills add anthropics/skills -s webapp-testing -a codex claude-code -y
# npx skills add antfu/skills -s vitest -a codex claude-code -y
# npx skills add currents-dev/playwright-best-practices-skill -a codex claude-code -y

# SUPABASE
# npx skills add supabase/agent-skills -s supabase -a codex claude-code -y
# npx skills add supabase/agent-skills -s supabase-postgres-best-practices -a codex claude-code -y

# WORKFLOW
npx skills add obra/superpowers -s brainstorming -a codex claude-code -y
npx skills add obra/superpowers -s writing-plans -a codex claude-code -y
npx skills add obra/superpowers -s dispatching-parallel-agents -a codex claude-code -y
npx skills add obra/superpowers -s executing-plans -a codex claude-code -y
npx skills add obra/superpowers -s subagent-driven-development -a codex claude-code -y
npx skills add obra/superpowers -s systematic-debugging -a codex claude-code -y
npx skills add obra/superpowers -s test-driven-development -a codex claude-code -y
# npx skills add obra/superpowers -s using-git-worktrees -a codex claude-code -y
# npx skills add obra/superpowers -s verification-before-completion -a codex claude-code -y
# npx skills add obra/superpowers -s receiving-code-review -a codex claude-code -y
# npx skills add obra/superpowers -s requesting-code-review -a codex claude-code -y
# npx skills add obra/superpowers -s finishing-a-development-branch -a codex claude-code -y

# DESIGN
# npx skills add better-auth/better-icons -s better-icons -a codex claude-code -y
# npx skills add wshobson/agents -s tailwind-design-system -a codex claude-code -y
# npx impeccable skills install
# npx impeccable skills uninstall

# GRAPH
# uv tool install graphifyy
# uv tool uninstall graphifyy

# TOKENOMICS
# npx skills add forrestchang/andrej-karpathy-skills -s karpathy-guidelines -a codex claude-code -y
# npx skills add dietrichgebert/ponytail -s ponytail -a codex claude-code -y

# TYPESCRIPT
npx skills add sickn33/antigravity-awesome-skills -s typescript-expert -a codex claude-code -y

```

### Have fun! ;)
