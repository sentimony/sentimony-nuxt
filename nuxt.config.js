releases = [
  { key: 'va-fantazma' },
  { key: 'va-emptinesses' },
  { key: 'sphingida-origin' },
  { key: 'va-true-story' },
  { key: 'spectrum-vision-lost-space-device' },
  { key: 'irukanji-z-lisu' },
  { key: 'va-ocean-scenes-higher-titans' },
  { key: 'senzar-before-the-morning-sun' },
  { key: 'va-grower' },
  { key: 'va-time-loop-beyond-borders' },
  { key: 'unusual-cosmic-process-weightlessness' },
  { key: 'va-tempo-syndicate' },
  { key: 'va-dancing-mavka' },
  { key: 'va-absence-of-gravity' },
  { key: 'va-special-places' },
  { key: 'hypnotriod-seven-heavenly-edges' },
  { key: 'specialmind-the-missing-particle' },
  { key: 'tentura-aurora' },
  { key: 'cifroteca-roof-raiser-wild-storm' },
  { key: 'psyfactor-retro-scientific' },
  { key: 'va-gamayun-tale' },
  { key: 'tentura-beyond-illusion' },
  { key: 'ufomatka-the-ep' },
  { key: 'va-the-ten' },
  { key: 'zymosis-insight' }
]

module.exports = {
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { property: 'og:image', content: 'https://sentimony-content.netlify.com/assets/img/og-images/sentimony/home.jpg' }
    ],
    link: [
      { rel: 'shortcut icon', href: 'https://sentimony-content.netlify.com/assets/img/favicons/sentimony/favicon-32.png' },
      { rel: 'apple-touch-icon', href: 'https://sentimony-content.netlify.com/assets/img/favicons/sentimony/favicon-144.png' }
    ]
  },
  loading: {
    color: '#666',
    height: '4px'
  },
  plugins: [
    '~plugins/google-analytics.js'
  ],
  build: {
    vendor: ['axios']
  },
  generate: {
    routeParams: {
      '/release/:key': releases
    }
  }
}
