import { describe, expect, it } from 'vitest'
import { buildNoindexRouteRules } from '../../server/utils/robotsPolicy'

describe('buildNoindexRouteRules', () => {
  it('disables robots indexing for every auth and profile utility route', () => {
    const rules = buildNoindexRouteRules()

    expect(rules['/signin']).toEqual({ robots: false })
    expect(rules['/signup']).toEqual({ robots: false })
    expect(rules['/forgot-password']).toEqual({ robots: false })
    expect(rules['/reset-password']).toEqual({ robots: false })
    expect(rules['/confirm']).toEqual({ robots: false })
    expect(rules['/profile']).toEqual({ robots: false })
    expect(rules['/profile/**']).toEqual({ robots: false })
  })

  it('does not touch public catalog routes', () => {
    const rules = buildNoindexRouteRules()

    expect(rules['/release/**']).toBeUndefined()
    expect(rules['/']).toBeUndefined()
  })
})
