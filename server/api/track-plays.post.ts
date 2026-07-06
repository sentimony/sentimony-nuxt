export default defineEventHandler(async (event) => {
  const body = await readBody<{ slug?: string }>(event)
  const slug = body?.slug?.trim()

  if (!slug || slug.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Missing track slug' })
  }

  const { error } = await supabaseAdmin().rpc('increment_track_play', { p_slug: slug })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true }
})
