import { useSupabase } from '../../utils/supabase'

const isDev = process.env.NODE_ENV === 'development'

export default defineCachedEventHandler(
  async (event) => {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tag slug is required',
      })
    }

    const supabase = useSupabase()

    // Get tag with type info
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select(`
        id,
        slug,
        title,
        description,
        image_url,
        country_code,
        sort_order,
        created_at,
        type:tag_types(id, slug, title, title_plural)
      `)
      .eq('slug', slug)
      .eq('visible', true)
      .single()

    if (tagError || !tag) {
      throw createError({
        statusCode: 404,
        statusMessage: `Tag "${slug}" not found`,
      })
    }

    // Get releases associated with this tag
    const { data: releaseTagsData } = await supabase
      .from('release_tags')
      .select('release_slug')
      .eq('tag_id', tag.id)

    const releases = (releaseTagsData || []).map(
      (rt) => `/api/release/${rt.release_slug}`
    )

    return {
      id: tag.id,
      slug: tag.slug,
      title: tag.title,
      description: tag.description,
      image_url: tag.image_url,
      country_code: tag.country_code,
      type: tag.type,
      releases,
      created_at: tag.created_at,
      url: `/api/tag/${tag.slug}`,
    }
  },
  {
    maxAge: isDev ? 0 : 60 * 60,
    swr: !isDev,
  }
)
