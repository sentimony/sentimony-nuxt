import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data: likes } = await supabaseAdmin()
    .from('artist_likes')
    .select('artist_slug')
    .eq('user_id', userId)

  if (!likes?.length) return []

  const slugs = likes.map((l: { artist_slug: string }) => l.artist_slug)

  const { data: artists } = await supabaseAdmin()
    .from('artists')
    .select('slug, title, photo_th')
    .in('slug', slugs)
    .order('title')

  return artists ?? []
})
