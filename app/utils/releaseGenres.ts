export const RELEASE_GENRES = ['psytrance', 'psychill'] as const

export function matchesGenre(style: string | null | undefined, keyword: string): boolean {
  const s = style?.toLowerCase() ?? ''
  if (keyword === 'ungrouped') return !RELEASE_GENRES.some(g => s.includes(g))
  return s.includes(keyword.toLowerCase())
}
