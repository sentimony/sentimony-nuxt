import { serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

function dynamicAdminClient(): SupabaseClient {
  return supabaseAdmin() as unknown as SupabaseClient
}

export async function getUserId(event: H3Event) {
  const user = await serverSupabaseUser(event)
  return user?.sub ?? user?.id
}

export function likesListHandler(table: string, slugCol: string) {
  return defineEventHandler(async (event) => {
    const userId = await getUserId(event)
    if (!userId) return []

    const { data } = await dynamicAdminClient()
      .from(table)
      .select(slugCol)
      .eq('user_id', userId)

    return (data as Record<string, string>[] | null)?.map(l => l[slugCol]) ?? []
  })
}

export function likesAddHandler(table: string, slugCol: string) {
  return defineEventHandler(async (event) => {
    const userId = await getUserId(event)
    if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const { slug } = await readBody<{ slug: string }>(event)
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

    const { error } = await dynamicAdminClient()
      .from(table)
      .upsert({ user_id: userId, [slugCol]: slug }, { onConflict: `user_id,${slugCol}`, ignoreDuplicates: true })

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true }
  })
}

export function likesDeleteHandler(table: string, slugCol: string) {
  return defineEventHandler(async (event) => {
    const userId = await getUserId(event)
    if (!userId) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

    const { error } = await dynamicAdminClient()
      .from(table)
      .delete()
      .eq('user_id', userId)
      .eq(slugCol, slug)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { ok: true }
  })
}

export function likesCountHandler(table: string, slugCol: string) {
  return defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

    const { count, error } = await dynamicAdminClient()
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(slugCol, slug)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return { count: count ?? 0 }
  })
}

interface LikedItemsOptions {
  table: string
  slugCol: string
  entityTable: string
  entitySelect: string
  defaultLimit?: number
  visibleOnly?: boolean
}

export async function fetchLikedItems(
  event: H3Event,
  opts: LikedItemsOptions,
  userIdOverride?: string,
  pagination?: { page: number, limit: number },
) {
  const { table, slugCol, entityTable, entitySelect, defaultLimit = 5, visibleOnly = false } = opts

  const userId = userIdOverride ?? await getUserId(event)
  if (!userId) return { data: [], total: 0 }

  const query = getQuery(event) as { page?: string, limit?: string }
  const page = pagination ? String(pagination.page) : (query.page ?? '0')
  const limit = pagination ? String(pagination.limit) : (query.limit ?? String(defaultLimit))
  const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || defaultLimit))
  const pageNum = Math.max(0, Number.parseInt(page, 10) || 0)
  const from = pageNum * limitNum
  const to = from + limitNum - 1

  const admin = dynamicAdminClient()

  const { count, data: likes, error: likesError } = await admin
    .from(table)
    .select(slugCol, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (likesError) throw createError({ statusCode: 500, statusMessage: likesError.message })
  if (!likes?.length) return { data: [], total: count ?? 0 }

  const slugs = (likes as unknown as Record<string, string>[]).map(l => l[slugCol])

  const base = admin.from(entityTable).select(entitySelect).in('slug', slugs)
  const { data, error } = await (visibleOnly ? base.eq('visible', true) : base)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const rows = (data as unknown as { slug: string }[] | null) ?? []
  const sorted = slugs.map(slug => rows.find(r => r.slug === slug)).filter(Boolean)

  return { data: sorted, total: count ?? 0 }
}

export function likedItemsHandler(opts: LikedItemsOptions) {
  return defineEventHandler(async (event) => {
    return fetchLikedItems(event, opts)
  })
}
