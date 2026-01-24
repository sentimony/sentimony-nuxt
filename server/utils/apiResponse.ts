/**
 * API Response helpers (Rick and Morty API style)
 * https://rickandmortyapi.com/documentation
 */

export interface ApiInfo {
  count: number
  pages: number
  next: string | null
  prev: string | null
}

export interface ApiListResponse<T> {
  info: ApiInfo
  results: T[]
}

export interface PaginationParams {
  page: number
  limit: number
  total: number
  baseUrl: string
}

/**
 * Build pagination info object
 */
export function buildPaginationInfo(params: PaginationParams): ApiInfo {
  const { page, limit, total, baseUrl } = params
  const pages = Math.ceil(total / limit)

  // Build next/prev URLs
  const buildUrl = (p: number) => {
    const url = new URL(baseUrl, 'http://localhost')
    url.searchParams.set('page', String(p))
    return url.pathname + url.search
  }

  return {
    count: total,
    pages,
    next: page < pages ? buildUrl(page + 1) : null,
    prev: page > 1 ? buildUrl(page - 1) : null,
  }
}

/**
 * Build paginated list response
 */
export function buildListResponse<T>(
  results: T[],
  params: PaginationParams
): ApiListResponse<T> {
  return {
    info: buildPaginationInfo(params),
    results,
  }
}

/**
 * Parse pagination query params with defaults
 */
export function parsePaginationQuery(query: Record<string, any>, defaultLimit = 20) {
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || defaultLimit))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}
