export const profileSections = [
  { key: 'releases', label: 'Releases', icon: 'lucide:disc-3' },
  { key: 'tracks', label: 'Tracks', icon: 'lucide:music' },
  { key: 'artists', label: 'Artists', icon: 'lucide:keyboard-music' },
  { key: 'videos', label: 'Videos', icon: 'lucide:monitor-play' },
  { key: 'playlists', label: 'Playlists', icon: 'lucide:list-music' },
  { key: 'events', label: 'Events', icon: 'lucide:tent-tree' },
] as const

export type ProfileSectionKey = typeof profileSections[number]['key']
export type ProfileSummary = Record<ProfileSectionKey, number>
