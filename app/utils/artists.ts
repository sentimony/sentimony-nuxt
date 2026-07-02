import type { Artist, ArtistCategory } from '../types'

const artistCategoryOrder: ArtistCategory[] = ['musician', 'dj', 'mastering', 'designer']

function artistCategoryRank(category: Artist['category']) {
  const rank = artistCategoryOrder.indexOf(category as ArtistCategory)
  return rank === -1 ? artistCategoryOrder.length : rank
}

export function sortArtistsForCatalog(artists: Artist[]) {
  return [...artists]
    .filter(artist => Boolean(artist.visible))
    .sort((a, b) => {
      const categoryDiff = artistCategoryRank(a.category) - artistCategoryRank(b.category)

      if (categoryDiff !== 0) return categoryDiff

      return Number(a.category_id ?? 0) - Number(b.category_id ?? 0)
    })
}

export function groupArtistsByCategory(artists: Artist[]): { category: ArtistCategory; list: Artist[] }[] {
  return artistCategoryOrder
    .map(category => ({ category, list: artists.filter(a => a.category === category) }))
    .filter(group => group.list.length > 0)
}
