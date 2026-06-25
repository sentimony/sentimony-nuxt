type FirebaseCollection = Record<string, Record<string, unknown>>

export function pickListFields(
  data: unknown,
  fields: readonly string[],
  options: { visibleOnly?: boolean } = {},
): FirebaseCollection {
  if (!data || typeof data !== 'object') return {}

  const result: FirebaseCollection = {}
  for (const [key, value] of Object.entries(data as FirebaseCollection)) {
    if (!value || typeof value !== 'object') continue
    if (options.visibleOnly && value.visible !== true) continue
    const trimmed: Record<string, unknown> = {}
    for (const field of fields) {
      if (field in value) trimmed[field] = value[field]
    }
    result[key] = trimmed
  }
  return result
}
