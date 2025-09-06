export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string
  utc?: boolean
}

export function useDate() {
  const runtime = useRuntimeConfig?.() as any
  const defaultLocale = runtime?.public?.dateLocale || 'en-GB'

  const toDate = (value?: string | number | Date | null) => {
    if (value == null || value === '') return null
    const d = new Date(value as any)
    return isNaN(d.getTime()) ? null : d
  }

  function formatDate(value?: string | number | Date | null, opts: FormatDateOptions = {}): string {
    const d = toDate(value)
    if (!d) return ''
    const { locale = defaultLocale, utc = true, ...rest } = opts
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(utc ? { timeZone: 'UTC' } : {}),
      ...rest,
    }).format(d)
  }

  function formatYear(value?: string | number | Date | null, opts: Pick<FormatDateOptions, 'locale' | 'utc'> = {}): string {
    const d = toDate(value)
    if (!d) return ''
    const { locale = defaultLocale, utc = true } = opts
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      ...(utc ? { timeZone: 'UTC' } : {}),
    }).format(d)
  }

  return { formatDate, formatYear }
}

