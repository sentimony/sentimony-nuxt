/**
 * Converts Firebase response (object or array) to a typed array.
 * Handles both { key: { slug: {...} } } and direct array responses.
 */
export function toArray<T>(raw: unknown, key?: string): T[] {
  if (!raw) return []
  const data = key && typeof raw === 'object' && raw !== null && key in raw
    ? (raw as Record<string, unknown>)[key]
    : raw
  if (Array.isArray(data)) return data.filter(Boolean) as T[]
  if (data && typeof data === 'object') return Object.values(data) as T[]
  return []
}
