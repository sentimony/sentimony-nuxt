<p align="center">
  <img src="./public/images/sentimony-records-logo-v3.3.svg" alt="Sentimony Records Logo SVG v3.3" title="Sentimony Records Logo SVG v3.3" width="56" height="56">
</p>

# sentimony-nuxt

[![Netlify Status](https://api.netlify.com/api/v1/badges/77f60e5a-3062-4880-9ee0-b8407611c9c1/deploy-status)](https://app.netlify.com/projects/sentimony-nuxt/deploys)

JAMstack development of Sentimony Records portfolio website

### Used:
* [Nuxt](https://nuxt.com)
* [Firebase](https://firebase.google.com)
* [Netlify](https://netlify.com)
* [Tailwind](https://tailwindcss.com)
* [Iconify](https://icon-sets.iconify.design)
* [Swiper](https://swiperjs.com)
<!-- * [RealFaviconGenerator](https://realfavicongenerator.net) -->

### Links:

* [sentimony.com](https://sentimony.com)
* [sentimony-nuxt.netlify.app](https://sentimony-nuxt.netlify.app)

### Monitoring

* [Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/functions/server) or `netlify logs:function server`
* [Edge Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/edge-functions)
* [Requests Left](https://app.netlify.com/projects/sentimony-nuxt/configuration/functions#overview)

<!-- ### Content -->

<!-- [https://sentimony-db.firebaseio.com/.json](https://sentimony-db.firebaseio.com/.json) -->

### Run

```bash
npm i

npm run dev -- --host 0.0.0.0
```

### Deploy

```bash
firebase database:set / public/data/sentimony-db-export.json -P sentimony-db -f


netlify deploy --alias stage --context deploy-preview


netlify deploy --prod
```

### Have fun! ;)

<!-- ![Geometrical Pussy](public/images/geometrical-pussy.svg "Geometrical Pussy") -->
