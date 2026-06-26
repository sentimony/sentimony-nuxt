import { describe, expect, it } from 'vitest'
import { sortByDate, visibleByDate } from '../../app/composables/sortByDate'

describe('sortByDate', () => {
  const items = [
    { slug: 'old', date: '2020-01-01' },
    { slug: 'new', date: '2024-01-01' },
    { slug: 'mid', date: '2022-01-01' },
  ]

  it('orders newest first by default', () => {
    expect(sortByDate(items).map(i => i.slug)).toEqual(['new', 'mid', 'old'])
  })

  it('orders oldest first when ascending', () => {
    expect(sortByDate(items, 'asc').map(i => i.slug)).toEqual(['old', 'mid', 'new'])
  })

  it('treats missing dates as epoch zero', () => {
    const withMissing = [{ slug: 'a', date: '2021-01-01' }, { slug: 'b' }]
    expect(sortByDate(withMissing).map(i => i.slug)).toEqual(['a', 'b'])
  })

  it('does not mutate the source array', () => {
    const source = [...items]
    sortByDate(source)
    expect(source.map(i => i.slug)).toEqual(['old', 'new', 'mid'])
  })
})

describe('visibleByDate', () => {
  const items = [
    { slug: 'hidden', date: '2024-06-01', visible: false },
    { slug: 'shown-old', date: '2020-01-01', visible: true },
    { slug: 'shown-new', date: '2023-01-01', visible: true },
  ]

  it('drops hidden entities and sorts newest first', () => {
    expect(visibleByDate(items).map(i => i.slug)).toEqual(['shown-new', 'shown-old'])
  })

  it('supports ascending order', () => {
    expect(visibleByDate(items, 'asc').map(i => i.slug)).toEqual(['shown-old', 'shown-new'])
  })
})
