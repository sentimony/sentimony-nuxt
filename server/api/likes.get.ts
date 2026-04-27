import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data } = await supabaseAdmin()
    .from('release_likes')
    .select('release_slug')
    .eq('user_id', userId)

  return data?.map((l: { release_slug: string }) => l.release_slug) ?? []
})
