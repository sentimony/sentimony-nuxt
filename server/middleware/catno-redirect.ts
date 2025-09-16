import { getRequestURL, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  // Only handle GET requests
  if (event.method !== 'GET') return

  const { pathname } = getRequestURL(event)

  // Ignore known prefixes and files with extensions
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_nuxt') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/__nitro') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return
  }

  // Already on a release route
  if (pathname.startsWith('/release/')) return

  // Expect exactly one non-empty segment like /SENCD001
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 1) return

  const candidate = segments[0]
  const candidateNorm = candidate.toUpperCase()

  // Quick heuristic: must contain at least one digit (e.g., SENCD001)
  if (!/[0-9]/.test(candidate)) return

  // Try resolve by cat_no via cached releases API
  const releases = await $fetch<Record<string, any>>('/api/releases').catch(() => null)
  if (!releases) return

  for (const [slug, release] of Object.entries(releases)) {
    const cat = String(release?.cat_no || '')
    if (cat.toUpperCase() === candidateNorm) {
      return sendRedirect(event, `/release/${slug}`, 301)
    }
  }
})
