type RobotsRouteRule = {
  robots: false
}

const noindexRoutes = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/confirm',
  '/profile',
  '/profile/**',
] as const

export function buildNoindexRouteRules(): Record<string, RobotsRouteRule> {
  const rules: Record<string, RobotsRouteRule> = {}

  for (const route of noindexRoutes) {
    rules[route] = { robots: false }
  }

  return rules
}
