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
  | 'youtubeMusic'

export type IconDef =
  | { kind: 'iconify'; name: string }
  | { kind: 'svg'; url: string }

export const ICONS: Record<IconKey, IconDef> = {
  appleMusic:   { kind: 'iconify', name: 'simple-icons:applemusic' },
  bandcamp:     { kind: 'iconify', name: 'simple-icons:bandcamp' },
  beatport:     { kind: 'iconify', name: 'simple-icons:beatport' },
  deezer:       { kind: 'iconify', name: 'simple-icons:deezer' },
  discogs:      { kind: 'iconify', name: 'simple-icons:discogs' },
  facebook:     { kind: 'iconify', name: 'simple-icons:facebook' },
  instagram:    { kind: 'iconify', name: 'simple-icons:instagram' },
  tumblr:       { kind: 'iconify', name: 'simple-icons:tumblr' },
  giphy:        { kind: 'iconify', name: 'simple-icons:giphy' },
  linkedin:     { kind: 'iconify', name: 'simple-icons:linkedin' },
  vk:           { kind: 'iconify', name: 'simple-icons:vk' },
  junoDownload: { kind: 'svg', url: 'https://content.sentimony.com/assets/img/svg-icons/junodownload.svg' },
  mixcloud:     { kind: 'iconify', name: 'simple-icons:mixcloud' },
  patreon:      { kind: 'iconify', name: 'simple-icons:patreon' },
  soundcloud:   { kind: 'iconify', name: 'simple-icons:soundcloud' },
  spotify:      { kind: 'iconify', name: 'simple-icons:spotify' },
  tiktok:       { kind: 'iconify', name: 'simple-icons:tiktok' },
  twitter:      { kind: 'iconify', name: 'simple-icons:twitter' },
  twitterX:     { kind: 'iconify', name: 'simple-icons:x' },
  youtube:      { kind: 'iconify', name: 'simple-icons:youtube' },
  youtubeMusic: { kind: 'iconify', name: 'simple-icons:youtubemusic' },
}

export function getIcon(key: IconKey): IconDef {
  return ICONS[key]
}
