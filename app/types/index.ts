/**
 * Shared TypeScript types for Sentimony Records
 */

// ============================================================================
// Base Types
// ============================================================================

/** Base entity with common fields */
export interface BaseEntity {
  slug: string
  title: string
  visible?: boolean
  date?: string
}

/** Compact paragraph item used in tracklists and credits */
export interface CompactParagraph {
  p: string
}

// ============================================================================
// Release Types
// ============================================================================

export interface ReleaseLinks {
  // Download platforms
  bandcamp_url?: string
  bandcamp24_url?: string
  beatport?: string
  junodownload?: string
  diggersfactory_url?: string

  // Streaming platforms
  spotify?: string
  applemusic_url?: string
  youtube_music?: string
  deezer?: string
  amazon_music?: string
  tidal?: string
  qobuz?: string
  soundcloud_url?: string
  youtube?: string

  // Embed IDs
  bandcamp_id?: string
  youtube_playlist_id?: string
  soundcloud_playlist_id?: string

  // External links
  discogs?: string
  ektoplazm?: string
  beatspace?: string
  psyshop?: string
}

export interface Release extends BaseEntity {
  // Images
  cover_og?: string
  cover_th?: string
  cover_xl?: string

  // Release info
  cat_no?: string
  style?: string
  format?: string
  total_time?: string
  tracks_number?: number
  information?: string

  // Related data
  tracklistCompact?: CompactParagraph[]
  creditsCompact?: CompactParagraph[]
  relative_releases?: string[]
  artists?: string | string[]
  at_playlists?: string[]

  // Flags
  coming_soon?: boolean
  new?: boolean

  // Links
  links?: ReleaseLinks
}

/** API response for releases collection */
export interface ReleasesResponse {
  releases: Record<string, Release> | Release[]
}

// ============================================================================
// Artist Types
// ============================================================================

export type ArtistCategory = 'musician' | 'dj' | 'mastering' | 'designer'

export interface Artist extends BaseEntity {
  // Images
  photo_og?: string
  photo_th?: string
  photo_xl?: string

  // Artist info
  name?: string
  location?: string
  style?: string
  information?: string
  category?: ArtistCategory
  category_id?: number

  // Social & streaming links
  bandcamp_url?: string
  soundcloud_url?: string
  spotify?: string
  applemusic_url?: string
  youtubemusic_url?: string
  youtube_url?: string
  facebook?: string
  instagram?: string
  discogs?: string
  wikipedia_url?: string

  // Embed IDs
  youtube_playlist_id?: string
  soundcloud_track_id?: string
}

/** API response for artists collection */
export interface ArtistsResponse {
  artists: Record<string, Artist> | Artist[]
}

// ============================================================================
// Video Types
// ============================================================================

export interface VideoLinks {
  youtube?: string
}

export interface Video extends BaseEntity {
  // Images
  cover_og?: string
  cover_th?: string
  cover_xl?: string

  // Video info
  information?: string
  credits?: string

  // Links
  links?: VideoLinks
}

/** API response for videos collection */
export interface VideosResponse {
  videos: Record<string, Video> | Video[]
}

// ============================================================================
// Event Types
// ============================================================================

export interface EventLink {
  id?: string
  url?: string
}

export interface EventLineup {
  musician?: string
}

export interface Event extends BaseEntity {
  // Images
  cover_og?: string
  cover_th?: string
  flyer_a_xl?: string
  flyer_b_xl?: string

  // Event info
  time?: string
  location?: string
  info?: string

  // Related data
  lineup?: EventLineup[]
  links?: EventLink[]
}

/** API response for events collection */
export interface EventsResponse {
  events: Record<string, Event> | Event[]
}

// ============================================================================
// Playlist Types
// ============================================================================

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
  // Images
  cover_og?: string
  cover_th?: string
  cover_xl?: string

  // Playlist info
  style?: string
  info?: string

  // Links
  links?: PlaylistLinks
}

/** API response for playlists collection */
export interface PlaylistsResponse {
  playlists: Record<string, Playlist> | Playlist[]
}

// ============================================================================
// Friend Types
// ============================================================================

export interface Friend extends BaseEntity {
  // Images
  cover_og?: string
  cover_th?: string
  cover_xl?: string

  // Friend info
  information?: string
  url?: string
}

/** API response for friends collection */
export interface FriendsResponse {
  friends: Record<string, Friend> | Friend[]
}

// ============================================================================
// Component Props Types
// ============================================================================

/** Category for Item component routing */
export type ItemCategory = 'release' | 'artist' | 'video' | 'event' | 'playlist' | 'friend'

/** Entity type for Item component - supports all entity types */
export interface ItemEntity {
  slug: string
  title?: string
  // Release/Video/Playlist images
  cover_th?: string
  // Artist images
  photo_th?: string
  // Event images
  flyer_a_xl?: string
  // Artwork (unused but defined)
  artwork_th?: string
  // Flags
  coming_soon?: boolean
  new?: boolean
}

// ============================================================================
// News/Feed Types
// ============================================================================

export interface NewsItem {
  date?: string | number | Date
  slug: string
  title: string
  href: string
  category: 'release' | 'event' | 'video'
  image?: string
}

// ============================================================================
// Utility Types
// ============================================================================

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

/** Filter/sort options for collections */
export interface CollectionOptions {
  filterVisible?: boolean
  sortBy?: 'date' | 'category_id' | 'title'
  sortDirection?: SortDirection
}

/** AsyncData options type from Nuxt */
export type AsyncDataOptions<T> = Parameters<typeof useAsyncData<T>>[2]
