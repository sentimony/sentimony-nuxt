<p align="center">
  <img src="./public/images/sentimony-records-logo-v3.3.svg" alt="Sentimony Records Logo SVG v3.3" title="Sentimony Records Logo SVG v3.3" width="56" height="56">
</p>

# sentimony-nuxt

[![Netlify Status](https://api.netlify.com/api/v1/badges/77f60e5a-3062-4880-9ee0-b8407611c9c1/deploy-status)](https://app.netlify.com/projects/sentimony-nuxt/deploys)

Web development of Sentimony Records portfolio website.

Catalog content can be served from Firebase Realtime Database or Supabase.
Supabase is also used for auth, profile storage, and favourites.

### Used

<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Technology</th>
      <th>Purpose</th>
      <th>Stars</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="5"><strong>Core</strong></td>
      <td><img src="https://cdn.simpleicons.org/nodedotjs" width="16" height="16"> <a href="https://nodejs.org">Node.js</a></td>
      <td>Runtime (>=24.15.0)</td>
      <td><a href="https://github.com/nodejs/node"><img src="https://img.shields.io/github/stars/nodejs/node?style=flat&logo=github&logoColor=white&label=&color=555" alt="Node.js stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/typescript" width="16" height="16"> <a href="https://www.typescriptlang.org">TypeScript</a></td>
      <td>Language</td>
      <td><a href="https://github.com/microsoft/TypeScript"><img src="https://img.shields.io/github/stars/microsoft/TypeScript?style=flat&logo=github&logoColor=white&label=&color=555" alt="TypeScript stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/nuxt" width="16" height="16"> <a href="https://nuxt.com">Nuxt</a></td>
      <td>SSR framework (v4), file-based routing</td>
      <td><a href="https://github.com/nuxt/nuxt"><img src="https://img.shields.io/github/stars/nuxt/nuxt?style=flat&logo=github&logoColor=white&label=&color=555" alt="Nuxt stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://api.iconify.design/unjs/nitro.svg" width="16" height="16"> <a href="https://nitro.build">Nitro</a></td>
      <td>Server engine, <code>server/api/**</code>, cached handlers</td>
      <td><a href="https://github.com/nitrojs/nitro"><img src="https://img.shields.io/github/stars/nitrojs/nitro?style=flat&logo=github&logoColor=white&label=&color=555" alt="Nitro stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/vite" width="16" height="16"> <a href="https://vitejs.dev">Vite</a></td>
      <td>Dev server + build</td>
      <td><a href="https://github.com/vitejs/vite"><img src="https://img.shields.io/github/stars/vitejs/vite?style=flat&logo=github&logoColor=white&label=&color=555" alt="Vite stars"></a></td>
    </tr>
    <tr>
      <td rowspan="7"><strong>Frontend</strong></td>
      <td><img src="https://cdn.simpleicons.org/vuedotjs" width="16" height="16"> <a href="https://vuejs.org">Vue</a></td>
      <td>UI framework, Composition API</td>
      <td><a href="https://github.com/vuejs/core"><img src="https://img.shields.io/github/stars/vuejs/core?style=flat&logo=github&logoColor=white&label=&color=555" alt="Vue stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/vuedotjs" width="16" height="16"> <a href="https://vueuse.org">VueUse</a></td>
      <td><code>useStorage</code> (theme), UI primitives</td>
      <td><a href="https://github.com/vueuse/vueuse"><img src="https://img.shields.io/github/stars/vueuse/vueuse?style=flat&logo=github&logoColor=white&label=&color=555" alt="VueUse stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/vuedotjs" width="16" height="16"> <a href="https://vee-validate.logaretm.com">vee-validate</a></td>
      <td>Auth form validation (function-based schemas)</td>
      <td><a href="https://github.com/logaretm/vee-validate"><img src="https://img.shields.io/github/stars/logaretm/vee-validate?style=flat&logo=github&logoColor=white&label=&color=555" alt="vee-validate stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/swiper" width="16" height="16"> <a href="https://swiperjs.com">Swiper</a></td>
      <td>Release / artist carousels</td>
      <td><a href="https://github.com/nolimits4web/swiper"><img src="https://img.shields.io/github/stars/nolimits4web/swiper?style=flat&logo=github&logoColor=white&label=&color=555" alt="Swiper stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://vue-sonner.vercel.app">vue-sonner</a></td>
      <td>Toasts on failed likes</td>
      <td><a href="https://github.com/xiaoluoboding/vue-sonner"><img src="https://img.shields.io/github/stars/xiaoluoboding/vue-sonner?style=flat&logo=github&logoColor=white&label=&color=555" alt="vue-sonner stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/v-wave">v-wave</a></td>
      <td>Ripple effect on buttons and links</td>
      <td><a href="https://github.com/justintaddei/v-wave"><img src="https://img.shields.io/github/stars/justintaddei/v-wave?style=flat&logo=github&logoColor=white&label=&color=555" alt="v-wave stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/cure53/DOMPurify">DOMPurify</a></td>
      <td>Sanitizing catalog HTML</td>
      <td><a href="https://github.com/cure53/DOMPurify"><img src="https://img.shields.io/github/stars/cure53/DOMPurify?style=flat&logo=github&logoColor=white&label=&color=555" alt="DOMPurify stars"></a></td>
    </tr>
    <tr>
      <td rowspan="6"><strong>UI</strong></td>
      <td><img src="https://cdn.simpleicons.org/tailwindcss" width="16" height="16"> <a href="https://tailwindcss.com">Tailwind CSS</a></td>
      <td>Styling, CSS-first config (v4, no <code>tailwind.config</code>)</td>
      <td><a href="https://github.com/tailwindlabs/tailwindcss"><img src="https://img.shields.io/github/stars/tailwindlabs/tailwindcss?style=flat&logo=github&logoColor=white&label=&color=555" alt="Tailwind CSS stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/jamiebuilds/tailwindcss-animate">tailwindcss-animate</a></td>
      <td>Animation utilities</td>
      <td><a href="https://github.com/jamiebuilds/tailwindcss-animate"><img src="https://img.shields.io/github/stars/jamiebuilds/tailwindcss-animate?style=flat&logo=github&logoColor=white&label=&color=555" alt="tailwindcss-animate stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/rekaui" width="16" height="16"> <a href="https://reka-ui.com">Reka UI</a></td>
      <td>Headless primitives behind the local UI kit</td>
      <td><a href="https://github.com/unovue/reka-ui"><img src="https://img.shields.io/github/stars/unovue/reka-ui?style=flat&logo=github&logoColor=white&label=&color=555" alt="Reka UI stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://cva.style">cva</a></td>
      <td>Button variants (<code>buttonVariants</code>)</td>
      <td><a href="https://github.com/joe-bell/cva"><img src="https://img.shields.io/github/stars/joe-bell/cva?style=flat&logo=github&logoColor=white&label=&color=555" alt="cva stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/dcastil/tailwind-merge">tailwind-merge</a></td>
      <td>Class conflict resolution in <code>cn()</code></td>
      <td><a href="https://github.com/dcastil/tailwind-merge"><img src="https://img.shields.io/github/stars/dcastil/tailwind-merge?style=flat&logo=github&logoColor=white&label=&color=555" alt="tailwind-merge stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/lukeed/clsx">clsx</a></td>
      <td>Conditional classes in <code>cn()</code></td>
      <td><a href="https://github.com/lukeed/clsx"><img src="https://img.shields.io/github/stars/lukeed/clsx?style=flat&logo=github&logoColor=white&label=&color=555" alt="clsx stars"></a></td>
    </tr>
    <tr>
      <td rowspan="6"><strong>Icons & Fonts</strong></td>
      <td><img src="https://cdn.simpleicons.org/iconify" width="16" height="16"> <a href="https://icon-sets.iconify.design">Iconify</a></td>
      <td><code><Icon></code> via <code>@nuxt/icon</code></td>
      <td><a href="https://github.com/iconify/iconify"><img src="https://img.shields.io/github/stars/iconify/iconify?style=flat&logo=github&logoColor=white&label=&color=555" alt="Iconify stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/lucide" width="16" height="16"> <a href="https://lucide.dev">Lucide</a></td>
      <td>UI icon set (24px, stroke-2)</td>
      <td><a href="https://github.com/lucide-icons/lucide"><img src="https://img.shields.io/github/stars/lucide-icons/lucide?style=flat&logo=github&logoColor=white&label=&color=555" alt="Lucide stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/lucide" width="16" height="16"> <a href="https://github.com/lucide-icons/lucide-lab">Lucide Lab</a></td>
      <td>Extra marks not in the core set</td>
      <td><a href="https://github.com/lucide-icons/lucide-lab"><img src="https://img.shields.io/github/stars/lucide-icons/lucide-lab?style=flat&logo=github&logoColor=white&label=&color=555" alt="Lucide Lab stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/simpleicons" width="16" height="16"> <a href="https://simpleicons.org">Simple Icons</a></td>
      <td>Brand icons (<code>app/constants/icons.ts</code>)</td>
      <td><a href="https://github.com/simple-icons/simple-icons"><img src="https://img.shields.io/github/stars/simple-icons/simple-icons?style=flat&logo=github&logoColor=white&label=&color=555" alt="Simple Icons stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://flagicons.lipis.dev">flag-icons</a></td>
      <td>Country flags on <code>/artists/all</code></td>
      <td><a href="https://github.com/lipis/flag-icons"><img src="https://img.shields.io/github/stars/lipis/flag-icons?style=flat&logo=github&logoColor=white&label=&color=555" alt="flag-icons stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/googlefonts" width="16" height="16"> <a href="https://fonts.google.com">Google Fonts</a></td>
      <td>Montserrat, Julius Sans One, Azeret Mono</td>
      <td><a href="https://github.com/nuxt-modules/google-fonts"><img src="https://img.shields.io/github/stars/nuxt-modules/google-fonts?style=flat&logo=github&logoColor=white&label=&color=555" alt="Google Fonts module stars"></a></td>
    </tr>
    <tr>
      <td rowspan="5"><strong>Data & Backend</strong></td>
      <td><img src="https://cdn.simpleicons.org/supabase" width="16" height="16"> <a href="https://supabase.com">Supabase</a></td>
      <td>Auth, likes, profile, avatars + catalog source</td>
      <td><a href="https://github.com/supabase/supabase"><img src="https://img.shields.io/github/stars/supabase/supabase?style=flat&logo=github&logoColor=white&label=&color=555" alt="Supabase stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/supabase" width="16" height="16"> <a href="https://supabase.com/docs/reference/javascript/introduction">supabase-js</a></td>
      <td>Anon + service-role clients</td>
      <td><a href="https://github.com/supabase/supabase-js"><img src="https://img.shields.io/github/stars/supabase/supabase-js?style=flat&logo=github&logoColor=white&label=&color=555" alt="supabase-js stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/supabase" width="16" height="16"> <a href="https://supabase.nuxtjs.org">@nuxtjs/supabase</a></td>
      <td>Auth module, <code>redirectOptions</code></td>
      <td><a href="https://github.com/nuxt-modules/supabase"><img src="https://img.shields.io/github/stars/nuxt-modules/supabase?style=flat&logo=github&logoColor=white&label=&color=555" alt="@nuxtjs/supabase stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/firebase" width="16" height="16"> <a href="https://firebase.google.com">Firebase</a></td>
      <td>Realtime DB, alternative catalog source</td>
      <td>-</td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/yaml" width="16" height="16"> <a href="https://eemeli.org/yaml">yaml</a></td>
      <td><code>sentimony-db.yml</code> - the catalog source of truth</td>
      <td><a href="https://github.com/eemeli/yaml"><img src="https://img.shields.io/github/stars/eemeli/yaml?style=flat&logo=github&logoColor=white&label=&color=555" alt="yaml stars"></a></td>
    </tr>
    <tr>
      <td rowspan="4"><strong>SEO & Hosting</strong></td>
      <td><img src="https://cdn.simpleicons.org/nuxt" width="16" height="16"> <a href="https://nuxtseo.com/sitemap">@nuxtjs/sitemap</a></td>
      <td>Sitemap from the local catalog export</td>
      <td><a href="https://github.com/nuxt-modules/sitemap"><img src="https://img.shields.io/github/stars/nuxt-modules/sitemap?style=flat&logo=github&logoColor=white&label=&color=555" alt="@nuxtjs/sitemap stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/nuxt" width="16" height="16"> <a href="https://nuxtseo.com/robots">@nuxtjs/robots</a></td>
      <td><code>noindex</code> on auth / profile routes</td>
      <td><a href="https://github.com/nuxt-modules/robots"><img src="https://img.shields.io/github/stars/nuxt-modules/robots?style=flat&logo=github&logoColor=white&label=&color=555" alt="@nuxtjs/robots stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/netlify" width="16" height="16"> <a href="https://netlify.com">Netlify</a></td>
      <td>SSR hosting, CDN cache, deploy contexts</td>
      <td>-</td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/deno" width="16" height="16"> <a href="https://deno.com">Deno</a></td>
      <td>Runtime for the Netlify edge functions</td>
      <td><a href="https://github.com/denoland/deno"><img src="https://img.shields.io/github/stars/denoland/deno?style=flat&logo=github&logoColor=white&label=&color=555" alt="Deno stars"></a></td>
    </tr>
    <tr>
      <td rowspan="4"><strong>Testing & Quality</strong></td>
      <td><img src="https://cdn.simpleicons.org/vitest" width="16" height="16"> <a href="https://vitest.dev">Vitest</a></td>
      <td>Unit tests</td>
      <td><a href="https://github.com/vitest-dev/vitest"><img src="https://img.shields.io/github/stars/vitest-dev/vitest?style=flat&logo=github&logoColor=white&label=&color=555" alt="Vitest stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://api.iconify.design/logos/playwright.svg" width="16" height="16"> <a href="https://playwright.dev">Playwright</a></td>
      <td>E2E tests + visual snapshots</td>
      <td><a href="https://github.com/microsoft/playwright"><img src="https://img.shields.io/github/stars/microsoft/playwright?style=flat&logo=github&logoColor=white&label=&color=555" alt="Playwright stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/typescript" width="16" height="16"> <a href="https://github.com/vuejs/language-tools">vue-tsc</a></td>
      <td>SFC typecheck (<code>npm run typecheck</code>)</td>
      <td><a href="https://github.com/vuejs/language-tools"><img src="https://img.shields.io/github/stars/vuejs/language-tools?style=flat&logo=github&logoColor=white&label=&color=555" alt="vue-tsc stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/typescript" width="16" height="16"> <a href="https://github.com/microsoft/typescript-go">TypeScript Native</a></td>
      <td>TS7 typecheck for the edge functions</td>
      <td><a href="https://github.com/microsoft/typescript-go"><img src="https://img.shields.io/github/stars/microsoft/typescript-go?style=flat&logo=github&logoColor=white&label=&color=555" alt="TypeScript Native stars"></a></td>
    </tr>
    <tr>
      <td rowspan="4"><strong>Agents & Tooling</strong></td>
      <td><img src="https://cdn.simpleicons.org/claude" width="16" height="16"> <a href="https://claude.com/product/claude-code">Claude Code</a></td>
      <td>AI agent in the terminal</td>
      <td><a href="https://github.com/anthropics/claude-code"><img src="https://img.shields.io/github/stars/anthropics/claude-code?style=flat&logo=github&logoColor=white&label=&color=555" alt="Claude Code stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://api.iconify.design/logos/openai-icon.svg" width="16" height="16"> <a href="https://developers.openai.com/codex">Codex</a></td>
      <td>AI agent in the terminal</td>
      <td><a href="https://github.com/openai/codex"><img src="https://img.shields.io/github/stars/openai/codex?style=flat&logo=github&logoColor=white&label=&color=555" alt="Codex stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/vercel-labs/skills">skills</a></td>
      <td>Skills installer for agents</td>
      <td><a href="https://github.com/vercel-labs/skills"><img src="https://img.shields.io/github/stars/vercel-labs/skills?style=flat&logo=github&logoColor=white&label=&color=555" alt="skills stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/sentimony/skills">skills</a></td>
      <td><a href="https://skills.sh/sentimony/skills"><img src="https://skills.sh/b/sentimony/skills" alt="skills.sh"></a> Agent skills collection</td>
      <td><a href="https://github.com/sentimony/skills"><img src="https://img.shields.io/github/stars/sentimony/skills?style=flat&logo=github&logoColor=white&label=&color=555" alt="skills stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/skillio">skillio</a></td>
      <td>Skills usage stats</td>
      <td><a href="https://github.com/ihororlovskyi/skillio"><img src="https://img.shields.io/github/stars/ihororlovskyi/skillio?style=flat&logo=github&logoColor=white&label=&color=555" alt="skillio stars"></a></td>
    </tr>
  </tbody>
</table>

### Run

```bash
npm i
npm run dev
```

Switch catalog source

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

[scripts/skills.sh](scripts/skills.sh)

### Links

* [sentimony.com](https://sentimony.com)
* [sentimony-nuxt.netlify.app](https://sentimony-nuxt.netlify.app)

### Monitoring

* [Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/functions/server)
* [Edge Functions Logs](https://app.netlify.com/projects/sentimony-nuxt/logs/edge-functions)
* [Requests Left](https://app.netlify.com/projects/sentimony-nuxt/configuration/functions#overview)

Have fun! ;)
