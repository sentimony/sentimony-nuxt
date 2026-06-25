import { describe, expect, it } from 'vitest'
import { isPublicEntity } from '../../server/utils/publicEntity'

describe('isPublicEntity', () => {
  it('accepts visible entities', () => {
    expect(isPublicEntity({ slug: 'public', visible: true })).toBe(true)
  })

  it('rejects hidden and malformed entities', () => {
    expect(isPublicEntity({ slug: 'hidden', visible: false })).toBe(false)
    expect(isPublicEntity(null)).toBe(false)
    expect(isPublicEntity('invalid')).toBe(false)
  })
})
