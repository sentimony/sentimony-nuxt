export type NavItem = {
  title: string
  route: string
  icon: string
  inHeader?: boolean
}

export const NAV: NavItem[] = [
  { title: 'Home', route: '/', icon: 'lucide:house' },
  { title: 'News', route: '/news', icon: 'lucide:newspaper' },
  { title: 'Releases', route: '/releases', icon: 'lucide:disc-3', inHeader: true },
  { title: 'Artists', route: '/artists', icon: 'lucide:keyboard-music', inHeader: true },
  { title: 'Videos', route: '/videos', icon: 'lucide:monitor-play', inHeader: true },
  { title: 'Playlists', route: '/playlists', icon: 'lucide:list-music', inHeader: true },
  { title: 'Events', route: '/events', icon: 'lucide:tent-tree' },
  { title: 'Contacts', route: '/contacts', icon: 'lucide:mail' },
]

export function getNav(): NavItem[] {
  return NAV
}

export function getHeaderNav(): NavItem[] {
  return NAV.filter(i => i?.inHeader)
}

export const ACTIVE_MATCHERS: Record<string, string[]> = {
  '/releases': ['/releases', '/release/'],
  '/artists': ['/artists', '/artist/'],
  '/videos': ['/videos', '/video/'],
  '/playlists': ['/playlists', '/playlist/'],
  '/events': ['/events', '/event/'],
  '/signin': ['/signin', '/signup', '/forgot-password', '/reset-password'],
}

export function isNavActive(currentPath: string, link: string, matchers: Record<string, string[]> = ACTIVE_MATCHERS): boolean {
  if (link === '/') return currentPath === '/'
  const m = matchers[link] || [link]
  return m.some((p) => currentPath.startsWith(p))
}
