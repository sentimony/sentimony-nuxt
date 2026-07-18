<p align="center">
  <img src="./public/images/sentimony-records-logo-v3.3.svg" alt="Sentimony Records Logo SVG v3.3" title="Sentimony Records Logo SVG v3.3" width="56" height="56">
</p>

# sentimony-nuxt
[![Netlify Status](https://api.netlify.com/api/v1/badges/77f60e5a-3062-4880-9ee0-b8407611c9c1/deploy-status)](https://app.netlify.com/projects/sentimony-nuxt/deploys)
JAMstack development of Sentimony Records portfolio website
Catalog content can be served from Firebase Realtime Database or Supabase. Supabase is also used for auth, profile storage, and favourites.

### Used:
* <img src="https://cdn.simpleicons.org/nodedotjs" width="16" height="16"> [Node.js](https://nodejs.org)
* <img src="https://cdn.simpleicons.org/nuxt" width="16" height="16"> [Nuxt](https://nuxt.com)
* <img src="https://cdn.simpleicons.org/vite" width="16" height="16"> [Vite](https://vitejs.dev)
* <img src="https://api.iconify.design/unjs/nitro.svg" width="16" height="16"> [Nitro](https://nitro.build)
* <img src="https://cdn.simpleicons.org/firebase" width="16" height="16"> [Firebase](https://firebase.google.com)
* <img src="https://cdn.simpleicons.org/supabase" width="16" height="16"> [Supabase](https://supabase.com)
* <img src="https://cdn.simpleicons.org/netlify" width="16" height="16"> [Netlify](https://netlify.com)
* <img src="https://cdn.simpleicons.org/tailwindcss" width="16" height="16"> [Tailwind](https://tailwindcss.com)
* <img src="https://cdn.simpleicons.org/rekaui" width="16" height="16"> [Reka UI](https://reka-ui.com)
* <img src="https://cdn.simpleicons.org/shadcnui" width="16" height="16"> [Shadcn Vue](https://www.shadcn-vue.com)
* <img src="https://cdn.simpleicons.org/iconify" width="16" height="16"> [Iconify](https://icon-sets.iconify.design)
* <img src="https://cdn.simpleicons.org/lucide" width="16" height="16"> [Lucide Icons](https://lucide.dev)
* <img src="https://cdn.simpleicons.org/simpleicons" width="16" height="16"> [Simple Icons](https://simpleicons.org)
* <img src="https://cdn.simpleicons.org/swiper" width="16" height="16"> [Swiper](https://swiperjs.com)
* <img src="https://cdn.simpleicons.org/vitest" width="16" height="16"> [Vitest](https://vitest.dev)
* <img src="https://api.iconify.design/logos/playwright.svg" width="16" height="16"> [Playwright](https://playwright.dev)

### Run
```bash
npm i
npm run dev
```
Switch catalog source:
```bash
CATALOG_SOURCE=firebase npm run dev
CATALOG_SOURCE=supabase npm run dev
NUXT_CATALOG_SOURCE=supabase npm run build
```

### Deploy
`sync:firebase` requires `FIREBASE_DB_SECRET` in `.env/.env.local` (see `.env/.env.example`).
```bash
npm run sync:firebase
npm run sync:supabase
npm run deploy:stage
npm run deploy:prod
```

### Skills
* [scripts/skills.sh](scripts/skills.sh)

### Links:
* [sentimony.com](https://sentimony.com)
* [sentimony-nuxt.netlify.app](https://sentimony-nuxt.netlify.app)

### Monitoring
* [Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/functions/server)
* [Edge Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/edge-functions)
* [Requests Left](https://app.netlify.com/projects/sentimony-nuxt/configuration/functions#overview)

Have fun! ;)
