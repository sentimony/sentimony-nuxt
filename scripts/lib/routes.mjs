// Route inventory shared by web-debug and the performance baseline collector,
// so both tools measure exactly the same set of page kinds.

export const staticRoutes = [
  '/',
  '/releases',
  '/releases/psytrance',
  '/releases/psychill',
  '/artists',
  '/artists/all',
  '/videos',
  '/events',
  '/playlists',
  '/friends',
  '/tracks',
  '/news',
  '/contacts',
  '/signin',
]

export const dynamicRoutes = [
  { api: '/api/releases', path: slug => `/release/${slug}` },
  { api: '/api/artists', path: slug => `/artist/${slug}` },
  { api: '/api/videos', path: slug => `/video/${slug}` },
  { api: '/api/events', path: slug => `/event/${slug}` },
  { api: '/api/playlists', path: slug => `/playlist/${slug}` },
  { api: '/api/friends', path: slug => `/friend/${slug}` },
]

export const assetTargets = [
  {
    label: 'image thumb',
    url: 'https://content.sentimony.com/assets/img/artists/irukanji-02_th.jpg',
  },
  {
    label: 'image full',
    url: 'https://content.sentimony.com/assets/img/artists/irukanji-02_xl.jpg',
  },
  {
    label: 'audio track',
    url: 'https://pub-38745cb64da2489d8cc71777425fd24b.r2.dev/space-organ-occult-melodies.mp3',
  },
]
