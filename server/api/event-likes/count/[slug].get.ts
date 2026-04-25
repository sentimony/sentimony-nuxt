export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

  const { count, error } = await supabaseAdmin()
    .from('event_likes')
    .select('*', { count: 'exact', head: true })
    .eq('event_slug', slug)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { count: count ?? 0 }
})
