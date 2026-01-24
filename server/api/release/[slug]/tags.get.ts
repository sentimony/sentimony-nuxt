import { useSupabase } from '../../../utils/supabase'

const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Release slug is required',
      })
    }

    const supabase = useSupabase()

    // Get tags for this release
    const { data, error } = await supabase
      .from('release_tags')
      .select(`
        tag:tags!inner(
          id,
          slug,
          title,
          description,
          image_url,
          country_code,
          type:tag_types(id, slug, title, title_plural)
        )
      `)
      .eq('release_slug', slug)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    // Transform and group by type
    const tags = (data || []).map((row) => ({
      ...row.tag,
      url: `/api/tag/${row.tag.slug}`,
    }))

    return tags
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
