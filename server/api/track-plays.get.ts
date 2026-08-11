export default defineEventHandler(async (event) => {
  // Public play totals, keyed by the requested slugs and identical for everyone:
  // without this the page-detail fetch woke the function on every single view.
  setHeaders(event, publicCounterHeaders)

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
