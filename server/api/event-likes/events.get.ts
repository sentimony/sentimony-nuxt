import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data: likes } = await supabaseAdmin()
    .from('event_likes')
    .select('event_slug')
    .eq('user_id', userId)

  if (!likes?.length) return []

  const slugs = likes.map((l: { event_slug: string }) => l.event_slug)

  const { data: events } = await supabaseAdmin()
    .from('events')
    .select('slug, title, flyer_a_xl')
    .in('slug', slugs)
    .order('title')

  return events ?? []
})
