import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data } = await supabaseAdmin()
    .from('event_likes')
    .select('event_slug')
    .eq('user_id', userId)

  return data?.map((l: { event_slug: string }) => l.event_slug) ?? []
})
