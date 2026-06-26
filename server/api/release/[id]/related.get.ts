const isDev = process.env.NODE_ENV === 'development'

type RelatedRelease = { slug: string, title?: string, cover_xl?: string, date?: string }
type RelatedArtist = { slug: string, title?: string, photo_xl?: string }

function toSlugArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

function fetchNode(url: string) {
  return $fetch<Record<string, unknown> | null>(isDev ? `${url}?_t=${Date.now()}` : url).catch(() => null)
}

export default defineCachedEventHandler(
  async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing release id' })

    if (useRuntimeConfig().releasesSource === 'supabase') {
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
          : Promise.resolve({ data: [] as RelatedRelease[] }),
        artistOrder.length
          ? useSupabase()
              .from('artists')
              .select('slug, title, photo_xl')
              .in('slug', artistOrder)
              .eq('visible', true)
          : Promise.resolve({ data: [] as RelatedArtist[] }),
      ])

      const releases = (releasesRes.data ?? []) as RelatedRelease[]
      const artists = sortByOrder((artistsRes.data ?? []) as RelatedArtist[], artistOrder)
      return { releases, artists }
    }

    const { public: { firebaseBase } } = useRuntimeConfig()
    const release = await fetchNode(`${firebaseBase}/releases/${id}.json`)

    const relativeSlugs = toSlugArray(release?.relative_releases)
    const artistOrder = toSlugArray(release?.artists)

    type Node = Record<string, unknown> & { slug: string }

    const [releaseNodes, artistNodes] = await Promise.all([
      Promise.all(relativeSlugs.map(async (slug): Promise<Node | null> => {
        const r = await fetchNode(`${firebaseBase}/releases/${slug}.json`)
        return r ? { ...r, slug } : null
      })),
      Promise.all(artistOrder.map(async (slug): Promise<Node | null> => {
        const a = await fetchNode(`${firebaseBase}/artists/${slug}.json`)
        return a ? { ...a, slug } : null
      })),
    ])

    const releases = releaseNodes
      .filter((r): r is Node => !!r && r.visible === true)
      .map(r => ({ slug: r.slug, title: r.title as string, cover_xl: r.cover_xl as string, date: r.date as string }))
      .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())

    const artists = artistNodes
      .filter((a): a is Node => !!a && a.visible === true)
      .map(a => ({ slug: a.slug, title: a.title as string, photo_xl: a.photo_xl as string }))

    return { releases, artists }
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  },
)

function sortByOrder<T extends { slug: string }>(items: T[], order: string[]): T[] {
  return [...items].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
}
