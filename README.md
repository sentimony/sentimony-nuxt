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

```bash
npm run sync:firebase

npm run sync:supabase

npm run deploy:stage

npm run deploy:prod
```

### Have fun! ;)
