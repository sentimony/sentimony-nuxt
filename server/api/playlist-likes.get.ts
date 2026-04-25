import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data } = await supabaseAdmin()
    .from('playlist_likes')
    .select('playlist_slug')
    .eq('user_id', userId)

  return data?.map((l: { playlist_slug: string }) => l.playlist_slug) ?? []
})
