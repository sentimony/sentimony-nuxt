import { htmlCacheHeaders } from '../utils/htmlCachePolicy'

export default defineEventHandler((event) => {
  if (event.method !== 'GET') return

  const headers = htmlCacheHeaders(getRequestURL(event).pathname, getHeader(event, 'cookie'))
  if (headers) setResponseHeaders(event, headers)
})
