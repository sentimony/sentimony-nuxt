import { useSupabase } from '../utils/supabase'
import { buildListResponse, parsePaginationQuery } from '../utils/apiResponse'

const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event)
    const { page, limit, offset } = parsePaginationQuery(query)

    const supabase = useSupabase()

    // Get total count
    const { count } = await supabase
      .from('tag_types')
      .select('*', { count: 'exact', head: true })

    // Get paginated results
    const { data, error } = await supabase
      .from('tag_types')
      .select('id, slug, title, title_plural, sort_order')
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    // Transform results to include URL
    const results = (data || []).map((type) => ({
      ...type,
      url: `/api/tags?type=${type.slug}`,
    }))

    const baseUrl = `/api/tag-types?limit=${limit}`

    return buildListResponse(results, {
      page,
      limit,
      total: count || 0,
      baseUrl,
    })
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
