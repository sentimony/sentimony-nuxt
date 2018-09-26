module.exports = {
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Psychedelic Music Label' }
    ],
    link: [
      { rel: 'shortcut icon', href: 'https://content.sentimony.com/assets/img/favicons/sentimony/favicon-32.png' },
      { rel: 'apple-touch-icon', href: 'https://content.sentimony.com/assets/img/favicons/sentimony/favicon-144.png' },
      // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat' },
      // { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Julius+Sans+One' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' },
      { rel: 'stylesheet', href: 'https://cdn.materialdesignicons.com/2.8.94/css/materialdesignicons.min.css' }
    ]
  },
  loading: {
    color: 'rgba(0,0,0,0.5)',
    height: '5px'
  },
  // mode: 'spa',
  plugins: [
    { src: '~plugins/google-analytics.js', ssr: false },
    '~/plugins/vuetify.js',
    '~/plugins/fireauth.js'
  ],
  css: [
    { src: '~/assets/css/main.css', lang: 'css'},
    { src: '~/assets/css/app.styl', lang: 'styl'}
  ],
  router: {
    middleware: 'router-auth'
  },
  vendor: [
    'firebase',
    'vuetify'
  ],
  build: {
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        // config.module.rules.push({
        //   enforce: 'pre',
        //   test: /\.(js|vue)$/,
        //   loader: 'eslint-loader',
        //   exclude: /(node_modules)/
        // })
      }
    },
    extractCSS: true,
    analyze: {
      analyzerMode: 'static'
    }
  },
  generate: {
    routes: [
      // '/release/va-fantazma',
      // '/release/va-emptinesses',
      // '/release/sphingida-origin',
      // '/release/va-true-story',
      // '/release/spectrum-vision-lost-space-device',
      // '/release/irukanji-z-lisu',
      // '/release/va-ocean-scenes-higher-titans',
      // '/release/senzar-before-the-morning-sun',
      // '/release/va-grower',
      // '/release/va-time-loop-beyond-borders',
      // '/release/unusual-cosmic-process-weightlessness',
      // '/release/va-tempo-syndicate',
      // '/release/va-dancing-mavka',
      // '/release/va-absence-of-gravity',
      // '/release/va-special-places',
      // '/release/hypnotriod-seven-heavenly-edges',
      // '/release/specialmind-the-missing-particle',
      // '/release/tentura-aurora',
      // '/release/cifroteca-roof-raiser-wild-storm',
      // '/release/psyfactor-retro-scientific',
      // '/release/va-gamayun-tale',
      // '/release/tentura-beyond-illusion',
      // '/release/ufomatka-the-ep',
      // '/release/va-the-ten',
      // '/release/zymosis-insight',
      // '/release/overdream-beautiful-thinking',
      // '/release/ufomatka-altering-the-synaptic-controllers',
      // '/release/omnisound-destiny',
      // '/release/zymosis-nichna',
      // '/release/va-futured-vol-1',
      //
      // '/artist/alexander-daf',
      // '/artist/already-maged',
      // '/artist/astropilot',
      // '/artist/calamus',
      // '/artist/capsula',
      // '/artist/chronos',
      // '/artist/cifroteca',
      // '/artist/crystal-vibe',
      // '/artist/dagas',
      // '/artist/daoine-sidhe',
      // '/artist/eguana',
      // '/artist/flooting-grooves',
      // '/artist/harax',
      // '/artist/heinali',
      // '/artist/hypnotriod',
      // '/artist/irukanji',
      // '/artist/katya-chilly',
      // '/artist/magmadivers',
      // '/artist/neirula',
      // '/artist/overdream',
      // '/artist/psyfactor',
      // '/artist/roof-raiser',
      // '/artist/saikozaurus',
      // '/artist/senzar',
      // '/artist/shiva3',
      // '/artist/shivattva',
      // '/artist/shizolizer-gin',
      // '/artist/sky-technology',
      // '/artist/solcast',
      // '/artist/specialmind',
      // '/artist/spectrum-vision',
      // '/artist/sphingida',
      // '/artist/sygnals',
      // '/artist/tentura',
      // '/artist/tookytooky',
      // '/artist/ufomatka',
      // '/artist/unstable-elements',
      // '/artist/unusual-cosmic-process',
      // '/artist/vonoom',
      // '/artist/zymosis',
      // '/artist/psydewise',
      // '/artist/kabi',
      // '/artist/erot',
      //
      // '/event/shift-space',
      // '/event/alt-space',
      // '/event/water-marks',
      // '/event/home-space',
      // '/event/five-years',
      //
      // '/friend/another-dimension',
      // '/friend/clocktail',
      // '/friend/moon-koradji',
      // '/friend/parvati',
      // '/friend/space-baby',
      // '/friend/treetrolla',
      // '/friend/zenon'
    ]
  }
}
