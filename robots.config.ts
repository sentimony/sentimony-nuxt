export default defineRobotsConfig({
  indexable: () => {
    // Для staging заборонити індексацію
    return process.env.NUXT_SITE_ENV !== 'staging'
  },
  groups: [
    {
      userAgent: ['*'],
      allow: () => {
        return process.env.NUXT_SITE_ENV !== 'staging' ? ['/'] : []
      },
      disallow: () => {
        return process.env.NUXT_SITE_ENV === 'staging' ? ['/'] : []
      }
    }
  ],
  sitemap: () => {
    if (process.env.NUXT_SITE_ENV !== 'staging') {
      return ['/sitemap.xml']
    }
    return []
  }
})
function defineRobotsConfig(arg0: { indexable: () => boolean; groups: { userAgent: string[]; allow: () => string[]; disallow: () => string[] }[]; sitemap: () => string[] }) {
  throw new Error("Function not implemented.")
}
