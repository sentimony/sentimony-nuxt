const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
  },
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
        { name: 'theme-color', content: '#111111' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Sentimony Records' },
      ],
      link: [
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
  runtimeConfig: {
    supabaseSecretKey: process.env.NUXT_SUPABASE_SECRET_KEY || '',
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
    public: {
      firebaseBase: 'https://sentimony-db.firebaseio.com',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || '',
    },
  },
  experimental: {
    serverAppConfig: false,
  },
  nitro: {
    preset: 'netlify',
  },
  ssr: true,
  routeRules: {
    '/api/**': {
      headers: {
        'Netlify-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    },
    ...(!isDev && {
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
    }),
  },
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*'],
    },
  },
  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'v-wave/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
  ],
  image: {
    provider: 'netlifyImageCdn',
    domains: ['content.sentimony.com'],
    netlifyImageCdn: { baseURL: '/.netlify/images' },
  },
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
  vWave: {
    easing: 'cubic-bezier(0,.57,.89,0)'
  },
  sitemap: {
    enabled: !process.env.URL?.includes('stage') && process.env.CONTEXT !== 'deploy-preview',
    autoLastmod: true,
    discoverImages: false,
    discoverVideos: false,
  },
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.plugin === 'nuxt:module-preload-polyfill') return
          warn(warning)
        },
      },
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'swiper/vue',
        'swiper/modules',
        '@supabase/ssr',
      ]
    }
  },
})
