import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data: likes } = await supabaseAdmin()
    .from('track_likes')
    .select('track_slug')
    .eq('user_id', userId)

  if (!likes?.length) return []

  const slugs = likes.map((l: { track_slug: string }) => l.track_slug)

  const { data: tracks } = await supabaseAdmin()
    .from('tracks')
    .select('slug, title, artist_name, release_slug, track_number, bpm')
    .in('slug', slugs)
    .order('release_slug')
    .order('track_number')

  return tracks ?? []
})
