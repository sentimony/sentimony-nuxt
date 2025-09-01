export function toArray<T = any>(raw: any, key?: string): T[] {
  if (!raw) return []
  const data = key && raw?.[key] != null ? raw[key] : raw
  if (Array.isArray(data)) return data.filter(Boolean)
  if (data && typeof data === 'object') return Object.values(data)
  return []
}
