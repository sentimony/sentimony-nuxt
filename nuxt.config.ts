import tailwindcss from '@tailwindcss/vite'
import { buildApiRouteRules } from './server/utils/cachePolicy'
import { buildNoindexRouteRules } from './server/utils/robotsPolicy'

const isDev = process.env.NODE_ENV === 'development'
const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_KEY || ''
const supabaseSecretKey = process.env.NUXT_SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY || ''
const CATALOG_SOURCE: 'firebase' | 'supabase' = 'supabase'
const catalogSource = process.env.NUXT_CATALOG_SOURCE || process.env.CATALOG_SOURCE || CATALOG_SOURCE

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
      script: [
        {
          innerHTML: `(()=>{try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){document.documentElement.classList.add('dark')}})()`,
          tagPosition: 'head',
        },
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Sentimony Records',
            description: 'Psychedelic music label',
            url: 'https://sentimony.com',
          }),
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'author', content: 'Sentimony Records · Psychedelic music label' },
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
    'flag-icons/css/flag-icons.min.css',
  ],
  components: [
    { path: '~/components/ui', pathPrefix: false, extensions: ['vue'] },
    '~/components',
  ],
  runtimeConfig: {
    catalogSource,
    supabaseSecretKey,
    supabaseUrl,
    firebaseDbSecret: process.env.NUXT_FIREBASE_DB_SECRET || process.env.FIREBASE_DB_SECRET || '',
    public: {
      firebaseBase: 'https://sentimony-db.firebaseio.com',
      supabaseUrl,
      supabaseKey,
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
    ...buildApiRouteRules(),
    ...buildNoindexRouteRules(),
  },
  supabase: {
    url: supabaseUrl,
    key: supabaseKey,
    redirectOptions: {
      login: '/signin',
      callback: '/confirm',
      exclude: ['/*'],
    },
  },
  modules: [
    '@nuxtjs/supabase',
    'reka-ui/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'v-wave/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
  ],
  icon: {
    provider: 'none',
    serverBundle: false,
    customCollections: [
      { prefix: 'sentimony', dir: './app/assets/icons' },
    ],
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
      icons: [
        'lucide:house',
        'lucide:newspaper',
        'lucide:disc-3',
        'lucide:keyboard-music',
        'lucide:monitor-play',
        'lucide:list-music',
        'lucide:tent-tree',
        'lucide:mail',
        'simple-icons:applemusic',
        'simple-icons:bandcamp',
        'simple-icons:beatport',
        'simple-icons:deezer',
        'simple-icons:discogs',
        'simple-icons:facebook',
        'simple-icons:giphy',
        'simple-icons:instagram',
        'simple-icons:linkedin',
        'simple-icons:mixcloud',
        'simple-icons:patreon',
        'simple-icons:soundcloud',
        'simple-icons:spotify',
        'simple-icons:tiktok',
        'simple-icons:tumblr',
        'simple-icons:twitter',
        'simple-icons:vk',
        'simple-icons:x',
        'simple-icons:youtube',
        'simple-icons:youtubemusic',
      ],
    },
  },
  googleFonts: {
    families: {
      'Montserrat': {
        wght: [400],
      },
      'Julius Sans One': {
        wght: [400],
      },
      'Azeret Mono': {
        wght: [400],
      },
    },
    display: 'swap',
    subsets: 'latin',
    download: true,
    preload: true,
  },
  vWave: {
    easing: 'cubic-bezier(0,.57,.89,0)'
  },
  image: {
    provider: isDev ? 'ipx' : 'netlify',
    domains: ['content.sentimony.com'],
  },
  sitemap: {
    enabled: !process.env.URL?.includes('stage') && process.env.CONTEXT !== 'deploy-preview',
    autoLastmod: true,
    discoverImages: false,
    discoverVideos: false,
    sources: ['/api/__sitemap__/urls'],
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
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
        '@vueuse/core',
        'clsx',
        'tailwind-merge',
        'vue-sonner',
      ]
    }
  },
})
