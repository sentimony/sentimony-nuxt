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
      <td><a href="https://www.npmjs.com/package/typescript"><img src="https://img.shields.io/npm/dt/typescript?style=flat&logo=npm&logoColor=white&label=&color=555" alt="typescript downloads"></a> Language</td>
      <td><a href="https://github.com/microsoft/TypeScript"><img src="https://img.shields.io/github/stars/microsoft/TypeScript?style=flat&logo=github&logoColor=white&label=&color=555" alt="TypeScript stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/nuxt" width="16" height="16"> <a href="https://nuxt.com">Nuxt</a></td>
      <td><a href="https://www.npmjs.com/package/nuxt"><img src="https://img.shields.io/npm/dt/nuxt?style=flat&logo=npm&logoColor=white&label=&color=555" alt="nuxt downloads"></a> SSR framework (v4), file-based routing</td>
      <td><a href="https://github.com/nuxt/nuxt"><img src="https://img.shields.io/github/stars/nuxt/nuxt?style=flat&logo=github&logoColor=white&label=&color=555" alt="Nuxt stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://api.iconify.design/unjs/nitro.svg" width="16" height="16"> <a href="https://nitro.build">Nitro</a></td>
      <td><a href="https://www.npmjs.com/package/nitropack"><img src="https://img.shields.io/npm/dt/nitropack?style=flat&logo=npm&logoColor=white&label=&color=555" alt="nitropack downloads"></a> Server engine, <code>server/api/**</code>, cached handlers</td>
      <td><a href="https://github.com/nitrojs/nitro"><img src="https://img.shields.io/github/stars/nitrojs/nitro?style=flat&logo=github&logoColor=white&label=&color=555" alt="Nitro stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/vite" width="16" height="16"> <a href="https://vitejs.dev">Vite</a></td>
      <td><a href="https://www.npmjs.com/package/vite"><img src="https://img.shields.io/npm/dt/vite?style=flat&logo=npm&logoColor=white&label=&color=555" alt="vite downloads"></a> Dev server + build</td>
      <td><a href="https://github.com/vitejs/vite"><img src="https://img.shields.io/github/stars/vitejs/vite?style=flat&logo=github&logoColor=white&label=&color=555" alt="Vite stars"></a></td>
    </tr>
    <tr>
      <td rowspan="7"><strong>Frontend</strong></td>
      <td><img src="https://cdn.simpleicons.org/vuedotjs" width="16" height="16"> <a href="https://vuejs.org">Vue</a></td>
      <td><a href="https://www.npmjs.com/package/vue"><img src="https://img.shields.io/npm/dt/vue?style=flat&logo=npm&logoColor=white&label=&color=555" alt="vue downloads"></a> UI framework, Composition API</td>
      <td><a href="https://github.com/vuejs/core"><img src="https://img.shields.io/github/stars/vuejs/core?style=flat&logo=github&logoColor=white&label=&color=555" alt="Vue stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/vuedotjs" width="16" height="16"> <a href="https://vueuse.org">VueUse</a></td>
      <td><a href="https://www.npmjs.com/package/@vueuse/core"><img src="https://img.shields.io/npm/dt/@vueuse/core?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@vueuse/core downloads"></a> <code>useStorage</code> (theme), UI primitives</td>
      <td><a href="https://github.com/vueuse/vueuse"><img src="https://img.shields.io/github/stars/vueuse/vueuse?style=flat&logo=github&logoColor=white&label=&color=555" alt="VueUse stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/vuedotjs" width="16" height="16"> <a href="https://vee-validate.logaretm.com">vee-validate</a></td>
      <td><a href="https://www.npmjs.com/package/vee-validate"><img src="https://img.shields.io/npm/dt/vee-validate?style=flat&logo=npm&logoColor=white&label=&color=555" alt="vee-validate downloads"></a> Auth form validation (function-based schemas)</td>
      <td><a href="https://github.com/logaretm/vee-validate"><img src="https://img.shields.io/github/stars/logaretm/vee-validate?style=flat&logo=github&logoColor=white&label=&color=555" alt="vee-validate stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/swiper" width="16" height="16"> <a href="https://swiperjs.com">Swiper</a></td>
      <td><a href="https://www.npmjs.com/package/swiper"><img src="https://img.shields.io/npm/dt/swiper?style=flat&logo=npm&logoColor=white&label=&color=555" alt="swiper downloads"></a> Release / artist carousels</td>
      <td><a href="https://github.com/nolimits4web/swiper"><img src="https://img.shields.io/github/stars/nolimits4web/swiper?style=flat&logo=github&logoColor=white&label=&color=555" alt="Swiper stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://vue-sonner.vercel.app">vue-sonner</a></td>
      <td><a href="https://www.npmjs.com/package/vue-sonner"><img src="https://img.shields.io/npm/dt/vue-sonner?style=flat&logo=npm&logoColor=white&label=&color=555" alt="vue-sonner downloads"></a> Toasts on failed likes</td>
      <td><a href="https://github.com/xiaoluoboding/vue-sonner"><img src="https://img.shields.io/github/stars/xiaoluoboding/vue-sonner?style=flat&logo=github&logoColor=white&label=&color=555" alt="vue-sonner stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://www.npmjs.com/package/v-wave">v-wave</a></td>
      <td><a href="https://www.npmjs.com/package/v-wave"><img src="https://img.shields.io/npm/dt/v-wave?style=flat&logo=npm&logoColor=white&label=&color=555" alt="v-wave downloads"></a> Ripple effect on buttons and links</td>
      <td><a href="https://github.com/justintaddei/v-wave"><img src="https://img.shields.io/github/stars/justintaddei/v-wave?style=flat&logo=github&logoColor=white&label=&color=555" alt="v-wave stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/cure53/DOMPurify">DOMPurify</a></td>
      <td><a href="https://www.npmjs.com/package/dompurify"><img src="https://img.shields.io/npm/dt/dompurify?style=flat&logo=npm&logoColor=white&label=&color=555" alt="dompurify downloads"></a> Sanitizing catalog HTML</td>
      <td><a href="https://github.com/cure53/DOMPurify"><img src="https://img.shields.io/github/stars/cure53/DOMPurify?style=flat&logo=github&logoColor=white&label=&color=555" alt="DOMPurify stars"></a></td>
    </tr>
    <tr>
      <td rowspan="6"><strong>UI</strong></td>
      <td><img src="https://cdn.simpleicons.org/tailwindcss" width="16" height="16"> <a href="https://tailwindcss.com">Tailwind CSS</a></td>
      <td><a href="https://www.npmjs.com/package/tailwindcss"><img src="https://img.shields.io/npm/dt/tailwindcss?style=flat&logo=npm&logoColor=white&label=&color=555" alt="tailwindcss downloads"></a> Styling, CSS-first config (v4, no <code>tailwind.config</code>)</td>
      <td><a href="https://github.com/tailwindlabs/tailwindcss"><img src="https://img.shields.io/github/stars/tailwindlabs/tailwindcss?style=flat&logo=github&logoColor=white&label=&color=555" alt="Tailwind CSS stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/jamiebuilds/tailwindcss-animate">tailwindcss-animate</a></td>
      <td><a href="https://www.npmjs.com/package/tailwindcss-animate"><img src="https://img.shields.io/npm/dt/tailwindcss-animate?style=flat&logo=npm&logoColor=white&label=&color=555" alt="tailwindcss-animate downloads"></a> Animation utilities</td>
      <td><a href="https://github.com/jamiebuilds/tailwindcss-animate"><img src="https://img.shields.io/github/stars/jamiebuilds/tailwindcss-animate?style=flat&logo=github&logoColor=white&label=&color=555" alt="tailwindcss-animate stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/rekaui" width="16" height="16"> <a href="https://reka-ui.com">Reka UI</a></td>
      <td><a href="https://www.npmjs.com/package/reka-ui"><img src="https://img.shields.io/npm/dt/reka-ui?style=flat&logo=npm&logoColor=white&label=&color=555" alt="reka-ui downloads"></a> Headless primitives behind the local UI kit</td>
      <td><a href="https://github.com/unovue/reka-ui"><img src="https://img.shields.io/github/stars/unovue/reka-ui?style=flat&logo=github&logoColor=white&label=&color=555" alt="Reka UI stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://cva.style">cva</a></td>
      <td><a href="https://www.npmjs.com/package/class-variance-authority"><img src="https://img.shields.io/npm/dt/class-variance-authority?style=flat&logo=npm&logoColor=white&label=&color=555" alt="class-variance-authority downloads"></a> Button variants (<code>buttonVariants</code>)</td>
      <td><a href="https://github.com/joe-bell/cva"><img src="https://img.shields.io/github/stars/joe-bell/cva?style=flat&logo=github&logoColor=white&label=&color=555" alt="cva stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/dcastil/tailwind-merge">tailwind-merge</a></td>
      <td><a href="https://www.npmjs.com/package/tailwind-merge"><img src="https://img.shields.io/npm/dt/tailwind-merge?style=flat&logo=npm&logoColor=white&label=&color=555" alt="tailwind-merge downloads"></a> Class conflict resolution in <code>cn()</code></td>
      <td><a href="https://github.com/dcastil/tailwind-merge"><img src="https://img.shields.io/github/stars/dcastil/tailwind-merge?style=flat&logo=github&logoColor=white&label=&color=555" alt="tailwind-merge stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/lukeed/clsx">clsx</a></td>
      <td><a href="https://www.npmjs.com/package/clsx"><img src="https://img.shields.io/npm/dt/clsx?style=flat&logo=npm&logoColor=white&label=&color=555" alt="clsx downloads"></a> Conditional classes in <code>cn()</code></td>
      <td><a href="https://github.com/lukeed/clsx"><img src="https://img.shields.io/github/stars/lukeed/clsx?style=flat&logo=github&logoColor=white&label=&color=555" alt="clsx stars"></a></td>
    </tr>
    <tr>
      <td rowspan="6"><strong>Icons & Fonts</strong></td>
      <td><img src="https://cdn.simpleicons.org/iconify" width="16" height="16"> <a href="https://icon-sets.iconify.design">Iconify</a></td>
      <td><a href="https://www.npmjs.com/package/@nuxt/icon"><img src="https://img.shields.io/npm/dt/@nuxt/icon?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@nuxt/icon downloads"></a> <code><Icon></code> via <code>@nuxt/icon</code></td>
      <td><a href="https://github.com/iconify/iconify"><img src="https://img.shields.io/github/stars/iconify/iconify?style=flat&logo=github&logoColor=white&label=&color=555" alt="Iconify stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/lucide" width="16" height="16"> <a href="https://lucide.dev">Lucide</a></td>
      <td><a href="https://www.npmjs.com/package/@iconify-json/lucide"><img src="https://img.shields.io/npm/dt/@iconify-json/lucide?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@iconify-json/lucide downloads"></a> UI icon set (24px, stroke-2)</td>
      <td><a href="https://github.com/lucide-icons/lucide"><img src="https://img.shields.io/github/stars/lucide-icons/lucide?style=flat&logo=github&logoColor=white&label=&color=555" alt="Lucide stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/lucide" width="16" height="16"> <a href="https://github.com/lucide-icons/lucide-lab">Lucide Lab</a></td>
      <td><a href="https://www.npmjs.com/package/@iconify-json/lucide-lab"><img src="https://img.shields.io/npm/dt/@iconify-json/lucide-lab?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@iconify-json/lucide-lab downloads"></a> Extra marks not in the core set</td>
      <td><a href="https://github.com/lucide-icons/lucide-lab"><img src="https://img.shields.io/github/stars/lucide-icons/lucide-lab?style=flat&logo=github&logoColor=white&label=&color=555" alt="Lucide Lab stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/simpleicons" width="16" height="16"> <a href="https://simpleicons.org">Simple Icons</a></td>
      <td><a href="https://www.npmjs.com/package/@iconify-json/simple-icons"><img src="https://img.shields.io/npm/dt/@iconify-json/simple-icons?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@iconify-json/simple-icons downloads"></a> Brand icons (<code>app/constants/icons.ts</code>)</td>
      <td><a href="https://github.com/simple-icons/simple-icons"><img src="https://img.shields.io/github/stars/simple-icons/simple-icons?style=flat&logo=github&logoColor=white&label=&color=555" alt="Simple Icons stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://flagicons.lipis.dev">flag-icons</a></td>
      <td><a href="https://www.npmjs.com/package/flag-icons"><img src="https://img.shields.io/npm/dt/flag-icons?style=flat&logo=npm&logoColor=white&label=&color=555" alt="flag-icons downloads"></a> Country flags on <code>/artists/all</code></td>
      <td><a href="https://github.com/lipis/flag-icons"><img src="https://img.shields.io/github/stars/lipis/flag-icons?style=flat&logo=github&logoColor=white&label=&color=555" alt="flag-icons stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/googlefonts" width="16" height="16"> <a href="https://fonts.google.com">Google Fonts</a></td>
      <td><a href="https://www.npmjs.com/package/@nuxtjs/google-fonts"><img src="https://img.shields.io/npm/dt/@nuxtjs/google-fonts?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@nuxtjs/google-fonts downloads"></a> Montserrat, Julius Sans One, Azeret Mono</td>
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
      <td><a href="https://www.npmjs.com/package/@supabase/supabase-js"><img src="https://img.shields.io/npm/dt/@supabase/supabase-js?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@supabase/supabase-js downloads"></a> Anon + service-role clients</td>
      <td><a href="https://github.com/supabase/supabase-js"><img src="https://img.shields.io/github/stars/supabase/supabase-js?style=flat&logo=github&logoColor=white&label=&color=555" alt="supabase-js stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/supabase" width="16" height="16"> <a href="https://supabase.nuxtjs.org">@nuxtjs/supabase</a></td>
      <td><a href="https://www.npmjs.com/package/@nuxtjs/supabase"><img src="https://img.shields.io/npm/dt/@nuxtjs/supabase?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@nuxtjs/supabase downloads"></a> Auth module, <code>redirectOptions</code></td>
      <td><a href="https://github.com/nuxt-modules/supabase"><img src="https://img.shields.io/github/stars/nuxt-modules/supabase?style=flat&logo=github&logoColor=white&label=&color=555" alt="@nuxtjs/supabase stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/firebase" width="16" height="16"> <a href="https://firebase.google.com">Firebase</a></td>
      <td>Realtime DB, alternative catalog source</td>
      <td>-</td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/yaml" width="16" height="16"> <a href="https://eemeli.org/yaml">yaml</a></td>
      <td><a href="https://www.npmjs.com/package/yaml"><img src="https://img.shields.io/npm/dt/yaml?style=flat&logo=npm&logoColor=white&label=&color=555" alt="yaml downloads"></a> <code>sentimony-db.yml</code> - the catalog source of truth</td>
      <td><a href="https://github.com/eemeli/yaml"><img src="https://img.shields.io/github/stars/eemeli/yaml?style=flat&logo=github&logoColor=white&label=&color=555" alt="yaml stars"></a></td>
    </tr>
    <tr>
      <td rowspan="4"><strong>SEO & Hosting</strong></td>
      <td><img src="https://cdn.simpleicons.org/nuxt" width="16" height="16"> <a href="https://nuxtseo.com/sitemap">@nuxtjs/sitemap</a></td>
      <td><a href="https://www.npmjs.com/package/@nuxtjs/sitemap"><img src="https://img.shields.io/npm/dt/@nuxtjs/sitemap?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@nuxtjs/sitemap downloads"></a> Sitemap from the local catalog export</td>
      <td><a href="https://github.com/nuxt-modules/sitemap"><img src="https://img.shields.io/github/stars/nuxt-modules/sitemap?style=flat&logo=github&logoColor=white&label=&color=555" alt="@nuxtjs/sitemap stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/nuxt" width="16" height="16"> <a href="https://nuxtseo.com/robots">@nuxtjs/robots</a></td>
      <td><a href="https://www.npmjs.com/package/@nuxtjs/robots"><img src="https://img.shields.io/npm/dt/@nuxtjs/robots?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@nuxtjs/robots downloads"></a> <code>noindex</code> on auth / profile routes</td>
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
      <td><a href="https://www.npmjs.com/package/vitest"><img src="https://img.shields.io/npm/dt/vitest?style=flat&logo=npm&logoColor=white&label=&color=555" alt="vitest downloads"></a> Unit tests</td>
      <td><a href="https://github.com/vitest-dev/vitest"><img src="https://img.shields.io/github/stars/vitest-dev/vitest?style=flat&logo=github&logoColor=white&label=&color=555" alt="Vitest stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://api.iconify.design/logos/playwright.svg" width="16" height="16"> <a href="https://playwright.dev">Playwright</a></td>
      <td><a href="https://www.npmjs.com/package/@playwright/test"><img src="https://img.shields.io/npm/dt/@playwright/test?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@playwright/test downloads"></a> E2E tests + visual snapshots</td>
      <td><a href="https://github.com/microsoft/playwright"><img src="https://img.shields.io/github/stars/microsoft/playwright?style=flat&logo=github&logoColor=white&label=&color=555" alt="Playwright stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/typescript" width="16" height="16"> <a href="https://github.com/vuejs/language-tools">vue-tsc</a></td>
      <td><a href="https://www.npmjs.com/package/vue-tsc"><img src="https://img.shields.io/npm/dt/vue-tsc?style=flat&logo=npm&logoColor=white&label=&color=555" alt="vue-tsc downloads"></a> SFC typecheck (<code>npm run typecheck</code>)</td>
      <td><a href="https://github.com/vuejs/language-tools"><img src="https://img.shields.io/github/stars/vuejs/language-tools?style=flat&logo=github&logoColor=white&label=&color=555" alt="vue-tsc stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://cdn.simpleicons.org/typescript" width="16" height="16"> <a href="https://github.com/microsoft/typescript-go">TypeScript Native</a></td>
      <td>TS7 typecheck for the edge functions</td>
      <td><a href="https://github.com/microsoft/typescript-go"><img src="https://img.shields.io/github/stars/microsoft/typescript-go?style=flat&logo=github&logoColor=white&label=&color=555" alt="TypeScript Native stars"></a></td>
    </tr>
    <tr>
      <td rowspan="2"><strong>Agents</strong></td>
      <td><img src="https://cdn.simpleicons.org/claude" width="16" height="16"> <a href="https://claude.com/product/claude-code">Claude Code</a></td>
      <td><a href="https://www.npmjs.com/package/@anthropic-ai/claude-code"><img src="https://img.shields.io/npm/dt/@anthropic-ai/claude-code?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@anthropic-ai/claude-code downloads"></a> AI agent in the terminal</td>
      <td><a href="https://github.com/anthropics/claude-code"><img src="https://img.shields.io/github/stars/anthropics/claude-code?style=flat&logo=github&logoColor=white&label=&color=555" alt="Claude Code stars"></a></td>
    </tr>
    <tr>
      <td><img src="https://api.iconify.design/logos/openai-icon.svg" width="16" height="16"> <a href="https://developers.openai.com/codex">Codex</a></td>
      <td><a href="https://www.npmjs.com/package/@openai/codex"><img src="https://img.shields.io/npm/dt/@openai/codex?style=flat&logo=npm&logoColor=white&label=&color=555" alt="@openai/codex downloads"></a> AI agent in the terminal</td>
      <td><a href="https://github.com/openai/codex"><img src="https://img.shields.io/github/stars/openai/codex?style=flat&logo=github&logoColor=white&label=&color=555" alt="Codex stars"></a></td>
    </tr>
    <tr>
      <td rowspan="7"><strong>Skills</strong></td>
      <td><img src="https://cdn.simpleicons.org/vercel" width="16" height="16"> <a href="https://github.com/vercel-labs/agent-skills">vercel-labs/agent-skills</a></td>
      <td><a href="https://www.npmjs.com/package/skills"><img src="https://img.shields.io/npm/dt/skills?style=flat&logo=npm&logoColor=white&label=&color=555" alt="skills downloads"></a> Skills installer for agents</td>
      <td><a href="https://github.com/vercel-labs/agent-skills"><img src="https://img.shields.io/github/stars/vercel-labs/agent-skills?style=flat&logo=github&logoColor=white&label=&color=555" alt="agent-skills stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/obra/superpowers">obra/superpowers</a></td>
      <td><a href="https://skills.sh/obra/superpowers"><img src="https://skills.sh/b/obra/superpowers" alt="skills.sh"></a> Agentic skills framework</td>
      <td><a href="https://github.com/obra/superpowers"><img src="https://img.shields.io/github/stars/obra/superpowers?style=flat&logo=github&logoColor=white&label=&color=555" alt="superpowers stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/mattpocock/skills">mattpocock/skills</a></td>
      <td><a href="https://skills.sh/mattpocock/skills"><img src="https://skills.sh/b/mattpocock/skills" alt="skills.sh"></a> Skills for real engineers</td>
      <td><a href="https://github.com/mattpocock/skills"><img src="https://img.shields.io/github/stars/mattpocock/skills?style=flat&logo=github&logoColor=white&label=&color=555" alt="mattpocock/skills stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/anthropics/skills">anthropics/skills</a></td>
      <td><a href="https://skills.sh/anthropics/skills"><img src="https://skills.sh/b/anthropics/skills" alt="skills.sh"></a> Official Anthropic skills</td>
      <td><a href="https://github.com/anthropics/skills"><img src="https://img.shields.io/github/stars/anthropics/skills?style=flat&logo=github&logoColor=white&label=&color=555" alt="anthropics/skills stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/anthropics/claude-plugins-official">anthropics/claude-plugins-official</a></td>
      <td><a href="https://skills.sh/anthropics/claude-plugins-official"><img src="https://skills.sh/b/anthropics/claude-plugins-official" alt="skills.sh"></a> Official Claude Code plugin directory</td>
      <td><a href="https://github.com/anthropics/claude-plugins-official"><img src="https://img.shields.io/github/stars/anthropics/claude-plugins-official?style=flat&logo=github&logoColor=white&label=&color=555" alt="claude-plugins-official stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/sentimony/skills">sentimony/skills</a></td>
      <td><a href="https://skills.sh/sentimony/skills"><img src="https://skills.sh/b/sentimony/skills" alt="skills.sh"></a> Agent skills collection</td>
      <td><a href="https://github.com/sentimony/skills"><img src="https://img.shields.io/github/stars/sentimony/skills?style=flat&logo=github&logoColor=white&label=&color=555" alt="skills stars"></a></td>
    </tr>
    <tr>
      <td><a href="https://github.com/ihororlovskyi/skillio">ihororlovskyi/skillio</a></td>
      <td><a href="https://www.npmjs.com/package/skillio"><img src="https://img.shields.io/npm/dt/skillio?style=flat&logo=npm&logoColor=white&label=&color=555" alt="skillio downloads"></a> Skills usage stats</td>
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
