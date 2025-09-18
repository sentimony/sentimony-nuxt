// Central registry of icon identifiers used across the app.
// Prefer Iconify names (e.g. 'fa-brands:spotify'). For custom SVGs, use an absolute URL.

export type IconKey =
  | 'appleMusic'
  | 'bandcamp'
  | 'beatport'
  | 'deezer'
  | 'discogs'
  | 'facebook'
  | 'instagram'
  | 'tumblr'
  | 'giphy'
  | 'linkedin'
  | 'vk'
  | 'junoDownload'
  | 'mixcloud'
  | 'patreon'
  | 'soundcloud'
  | 'spotify'
  | 'tiktok'
  | 'twitter'
  | 'twitterX'
  | 'youtube'

export type IconDef =
  | { kind: 'iconify'; name: string }
  | { kind: 'svg'; url: string }

export const ICONS: Record<IconKey, IconDef> = {
  appleMusic:   { kind: 'iconify', name: 'fa-brands:apple' },
  bandcamp:     { kind: 'iconify', name: 'cib:bandcamp' },
  beatport:     { kind: 'iconify', name: 'simple-icons:beatport' },
  deezer:       { kind: 'iconify', name: 'fa-brands:deezer' },
  discogs:      { kind: 'iconify', name: 'simple-icons:discogs' },
  facebook:     { kind: 'iconify', name: 'fa-brands:facebook' },
  instagram:    { kind: 'iconify', name: 'fa-brands:instagram' },
  tumblr:       { kind: 'iconify', name: 'fa7-brands:tumblr' },
  giphy:        { kind: 'iconify', name: 'pixel:giphy' },
  linkedin:     { kind: 'iconify', name: 'fa-brands:linkedin-in' },
  vk:           { kind: 'iconify', name: 'fa-brands:vk' },
  // Custom SVG (no Iconify glyph available in codebase)
  junoDownload: { kind: 'svg', url: 'https://content.sentimony.com/assets/img/svg-icons/junodownload.svg' },
  mixcloud:     { kind: 'iconify', name: 'fa-brands:mixcloud' },
  patreon:      { kind: 'iconify', name: 'fa-brands:patreon' },
  soundcloud:   { kind: 'iconify', name: 'fa-brands:soundcloud' },
  spotify:      { kind: 'iconify', name: 'fa-brands:spotify' },
  tiktok:       { kind: 'iconify', name: 'fa-brands:tiktok' },
  twitter:      { kind: 'iconify', name: 'fa-brands:twitter' },
  twitterX:     { kind: 'iconify', name: 'fa7-brands:x-twitter' },
  youtube:      { kind: 'iconify', name: 'fa:youtube' },
}

export function getIcon(key: IconKey): IconDef {
  return ICONS[key]
}
