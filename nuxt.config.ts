// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: [
    // '~/assets/css/tailwind.css',
    '~/assets/scss/base.scss',
  ],
  app: {
    head: {
      titleTemplate: '%s | Sentimony Records',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital@0;1&display=swap' },
        // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Julius+Sans+One&display=swap' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'alternate icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
      ]
    }
  },
  devtools: { 
    enabled: true,
    // timeline: {
    //   enabled: true
    // }
  },
  // debug: true,
  modules: [
    '@nuxtjs/tailwindcss', 
    '@nuxtjs/google-fonts', 
    '@nuxt/icon', 
    '@nuxt/image', 
    '@pinia/nuxt',
  ],
  googleFonts: {
    families: {
      'Montserrat': true,
      'Julius Sans One': true
    },
    display: 'swap'
  },
  // image: {
  //   domains: ['https://content.sentimony.com']
  // }
})
