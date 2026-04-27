import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) return []

  const { data: likes } = await supabaseAdmin()
    .from('release_likes')
    .select('release_slug')
    .eq('user_id', userId)

  if (!likes?.length) return []

  const slugs = likes.map((l: { release_slug: string }) => l.release_slug)

  const { data: releases } = await supabaseAdmin()
    .from('releases')
    .select('slug, title, cover_th, date')
    .in('slug', slugs)
    .eq('visible', true)
    .order('date', { ascending: false })

  return releases ?? []
})
