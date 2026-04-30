import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return { data: [], total: 0 }

  const { page = '0', limit = '20' } = getQuery(event) as { page?: string, limit?: string }
  const limitNum = parseInt(limit)
  const from = parseInt(page) * limitNum
  const to = from + limitNum - 1

  const admin = supabaseAdmin()

  const [{ count }, { data: likes }] = await Promise.all([
    admin.from('track_likes').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('track_likes').select('track_slug').eq('user_id', userId).range(from, to),
  ])

  if (!likes?.length) return { data: [], total: count ?? 0 }

  const slugs = likes.map((l: { track_slug: string }) => l.track_slug)

  const { data, error } = await admin
    .from('tracks')
    .select('slug, title, artist_name, release_slug, track_number, bpm')
    .in('slug', slugs)
    .order('release_slug')
    .order('track_number')

  if (error) console.error('[track-likes/tracks]', error.message)

  return { data: data ?? [], total: count ?? 0 }
})
