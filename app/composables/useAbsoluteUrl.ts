export function useAbsoluteUrl() {
  const reqUrl = useRequestURL()

  const absoluteUrl = computed(() => {
    const href = import.meta.client ? window.location.href : reqUrl.href
    const u = new URL(href)
    u.hash = ''
    return u.toString()
  })

  function buildUrl(target: string | URL): string {
    try {
      // If already absolute, return as-is
      const u = new URL(String(target))
      u.hash = ''
      return u.toString()
    } catch {
      // Resolve relative to current origin
      const origin = import.meta.client
        ? window.location.origin
        : `${reqUrl.protocol}//${reqUrl.host}`
      return new URL(String(target), origin).toString()
    }
  }

  return { absoluteUrl, buildUrl }
}

