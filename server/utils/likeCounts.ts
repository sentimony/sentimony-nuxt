export async function fetchLikeCount(table: string, slugCol: string, slug: string) {
  try {
    const { count } = await supabaseAdmin()
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(slugCol, slug)

    return count ?? 0
  } catch {
    return 0
  }
}

export async function fetchLikeCounts(table: string, slugCol: string, slugs: string[]) {
  const countMap: Record<string, number> = {}
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))]
  if (!uniqueSlugs.length) return countMap

  try {
    const { data } = await supabaseAdmin()
      .from(table)
      .select(slugCol)
      .in(slugCol, uniqueSlugs)

    for (const like of (data ?? []) as Record<string, string>[]) {
      const slug = like[slugCol]
      if (slug) countMap[slug] = (countMap[slug] ?? 0) + 1
    }
  } catch {
    return countMap
  }

  return countMap
}
