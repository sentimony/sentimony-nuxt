import { describe, expect, it } from 'vitest'
import { groupArtistsByCategory, sortArtistsForCatalog } from '../../app/utils/artists'

describe('artist sorting', () => {
  it('orders artists by page category sequence, then ascending category_id', () => {
    const sorted = sortArtistsForCatalog([
      { slug: 'designer-early', title: 'Designer Early', visible: true, category: 'designer', category_id: 1 },
      { slug: 'musician-late', title: 'Musician Late', visible: true, category: 'musician', category_id: 9 },
      { slug: 'mastering', title: 'Mastering', visible: true, category: 'mastering', category_id: 3 },
      { slug: 'dj', title: 'DJ', visible: true, category: 'dj', category_id: 2 },
      { slug: 'musician-early', title: 'Musician Early', visible: true, category: 'musician', category_id: 1 },
    ])

    expect(sorted.map(artist => artist.slug)).toEqual([
      'musician-early',
      'musician-late',
      'dj',
      'mastering',
      'designer-early',
    ])
  })
})

describe('groupArtistsByCategory', () => {
  it('groups in catalog order and drops empty categories', () => {
    const artists = [
      { slug: 'd1', title: 'D1', visible: true, category: 'designer' as const, category_id: 10 },
      { slug: 'm1', title: 'M1', visible: true, category: 'musician' as const, category_id: 1 },
      { slug: 'm2', title: 'M2', visible: true, category: 'musician' as const, category_id: 2 },
    ]

    const groups = groupArtistsByCategory(artists)

    expect(groups.map(g => g.category)).toEqual(['musician', 'designer'])
    expect(groups[0]!.list.map(a => a.slug)).toEqual(['m1', 'm2'])
  })
})
