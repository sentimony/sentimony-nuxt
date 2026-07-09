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

export async function fetchPagedRows<T>(
  pageSize: number,
  fetchPage: (from: number, to: number) => Promise<T[]>,
): Promise<T[]> {
  const rows: T[] = []
  let from = 0

  while (true) {
    const batch = await fetchPage(from, from + pageSize - 1)
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}

export async function fetchLikeCounts(table: string, slugCol: string, slugs: string[]) {
  const countMap: Record<string, number> = {}
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))]
  if (!uniqueSlugs.length) return countMap

  try {
    const data = await fetchPagedRows(1000, async (from, to) => {
      const { data: page } = await supabaseAdmin()
        .from(table)
        .select(slugCol)
        .in(slugCol, uniqueSlugs)
        .order(slugCol, { ascending: true })
        .range(from, to)

      return (page ?? []) as Record<string, string>[]
    })

    for (const like of data) {
      const slug = like[slugCol]
      if (slug) countMap[slug] = (countMap[slug] ?? 0) + 1
    }
  } catch {
    return countMap
  }

  return countMap
}
