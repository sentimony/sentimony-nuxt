import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data } = await supabaseAdmin()
    .from('track_likes')
    .select('track_slug')
    .eq('user_id', userId)

  return data?.map((l: { track_slug: string }) => l.track_slug) ?? []
})
