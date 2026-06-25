export function isPublicEntity(value: unknown): value is Record<string, unknown> {
  return Boolean(
    value
    && typeof value === 'object'
    && (value as Record<string, unknown>).visible === true,
  )
}
