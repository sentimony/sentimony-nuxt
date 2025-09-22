import { getRequestHeader } from 'h3'
import { RESET, CYAN, DIM, YELLOW, RED, colorsForStatus, paint } from './log-colors'
import { detectUserAgent } from './user-agent-detector'

const PATCH_MARK = Symbol.for('sentimony.colorLogsPatched')

// Функція для налаштування кольорових логів консолі
export function setupColoredConsole() {
  if ((globalThis as any)[PATCH_MARK]) return
  ;(globalThis as any)[PATCH_MARK] = true

  const origWarn = console.warn.bind(console)
  const origErr = console.error.bind(console)

  console.warn = (...args: any[]) => {
    origWarn(`${YELLOW}${args.join(' ')}${RESET}`)
  }

  console.error = (...args: any[]) => {
    origErr(`${RED}${args.join(' ')}${RESET}`)
  }
}

// Функція для логування запитів з детальною інформацією
export function logRequest(event: any) {
  // Отримуємо user-agent та аналізуємо його
  const ua = getRequestHeader(event, 'user-agent') || ''
  const agentInfo = detectUserAgent(ua)

  // IP адреса
  const ipRaw =
    getRequestHeader(event, 'x-nf-client-connection-ip')?.trim() ||
    (getRequestHeader(event, 'x-forwarded-for') || '').split(',')[0].trim() ||
    getRequestHeader(event, 'x-real-ip')?.trim() ||
    event.node.req.socket?.remoteAddress || ''

  // Шлях + ?query
  const pathWithQuery = event.node.req.url || '/'

  // Referer
  const refHeader = getRequestHeader(event, 'referer') || getRequestHeader(event, 'referrer') || ''
  const from = (() => {
    if (!refHeader) return ''
    try {
      const u = new URL(refHeader)
      return `${u.hostname}${u.pathname || '/'}${u.search || ''}${u.hash || ''}`
    } catch { return refHeader }
  })()

  // Розмальовки агента та IP
  const agentColored = agentInfo.tag === 'USER' ? paint(CYAN, '[USER]') : paint(DIM, `[${agentInfo.tag}]`)
  const ipColored = ipRaw ? paint(DIM, ipRaw) : ''

  // Логуємо після завершення запиту
  event.node.res.on('finish', () => {
    const status = event.node.res.statusCode || 200
    const { statusC, linkC } = colorsForStatus(status)
    const statusBox = statusC ? paint(statusC, `[${status}]`) : `[${status}]`
    const pathCol = linkC ? paint(linkC, pathWithQuery) : pathWithQuery

    const left = ipColored ? `${agentColored} ${ipColored}` : `${agentColored}`
    const arrowFwd = paint(DIM, '=>')
    const arrowBack = from ? ` ${paint(DIM, '<=')} ${paint(DIM, from)}` : ''

    console.log(`${left} ${arrowFwd} ${statusBox} ${pathCol}${arrowBack}`)
  })
}
