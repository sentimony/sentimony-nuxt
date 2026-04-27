import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data } = await supabaseAdmin()
    .from('artist_likes')
    .select('artist_slug')
    .eq('user_id', userId)

  return data?.map((l: { artist_slug: string }) => l.artist_slug) ?? []
})
