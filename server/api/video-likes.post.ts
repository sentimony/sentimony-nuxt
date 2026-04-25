import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const userId = user?.sub ?? user?.id
  if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { slug } = await readBody<{ slug: string }>(event)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const { error } = await supabaseAdmin()
    .from('video_likes')
    .upsert({ user_id: userId, video_slug: slug }, { onConflict: 'user_id,video_slug', ignoreDuplicates: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true }
})
