// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  nitro: {
    // Enable Netlify adapter (SSR via serverless function)
    preset: 'netlify',
  },
  css: [
    // '~/assets/css/tailwind.css',
    // '~/assets/scss/base.scss',
  ],
  app: {
    head: {
      titleTemplate: '%s | Sentimony Records',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital@0;1&display=swap' },
        // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Julius+Sans+One&display=swap' },
        { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { name: 'apple-mobile-web-app-title', content: 'Sentimony Records' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
      ]
    }
  },
  devtools: {
    enabled: true,
    // timeline: {
    //   enabled: true,
    // },
  },
  // debug: true,
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'v-wave/nuxt',
  ],
  googleFonts: {
    families: {
      'Montserrat': true,
      'Julius Sans One': true
    },
    display: 'swap',
    prefetch: true,
    preconnect: true,
    preload: true,
    useStylesheet: true,
  },
  // image: {
  //   domains: ['https://content.sentimony.com']
  // },
  vWave: {
    // duration: 0.4,
    // dissolveDuration: 0.15,
    easing: 'ease-out',
  },
})
