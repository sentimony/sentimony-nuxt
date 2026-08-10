// Pure helpers for the performance baseline collector: no network, no fs,
// so the numbers that end up in an audit stay reproducible and testable.

export function summarize(samples) {
  const values = samples.filter(value => Number.isFinite(value)).sort((a, b) => a - b)
  if (!values.length) return null
  const rank = Math.max(1, Math.ceil(values.length * 0.95))
  return {
    min: values[0],
    median: values[Math.floor((values.length - 1) / 2)],
    p95: values[rank - 1],
    n: values.length,
  }
}

export function cacheStateOf(headers) {
  return headers.get('cf-cache-status') ?? headers.get('cache-status') ?? 'unknown'
}

export function bustUrl(url, token) {
  const parsed = new URL(url)
  parsed.searchParams.set('_pb', token)
  return parsed.toString()
}

export function formatMarkdownTable(rows) {
  if (!rows.length) return ''
  const columns = Object.keys(rows[0])
  const header = `| ${columns.join(' | ')} |`
  const divider = `| ${columns.map(() => '---').join(' | ')} |`
  const body = rows.map(row => `| ${columns.map(column => String(row[column] ?? '')).join(' | ')} |`)
  return [header, divider, ...body].join('\n')
}
