export function resolveLegacyRedirect(pathname: string): string | null {
  if (/\.html?$/.test(pathname)) {
    if (/\/index\.html?$/.test(pathname)) return pathname.replace(/\/index\.html?$/, '/')
    return pathname.replace(/\.html?$/, '')
  }

  if (/^\/login\/?$/.test(pathname)) return '/signin'

  const googlePlay = pathname.match(/^(\/release\/[^/]+)\/googleplay/)
  if (googlePlay?.[1]) return `${googlePlay[1]}/youtubemusic`

  return null
}
