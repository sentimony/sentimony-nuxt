type SortDirection = 'asc' | 'desc'

interface Dated {
  date?: string | number | Date | null
}

interface VisibleDated extends Dated {
  visible?: boolean | null
}

function dateValue(value: Dated['date']): number {
  return new Date(value ?? 0).getTime()
}

export function sortByDate<T extends Dated>(
  items: readonly T[],
  direction: SortDirection = 'desc',
): T[] {
  const sign = direction === 'desc' ? 1 : -1
  return [...items].sort((a, b) => sign * (dateValue(b.date) - dateValue(a.date)))
}

export function visibleByDate<T extends VisibleDated>(
  items: readonly T[],
  direction: SortDirection = 'desc',
): T[] {
  return sortByDate(items.filter(item => Boolean(item.visible)), direction)
}
