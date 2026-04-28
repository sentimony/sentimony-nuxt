import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data: likes } = await supabaseAdmin()
    .from('playlist_likes')
    .select('playlist_slug')
    .eq('user_id', userId)

  if (!likes?.length) return []

  const slugs = likes.map((l: { playlist_slug: string }) => l.playlist_slug)

  const { data: playlists } = await supabaseAdmin()
    .from('playlists')
    .select('slug, title, cover_th')
    .in('slug', slugs)
    .order('title')

  return playlists ?? []
})
