// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
    // timeline: {
    //   enabled: true,
    // },
  },
  // debug: true,
  site: {
    url: 'https://sentimony.com',
    name: 'Sentimony Records',
  },
  app: {
    head: {
      titleTemplate: '%s · Sentimony Records',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
  css: [
    '~/assets/css/tailwind.css',
  ],
  // vite: {
  //   optimizeDeps: {
  //     include: [
  //       '@vue/devtools-core',
  //       '@vue/devtools-kit',
  //       'swiper/vue',
  //       'swiper/modules',
  //     ]
  //   },
  //   // опційно: менше логів
  //   // logLevel: 'warn'
  // },
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
  ssr: true,
  routeRules: {
    // Cache API responses on Netlify CDN for 1h, allow SWR for 24h
    '/api/**': {
      headers: {
        'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    },
    // Incremental Static Regeneration for common pages to reduce SSR load
    '/': { isr: 86400 },
    '/news': { isr: 86400 },
    '/releases': { isr: 86400 },
    '/release/**': { isr: 86400 },
    '/artists': { isr: 86400 },
    '/artist/**': { isr: 86400 },
    '/videos': { isr: 86400 },
    '/video/**': { isr: 86400 },
    '/playlists': { isr: 86400 },
    '/playlist/**': { isr: 86400 },
    '/events': { isr: 86400 },
    '/event/**': { isr: 86400 },
    '/friends': { isr: 86400 },
    '/friend/**': { isr: 86400 },
    '/tracks': { isr: 86400 },
    '/contacts': { isr: 86400 },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'v-wave/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
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
    // duration: 3,
    // color: 'radial-gradient(closest-side, #fff, #1cb884)',
    // initialOpacity: 0.7,
    // finalOpacity: 0.3,
    easing: 'cubic-bezier(0,.57,.89,0)'
  },
  sitemap: {
    enabled: !process.env.URL?.includes('stage') && process.env.CONTEXT !== 'deploy-preview',
    autoLastmod: true,
    discoverImages: false,
    discoverVideos: false,
  },
})
