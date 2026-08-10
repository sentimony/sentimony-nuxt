import { resolveLegacyRedirect } from '../utils/legacyRedirects'

export default defineEventHandler((event) => {
  const target = resolveLegacyRedirect(getRequestURL(event).pathname)
  if (target) return sendRedirect(event, target, 301)
})
