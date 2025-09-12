// Typed helpers for navigation entries sourced from app/app.config.ts
// Use these to keep type-safety and consistent filtering logic.

export type NavItem = {
  title: string
  route: string
  inHeader?: boolean
}

export const NAV: NavItem[] = [
  { title: 'Home', route: '/' },
  // { title: 'News', route: '/news/' },
  { title: 'Releases', route: '/releases/', inHeader: true },
  { title: 'Artists', route: '/artists/', inHeader: true },
  { title: 'Videos', route: '/videos/', inHeader: true },
  { title: 'Playlists', route: '/playlists/', inHeader: true },
  // { title: 'Events', route: '/events/' },
  { title: 'Contacts', route: '/contacts/' },
  // { title: 'Friends', route: '/friends/' },
  // { title: 'Tracks', route: '/tracks/' },
  // { title: 'Sitemap', route: '/sitemap/' },
  // { title: 'ddos', route: '/ddos/' },
]

export function getNav(): NavItem[] {
  return NAV
}

export function getHeaderNav(): NavItem[] {
  return NAV.filter(i => i?.inHeader)
}

// Active route matchers used by header/footer/sidebar to highlight current section
export const ACTIVE_MATCHERS: Record<string, string[]> = {
  '/releases/': ['/releases/', '/release/'],
  '/artists/': ['/artists/', '/artist/'],
  '/videos/': ['/videos/', '/video/'],
  '/playlists/': ['/playlists/', '/playlist/'],
  '/events/': ['/events/', '/event/'],
}

// Check if a given navigation link should be considered active for current path
export function isNavActive(currentPath: string, link: string, matchers: Record<string, string[]> = ACTIVE_MATCHERS): boolean {
  if (link === '/') return currentPath === '/'
  const m = matchers[link] || [link]
  return m.some((p) => currentPath.startsWith(p))
}
