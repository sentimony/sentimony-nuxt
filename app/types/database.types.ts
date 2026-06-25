export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type EntityRow = {
  slug: string
  title: string
  visible: boolean
  [key: string]: Json | undefined
}

type EntityInsert = Partial<EntityRow> & Pick<EntityRow, 'slug'>

type TrackRow = {
  slug: string
  title: string
  release_slug: string
  artist_slug: string
  artist_name: string
  track_number: number
  bpm: number | null
}

type LikeRow<Column extends string> = {
  id?: number
  user_id: string
  created_at?: string
} & Record<Column, string>

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      releases: Table<EntityRow, EntityInsert>
      artists: Table<EntityRow, EntityInsert>
      events: Table<EntityRow, EntityInsert>
      friends: Table<EntityRow, EntityInsert>
      playlists: Table<EntityRow, EntityInsert>
      videos: Table<EntityRow, EntityInsert>
      tracks: Table<TrackRow, TrackRow>
      release_likes: Table<LikeRow<'release_slug'>>
      artist_likes: Table<LikeRow<'artist_slug'>>
      event_likes: Table<LikeRow<'event_slug'>>
      playlist_likes: Table<LikeRow<'playlist_slug'>>
      track_likes: Table<LikeRow<'track_slug'>>
      video_likes: Table<LikeRow<'video_slug'>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
