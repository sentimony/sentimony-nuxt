// Central registry of external links used across the app.
// Align ids with IconKey where it makes sense for easy pairing.

import type { IconKey } from './icons'

// Individual URL constants
export const APPLE_MUSIC_URL   = 'https://music.apple.com/ua/playlist/sentimony-records-official-playlist/pl.u-GgA5eY6toa92kz6'
export const BANDCAMP_URL      = 'https://sentimony.bandcamp.com/follow_me'
export const BEATPORT_URL      = 'https://www.beatport.com/label/sentimony-records/66490'
export const DEEZER_URL        = 'https://www.deezer.com/us/playlist/5701954482'
export const DISCOGS_URL       = 'https://www.discogs.com/label/82598-Sentimony-Records?sort=year&sort_order=desc&layout=big&&limit=100'
export const FACEBOOK_URL      = 'https://www.facebook.com/sentimony.records'
export const INSTAGRAM_URL     = 'https://www.instagram.com/sentimony.records'
export const JUNODOWNLOAD_URL  = 'https://www.junodownload.com/labels/Sentimony/'
export const MIXCLOUD_URL      = 'https://www.mixcloud.com/sentimony'
export const PATREON_URL       = 'https://www.patreon.com/sentimony'
export const SOUNDCLOUD_URL    = 'https://soundcloud.com/sentimony'
export const SPOTIFY_URL       = 'https://open.spotify.com/playlist/2vL0QCDgj57noKq6bfniA0'
export const TIKTOK_URL        = 'https://www.tiktok.com/@sentimony'
export const TWITTER_URL       = 'https://twitter.com/sentimony'
export const YOUTUBE_URL       = 'https://www.youtube.com/@SentimonyRecords?sub_confirmation=1'
export const YOUTUBE_MUSIC_URL = 'https://music.youtube.com/channel/UCMvuVxLPE5VBjw0YH1uE4ig'
export const TUMBLR_URL        = 'https://sentimony.tumblr.com'
export const GIPHY_URL         = 'https://giphy.com/channel/sentimony'
export const LINKEDIN_URL      = 'https://www.linkedin.com/company/3256285'
export const VK_URL            = 'https://vk.com/club1342946'

export type SocialLink = {
  id: IconKey
  title: string
  url: string
  inHeader?: boolean
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'appleMusic',   title: 'Apple Music',   url: APPLE_MUSIC_URL },
  { id: 'bandcamp',     title: 'Bandcamp',      url: BANDCAMP_URL, inHeader: true },
  { id: 'beatport',     title: 'Beatport',      url: BEATPORT_URL },
  { id: 'deezer',       title: 'Deezer',        url: DEEZER_URL },
  { id: 'discogs',      title: 'Discogs',       url: DISCOGS_URL },
  { id: 'facebook',     title: 'Facebook',      url: FACEBOOK_URL, inHeader: true },
  { id: 'instagram',    title: 'Instagram',     url: INSTAGRAM_URL },
  { id: 'junoDownload', title: 'JunoDownload',  url: JUNODOWNLOAD_URL },
  { id: 'mixcloud',     title: 'Mixcloud',      url: MIXCLOUD_URL },
  { id: 'patreon',      title: 'Patreon',       url: PATREON_URL },
  { id: 'soundcloud',   title: 'SoundCloud',    url: SOUNDCLOUD_URL, inHeader: true },
  { id: 'spotify',      title: 'Spotify',       url: SPOTIFY_URL },
  // { id: 'tumblr',       title: 'Tumblr',        url: TUMBLR_URL },
  // { id: 'giphy',        title: 'Giphy',         url: GIPHY_URL },
  // { id: 'linkedin',     title: 'LinkedIn',      url: LINKEDIN_URL },
  // { id: 'vk',           title: 'VK',            url: VK_URL },
  { id: 'tiktok',       title: 'TikTok',        url: TIKTOK_URL },
  { id: 'twitterX',     title: 'Twitter Х',     url: TWITTER_URL },
  { id: 'youtube',      title: 'YouTube',       url: YOUTUBE_URL, inHeader: true },
  { id: 'youtubeMusic', title: 'YouTube Music', url: YOUTUBE_MUSIC_URL },
]

// export function getSocial(id: IconKey): SocialLink | undefined {
//   return SOCIAL_LINKS.find(l => l.id === id)
// }

export function getSocials(opts?: { inHeader?: boolean }): SocialLink[] {
  if (opts && typeof opts.inHeader !== 'undefined') {
    return SOCIAL_LINKS.filter(l => Boolean(l.inHeader) === Boolean(opts.inHeader))
  }
  return SOCIAL_LINKS
}

// export function getSoclinks(): SocialLink[] {
//   return SOCIAL_LINKS
// }

// export function getHeaderSoclinks(): SocialLink[] {
//   return SOCIAL_LINKS.filter(i => i?.inHeader)
// }
