import { useSupabase } from '../utils/supabase'
import { buildListResponse, parsePaginationQuery } from '../utils/apiResponse'

const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event)
    const { page, limit, offset } = parsePaginationQuery(query)

    // Filter params
    const typeSlug = query.type as string | undefined
    const name = query.name as string | undefined

    const supabase = useSupabase()

    // Build base query
    let baseQuery = supabase
      .from('tags')
      .select(`
        id,
        slug,
        title,
        description,
        image_url,
        country_code,
        sort_order,
        type:tag_types!inner(id, slug, title, title_plural)
      `, { count: 'exact' })
      .eq('visible', true)

    // Apply filters
    if (typeSlug) {
      baseQuery = baseQuery.eq('tag_types.slug', typeSlug)
    }

    if (name) {
      baseQuery = baseQuery.ilike('title', `%${name}%`)
    }

    // Get total count with filters
    const countQuery = supabase
      .from('tags')
      .select('id, tag_types!inner(slug)', { count: 'exact', head: true })
      .eq('visible', true)

    if (typeSlug) {
      countQuery.eq('tag_types.slug', typeSlug)
    }
    if (name) {
      countQuery.ilike('title', `%${name}%`)
    }

    const { count } = await countQuery

    // Get paginated results
    const { data, error } = await baseQuery
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    // Transform results
    const results = (data || []).map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      title: tag.title,
      description: tag.description,
      image_url: tag.image_url,
      country_code: tag.country_code,
      type: tag.type,
      url: `/api/tag/${tag.slug}`,
    }))

    // Build base URL preserving filters
    const urlParams = new URLSearchParams()
    urlParams.set('limit', String(limit))
    if (typeSlug) urlParams.set('type', typeSlug)
    if (name) urlParams.set('name', name)
    const baseUrl = `/api/tags?${urlParams.toString()}`

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
