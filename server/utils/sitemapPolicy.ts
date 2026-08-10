export function isSitemapEnabled(env: Record<string, string | undefined>): boolean {
  const flag = env.NUXT_SITEMAP_ENABLED

  if (flag !== undefined) return flag !== 'false'

  return !env.URL?.includes('stage') && env.CONTEXT !== 'deploy-preview'
}
