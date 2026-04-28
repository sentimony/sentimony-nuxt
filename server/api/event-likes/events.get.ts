import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return { data: [], total: 0 }

  const { page = '0', limit = '5' } = getQuery(event) as { page?: string, limit?: string }
  const limitNum = parseInt(limit)
  const from = parseInt(page) * limitNum
  const to = from + limitNum - 1

  const admin = supabaseAdmin()

  const [{ count }, { data: likes }] = await Promise.all([
    admin.from('event_likes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('event_likes').select('event_slug').eq('user_id', userId).range(from, to),
  ])

  if (!likes?.length) return { data: [], total: count ?? 0 }

  const slugs = likes.map((l: { event_slug: string }) => l.event_slug)

  const { data } = await admin
    .from('events')
    .select('slug, title, flyer_a_xl')
    .in('slug', slugs)
    .order('title')

  return { data: data ?? [], total: count ?? 0 }
})
