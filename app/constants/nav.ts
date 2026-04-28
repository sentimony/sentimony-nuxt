export type NavItem = {
  title: string
  route: string
  inHeader?: boolean
}

export const NAV: NavItem[] = [
  { title: 'Home', route: '/' },
  { title: 'News', route: '/news' },
  { title: 'Releases', route: '/releases', inHeader: true },
  { title: 'Artists', route: '/artists', inHeader: true },
  { title: 'Videos', route: '/videos', inHeader: true },
  { title: 'Playlists', route: '/playlists', inHeader: true },
  { title: 'Events', route: '/events' },
  { title: 'Contacts', route: '/contacts' },
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
}

export function isNavActive(currentPath: string, link: string, matchers: Record<string, string[]> = ACTIVE_MATCHERS): boolean {
  if (link === '/') return currentPath === '/'
  const m = matchers[link] || [link]
  return m.some((p) => currentPath.startsWith(p))
}
