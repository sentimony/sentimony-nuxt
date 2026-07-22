export function thumb(src?: string | null): string | undefined {
  return src?.replace(/_(?:xl|og)\.jpg(\?.*)?$/i, '_th.jpg$1') ?? undefined
}
