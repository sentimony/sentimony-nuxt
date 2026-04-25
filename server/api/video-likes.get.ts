import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data } = await supabaseAdmin()
    .from('video_likes')
    .select('video_slug')
    .eq('user_id', userId)

  return data?.map((l: { video_slug: string }) => l.video_slug) ?? []
})
