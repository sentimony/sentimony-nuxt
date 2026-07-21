export function mergePlayCounts(
  base: Record<string, number>,
  incoming?: Record<string, number>,
): Record<string, number> {
  if (!incoming) return base
  for (const [slug, count] of Object.entries(incoming)) {
    if ((base[slug] ?? 0) < count) base[slug] = count
  }
  return base
}
