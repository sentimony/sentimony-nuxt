module.exports = {
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Julius+Sans+One' },
      { rel: 'shortcut icon', href: 'https://content.sentimony.com/assets/img/favicons/sentimony/favicon-32.png' },
      { rel: 'apple-touch-icon', href: 'https://content.sentimony.com/assets/img/favicons/sentimony/favicon-144.png' }
    ]
  },
  loading: {
    color: '#fff',
    height: '5px'
  },
  plugins: [
    '~/plugins/google-analytics.js',
    { src: '~/plugins/swiper.js', ssr: false },
    '~/plugins/vue-tabs.js'
  ],
  css: [
    'normalize.css/normalize.css',
    'swiper/dist/css/swiper.css',
    // 'vue-nav-tabs/dist/vue-tabs.min.css'
  ],
  build: {
    vendor: ['axios']
  },
  generate: {
    routes: [
      '/release/va-fantazma',
      '/release/va-emptinesses',
      '/release/sphingida-origin',
      '/release/va-true-story',
      '/release/spectrum-vision-lost-space-device',
      '/release/irukanji-z-lisu',
      '/release/va-ocean-scenes-higher-titans',
      '/release/senzar-before-the-morning-sun',
      '/release/va-grower',
      '/release/va-time-loop-beyond-borders',
      '/release/unusual-cosmic-process-weightlessness',
      '/release/va-tempo-syndicate',
      '/release/va-dancing-mavka',
      '/release/va-absence-of-gravity',
      '/release/va-special-places',
      '/release/hypnotriod-seven-heavenly-edges',
      '/release/specialmind-the-missing-particle',
      '/release/tentura-aurora',
      '/release/cifroteca-roof-raiser-wild-storm',
      '/release/psyfactor-retro-scientific',
      '/release/va-gamayun-tale',
      '/release/tentura-beyond-illusion',
      '/release/ufomatka-the-ep',
      '/release/va-the-ten',
      '/release/zymosis-insight',
      '/release/overdream-beautiful-thinking',
      '/release/ufomatka-altering-the-synaptic-controllers',
      '/release/zymosis-eve',

      '/artist/alexander-daf',
      '/artist/already-maged',
      '/artist/astropilot',
      '/artist/calamus',
      '/artist/capsula',
      '/artist/chronos',
      '/artist/cifroteca',
      '/artist/crystal-vibe',
      '/artist/dagas',
      '/artist/daoine-sidhe',
      '/artist/eguana',
      '/artist/flooting-grooves',
      '/artist/harax',
      '/artist/heinali',
      '/artist/hypnotriod',
      '/artist/irukanji',
      '/artist/katya-chilly',
      '/artist/magmadivers',
      '/artist/neirula',
      '/artist/overdream',
      '/artist/psyfactor',
      '/artist/roof-raiser',
      '/artist/saikozaurus',
      '/artist/senzar',
      '/artist/shiva3',
      '/artist/shivattva',
      '/artist/shizolizer-gin',
      '/artist/sky-technology',
      '/artist/solcast',
      '/artist/specialmind',
      '/artist/spectrum-vision',
      '/artist/sphingida',
      '/artist/sygnals',
      '/artist/tentura',
      '/artist/tookytooky',
      '/artist/ufomatka',
      '/artist/unstable-elements',
      '/artist/unusual-cosmic-process',
      '/artist/vonoom',
      '/artist/zymosis',
      '/artist/psydewise',
      '/artist/erot',

      '/event/shift-space',
      '/event/alt-space',
      '/event/water-marks',
      '/event/home-space',
      '/event/five-years',

      '/friend/another-dimension',
      '/friend/clocktail',
      '/friend/moon-koradji',
      '/friend/parvati',
      '/friend/space-baby',
      '/friend/treetrolla',
      '/friend/zenon'
    ]
  }
}
