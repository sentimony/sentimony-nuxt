import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const { error } = await supabaseAdmin()
    .from('video_likes')
    .delete()
    .eq('user_id', userId)
    .eq('video_slug', slug)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
