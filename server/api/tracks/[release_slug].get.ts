import { usesSupabaseContentSource } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const releaseSlug = getRouterParam(event, 'release_slug')
  if (!releaseSlug) throw createError({ statusCode: 400, statusMessage: 'Missing release_slug' })

  if (!usesSupabaseContentSource()) return []

  const { data: tracks, error } = await supabaseAdmin()
    .from('tracks')
    .select('slug, title, artist_slug, artist_name, track_number, bpm')
    .eq('release_slug', releaseSlug)
    .order('track_number')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!tracks?.length) return []

  const { data: likesRaw } = await supabaseAdmin()
    .from('track_likes')
    .select('track_slug')
    .in('track_slug', tracks.map(t => t.slug))

  const countMap: Record<string, number> = {}
  likesRaw?.forEach((l: { track_slug: string }) => {
    countMap[l.track_slug] = (countMap[l.track_slug] ?? 0) + 1
  })

  return tracks.map(t => ({ ...t, like_count: countMap[t.slug] ?? 0 }))
})
