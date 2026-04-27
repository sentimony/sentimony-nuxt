import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data: likes } = await supabaseAdmin()
    .from('video_likes')
    .select('video_slug')
    .eq('user_id', userId)

  if (!likes?.length) return []

  const slugs = likes.map((l: { video_slug: string }) => l.video_slug)

  const { data: videos } = await supabaseAdmin()
    .from('videos')
    .select('slug, title, cover_th')
    .in('slug', slugs)
    .order('title')

  return videos ?? []
})
