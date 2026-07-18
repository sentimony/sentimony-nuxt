// PostgREST caps responses at 1000 rows; page through so large entities
// (tracks) never silently lose counters past the cap.
const COUNTERS_PAGE_SIZE = 1000

export function likeCountersHandler(entity: 'release' | 'artist' | 'track' | 'video' | 'event' | 'playlist') {
  return defineEventHandler(async () => {
    const rows: { slug: string, total: number }[] = []

    for (let from = 0; ; from += COUNTERS_PAGE_SIZE) {
      const { data, error } = await supabaseAdmin()
        .from('like_counters')
        .select('slug, total')
        .eq('entity', entity)
        .order('slug', { ascending: true })
        .range(from, from + COUNTERS_PAGE_SIZE - 1)

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })

      const page = (data ?? []) as { slug: unknown, total: unknown }[]
      rows.push(...page.map(row => ({
        slug: String(row.slug),
        total: Number(row.total) || 0,
      })))
      if (page.length < COUNTERS_PAGE_SIZE) break
    }

    return rows
  })
}
