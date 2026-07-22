const isDev = process.env.NODE_ENV === 'development'

function toSlugArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
  return []
}

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing release id' })

    if (isSupabaseCatalogSource()) {
      const { data: release } = await useSupabase()
        .from('releases')
        .select('relative_releases, artists')
        .eq('slug', id)
        .eq('visible', true)
        .single()

      const relativeSlugs = toSlugArray(release?.relative_releases)
      const artistOrder = toSlugArray(release?.artists)

      const [releasesRes, artistsRes] = await Promise.all([
        relativeSlugs.length
          ? useSupabase()
              .from('releases')
              .select('slug, title, cover_xl, date')
              .in('slug', relativeSlugs)
              .eq('visible', true)
              .order('date', { ascending: false })
          : Promise.resolve({ data: [] }),
        artistOrder.length
          ? useSupabase()
              .from('artists')
              .select('slug, title, photo_xl')
              .in('slug', artistOrder)
              .eq('visible', true)
          : Promise.resolve({ data: [] }),
      ])

      return {
        releases: releasesRes.data ?? [],
        artists: sortByOrder((artistsRes.data ?? []) as { slug: string }[], artistOrder),
      }
    }

    const release = await fetchFirebaseEntity('releases', id)

    const relativeSlugs = toSlugArray(release?.relative_releases)
    const artistOrder = toSlugArray(release?.artists)

    const [releaseNodes, artistNodes] = await Promise.all([
      fetchFirebaseEntitiesBySlugs('releases', relativeSlugs),
      fetchFirebaseEntitiesBySlugs('artists', artistOrder),
    ])

    const releases = releaseNodes
      .filter(r => r.visible === true)
      .map(r => ({ slug: r.slug, title: r.title as string, cover_xl: r.cover_xl as string, date: r.date as string }))
      .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())

    const artists = artistNodes
      .filter(a => a.visible === true)
      .map(a => ({ slug: a.slug, title: a.title as string, photo_xl: a.photo_xl as string }))

    return { releases, artists }
  },
  catalogCacheOptions(),
)

function sortByOrder<T extends { slug: string }>(items: T[], order: string[]): T[] {
  return [...items].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
}
