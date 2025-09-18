// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  runtimeConfig: {
    // envName: process.env.NUXT_PUBLIC_ENV || 'prod',  // 'local' | 'stage' | 'prod' ...
    public: {
      // Base URL for Firebase Realtime DB
      firebaseBase: 'https://sentimony-db.firebaseio.com',
    },
  },
  nitro: {
    // Enable Netlify adapter (SSR via serverless function)
    preset: 'netlify',
  },
  // Route-level optimizations for Netlify Functions/CDN
  routeRules: {
    // Cache API responses on Netlify CDN for 1h, allow SWR for 24h
    '/api/**': {
      headers: {
        'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    },
    // Incremental Static Regeneration for common pages to reduce SSR load
    '/': { isr: 300 },
    '/releases': { isr: 300 },
    '/release/**': { isr: 300 },
    '/artists': { isr: 300 },
    '/artist/**': { isr: 300 },
    '/videos': { isr: 300 },
    '/video/**': { isr: 300 },
    '/playlists': { isr: 300 },
    '/playlist/**': { isr: 300 },
    '/events': { isr: 300 },
    '/event/**': { isr: 300 },
    '/friends': { isr: 300 },
    '/friend/**': { isr: 300 },
    '/news': { isr: 300 },
    '/tracks': { isr: 300 },
    '/contacts': { isr: 300 },
  },
  css: [
    // '~/assets/css/tailwind.css',
    // '~/assets/scss/base.scss',
  ],
  app: {
    head: {
      titleTemplate: '%s · Sentimony Records',
      // htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'apple-mobile-web-app-title', content: 'Sentimony Records' },
      ],
      link: [
        // { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
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
      'Montserrat': {
        wght: [400],
      },
      'Julius Sans One': {
        wght: [400],
      },
    },
    display: 'swap',
    subsets: 'latin',
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
