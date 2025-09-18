import { getRequestHeader } from 'h3'
import { RESET, CYAN, DIM, colorsForStatus, paint } from '../utils/log-colors'

export default defineEventHandler((event) => {
  // Агент
  const ua = getRequestHeader(event, 'user-agent') || ''
  const knownTools = [
    { re: /lighthouse|chrome-lighthouse|pagespeed/i, tag: 'TOOL:LIGHTHOUSE' },
    { re: /headlesschrome/i, tag: 'TOOL:HEADLESS' },
    { re: /cypress/i, tag: 'TOOL:CYPRESS' },
    { re: /postman|insomnia/i, tag: 'TOOL:APICLIENT' },
    { re: /curl|wget/i, tag: 'TOOL:CLI' },
    { re: /axios|httpclient|node-fetch|python-requests|go-http-client/i, tag: 'TOOL:HTTP' },
  ]
  const knownBots = [
    { re: /googlebot|adsbot-google|apis-google|google-inspectiontool/i, tag: 'BOT:GOOGLE' },
    { re: /bingbot|adidxbot|bingpreview/i, tag: 'BOT:BING' },
    { re: /duckduckbot/i, tag: 'BOT:DUCKDUCKGO' },
    { re: /baiduspider/i, tag: 'BOT:BAIDU' },
    { re: /yandex(bot|images|media)/i, tag: 'BOT:YANDEX' },
    { re: /facebookexternalhit|facebookcatalog|facebot/i, tag: 'BOT:FACEBOOK' },
    { re: /twitterbot/i, tag: 'BOT:TWITTER' },
    { re: /linkedinbot/i, tag: 'BOT:LINKEDIN' },
    { re: /slackbot/i, tag: 'BOT:SLACK' },
    { re: /discordbot/i, tag: 'BOT:DISCORD' },
    { re: /telegrambot/i, tag: 'BOT:TELEGRAM' },
    { re: /ahrefsbot/i, tag: 'BOT:AHREFS' },
    { re: /semrush(bot)?/i, tag: 'BOT:SEMRUSH' },
    { re: /mj12bot/i, tag: 'BOT:MAJESTIC' },
    { re: /petalbot/i, tag: 'BOT:PETAL' },
    { re: /screaming frog|screamingfrogseo/i, tag: 'BOT:SCREAMINGFROG' },
    { re: /uptime|pingdom|site24x7|newrelicpinger|updown\.io/i, tag: 'BOT:UPTIME' },
  ]
  const genericBotRe = /bot|crawler|spider|crawling|scrapy|urlpreview|linkcheck|validator|monitor|probe/i
  const agentRaw =
    knownTools.find(k => k.re.test(ua))?.tag ??
    knownBots.find(k => k.re.test(ua))?.tag ??
    (genericBotRe.test(ua) ? 'BOT' : 'USER')

  // IP
  const ipRaw =
    getRequestHeader(event, 'x-nf-client-connection-ip')?.trim() ||
    (getRequestHeader(event, 'x-forwarded-for') || '').split(',')[0].trim() ||
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

  // Розмальовки
  const agentColored = agentRaw === 'USER' ? paint(CYAN, '[USER]') : paint(DIM, `[${agentRaw}]`)
  const ipColored = ipRaw ? paint(DIM, ipRaw) : ''

  event.node.res.on('finish', () => {
    const status = event.node.res.statusCode || 200
    const { statusC, linkC } = colorsForStatus(status)
    const statusBox = statusC ? paint(statusC, `[${status}]`) : `[${status}]`
    const pathCol   = linkC  ? paint(linkC,  pathWithQuery)   : pathWithQuery

    const left     = ipColored ? `${agentColored} ${ipColored}` : `${agentColored}`
    const arrowFwd = paint(DIM, '=>')
    const arrowBack= from ? ` ${paint(DIM, '<=')} ${paint(DIM, from)}` : ''

    console.log(`${left} ${arrowFwd} ${statusBox} ${pathCol}${arrowBack}`)
  })
})
