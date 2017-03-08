releases = [
  { key: 'va-fantazma' },
  { key: 'va-emtinesses' },
  { key: 'sphingida-origin' },
  { key: 'va-true-story' },
  { key: 'zymosis-insight' }
]

module.exports = {
  head: {
    titleTemplate: '%s | Sentimony Records',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-nuxt.appspot.com/o/og-images%2Fhome.jpg?alt=media&token=bda45849-0d2c-4e98-8978-097e15443a48' }
    ],
    link: [
      { rel: 'shortcut icon', href: 'https://firebasestorage.googleapis.com/v0/b/sentimony-nuxt.appspot.com/o/favicons%2Ffavicon-32.png?alt=media&token=717dd3ad-b082-4abd-ad56-42dd501deec0' },
      { rel: 'apple-touch-icon', href: 'https://firebasestorage.googleapis.com/v0/b/sentimony-nuxt.appspot.com/o/favicons%2Ffavicon-144.png?alt=media&token=d5fd00a3-aab1-4fe5-9c50-37bc19ba004f' }
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
