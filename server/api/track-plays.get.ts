export default defineEventHandler(async (event) => {
  const slugsParam = getQuery(event).slugs
  const slugs = String(slugsParam ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  if (!slugs.length) return {}

  try {
    const { data } = await supabaseAdmin()
      .from('track_plays')
      .select('track_slug, play_count')
      .in('track_slug', slugs)

    return Object.fromEntries((data ?? []).map(row => [row.track_slug, row.play_count]))
  } catch {
    return {}
  }
})
