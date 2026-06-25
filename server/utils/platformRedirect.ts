import { createError, sendRedirect } from 'h3'

type LinkMapping = string | { key: string, status?: 301 | 302 }

export function platformRedirectHandler(entity: 'release' | 'playlist', linksMap: Record<string, LinkMapping>) {
  return defineEventHandler(async (event) => {
    const id = event.context.params?.id as string | undefined
    if (!id) throw createError({ statusCode: 400, statusMessage: `Missing ${entity} id` })

    const platform = event.context.params?.platform as string | undefined
    const mapping = platform ? linksMap[platform] : undefined
    if (!mapping) throw createError({ statusCode: 404, statusMessage: 'Unknown platform' })

    const linkKey = typeof mapping === 'string' ? mapping : mapping.key
    const status = typeof mapping === 'string' ? 301 : (mapping.status ?? 301)

    const data = await $fetch<{ links?: Record<string, string> }>(`/api/${entity}/${id}`).catch(() => null)
    const url = data?.links?.[linkKey]
    if (!url) throw createError({ statusCode: 404, statusMessage: `${platform} link not found` })

    return sendRedirect(event, url, status)
  })
}
