export interface BaseEntity {
  slug: string
  title: string
  visible?: boolean
  date?: string
}

export interface CompactParagraph {
  p: string
}

export interface ReleaseLinks {
  bandcamp_url?: string
  bandcamp24_url?: string
  beatport?: string
  junodownload?: string
  diggersfactory_url?: string
  spotify?: string
  applemusic_url?: string
  youtube_music?: string
  deezer?: string
  amazon_music?: string
  tidal?: string
  qobuz?: string
  soundcloud_url?: string
  youtube?: string
  bandcamp_id?: string
  youtube_playlist_id?: string
  soundcloud_playlist_id?: string
  discogs?: string
  ektoplazm?: string
  beatspace?: string
  psyshop?: string
}

export interface Release extends BaseEntity {
  cover_og?: string
  cover_th?: string
  cover_xl?: string
  cat_no?: string
  style?: string
  format?: string
  total_time?: string
  tracks_number?: number
  information?: string
  tracklistCompact?: CompactParagraph[]
  creditsCompact?: CompactParagraph[]
  relative_releases?: string[]
  artists?: string | string[]
  at_playlists?: string[]
  coming_soon?: boolean
  new?: boolean
  like_count?: number
  links?: ReleaseLinks
}

export interface ReleasesResponse {
  releases: Record<string, Release> | Release[]
}

export type ArtistCategory = 'musician' | 'dj' | 'mastering' | 'designer'

export interface Artist extends BaseEntity {
  photo_og?: string
  photo_th?: string
  photo_xl?: string
  name?: string
  location?: string
  style?: string
  information?: string
  info_sc?: string
  category?: ArtistCategory
  category_id?: number
  bandcamp_url?: string
  soundcloud_url?: string
  spotify?: string
  apple_music?: string
  youtubemusic_url?: string
  youtube_url?: string
  facebook?: string
  instagram?: string
  discogs?: string
  wikipedia_url?: string
  youtube_playlist_id?: string
  soundcloud_track_id?: string
  like_count?: number
}

export interface ArtistsResponse {
  artists: Record<string, Artist> | Artist[]
}

export interface Track {
  slug: string
  title: string
  release_slug: string
  artist_slug: string
  artist_name: string
  track_number: number
  bpm: number | null
  like_count?: number
}

export interface TrackResponse {
  track: Track
  release: Release | null
  artists: Artist[]
  releaseTracks: Track[]
  similarTracks: Track[]
  likeCount: number
}

export interface VideoLinks {
  youtube?: string
}

export interface Video extends BaseEntity {
  cover_og?: string
  cover_th?: string
  cover_xl?: string
  information?: string
  credits?: string
  like_count?: number
  links?: VideoLinks
}

export interface VideosResponse {
  videos: Record<string, Video> | Video[]
}

export interface EventLink {
  id?: string
  url?: string
}

export interface EventLineup {
  musician?: string
}

export interface Event extends BaseEntity {
  cover_og?: string
  cover_th?: string
  flyer_a_xl?: string
  flyer_b_xl?: string
  time?: string
  location?: string
  info?: string
  lineup?: EventLineup[]
  organizer?: string[]
  like_count?: number
  links?: EventLink[]
}

export interface EventsResponse {
  events: Record<string, Event> | Event[]
}

export interface PlaylistLinks {
  spotify?: string
  apple_music?: string
  youtube_music?: string
  deezer?: string
  youtube?: string
  soundcloud_url?: string
  soundcloud_playlist_id?: string
}

export interface Playlist extends BaseEntity {
  cover_og?: string
  cover_th?: string
  cover_xl?: string
  style?: string
  info?: string
  like_count?: number
  links?: PlaylistLinks
}

export interface PlaylistsResponse {
  playlists: Record<string, Playlist> | Playlist[]
}

export interface Friend extends BaseEntity {
  cover_og?: string
  cover_th?: string
  cover_xl?: string
  information?: string
  url?: string
}

export interface FriendsResponse {
  friends: Record<string, Friend> | Friend[]
}

export type ItemCategory = 'release' | 'artist' | 'video' | 'event' | 'playlist' | 'friend'

export interface ItemEntity {
  slug: string
  title?: string
  cover_xl?: string
  photo_xl?: string
  flyer_a_xl?: string
  coming_soon?: boolean
  new?: boolean
  category_id?: number
}

export interface NewsItem {
  date?: string | number | Date
  slug: string
  title: string
  href: string
  category: 'release' | 'event' | 'video'
  image?: string
}

export type SortDirection = 'asc' | 'desc'

export interface CollectionOptions {
  filterVisible?: boolean
  sortBy?: 'date' | 'category_id' | 'title'
  sortDirection?: SortDirection
}

export type AsyncDataOptions<T> = Parameters<typeof useAsyncData<T>>[2]
