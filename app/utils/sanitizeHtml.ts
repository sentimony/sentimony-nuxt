import DOMPurify from 'dompurify'

const allowedTags = [
  'a',
  'b',
  'br',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'small',
  'span',
  'strong',
  'ul',
]

const allowedAttributes = [
  'class',
  'href',
  'rel',
  'target',
  'title',
]

const allowedTagSet = new Set(allowedTags)
const allowedAttrSet = new Set(allowedAttributes)

const strippedContentTags = ['script', 'style', 'iframe', 'object', 'embed', 'noscript']
// Drop the whole element when it has a matching close tag; drop the open tag and
// everything after it when it does not (an unterminated <script>… must never
// leak its body as text).
const strippedContentPattern = new RegExp(
  `<(${strippedContentTags.join('|')})\\b[^>]*>[\\s\\S]*?(?:<\\/\\1\\s*>|$)`,
  'gi',
)

const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
const attrPattern = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g

const namedEntities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'' }

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10)
      return Number.isNaN(code) ? match : String.fromCodePoint(code)
    }
    return namedEntities[body.toLowerCase()] ?? match
  })
}

// Resolve the value the way a browser would (decode entities, drop control
// chars and whitespace) before deciding whether the URL scheme is safe — a
// denylist over the raw text is trivially bypassed by `java&#x09;script:`.
function hasSafeUrlScheme(value: string): boolean {
  const normalized = decodeEntities(value).replace(/[\u0000-\u0020]+/g, '').toLowerCase()
  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/)
  if (!scheme) return true
  return scheme[1] === 'http' || scheme[1] === 'https' || scheme[1] === 'mailto'
}

const urlAttributes = new Set(['href'])

function sanitizeAttributes(raw: string): string {
  const kept: string[] = []
  for (const match of raw.matchAll(attrPattern)) {
    const name = match[1]!.toLowerCase()
    if (!allowedAttrSet.has(name)) continue
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    if (urlAttributes.has(name) && !hasSafeUrlScheme(value)) continue
    kept.push(`${name}="${value.replace(/"/g, '&quot;')}"`)
  }
  return kept.length ? ` ${kept.join(' ')}` : ''
}

// Server-side fallback: DOMPurify needs a browser DOM, which we no longer ship
// (jsdom pulled an ESM-only transitive that crashes Netlify's CJS lambda). The
// catalog HTML is our own trusted export with a narrow tag allowlist, so an
// allowlist filter is sufficient here — this path only runs during SSR and must
// not be pointed at user-controlled input.
function sanitizeOnServer(value: string): string {
  return value.replace(strippedContentPattern, '').replace(tagPattern, (full, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase()
    if (!allowedTagSet.has(tag)) return ''
    if (full.startsWith('</')) return `</${tag}>`
    const selfClosing = /\/\s*>$/.test(full)
    return `<${tag}${sanitizeAttributes(attrs)}${selfClosing ? ' /' : ''}>`
  })
}

export function sanitizeHtml(value: unknown): string {
  if (typeof value !== 'string') return ''

  if (import.meta.client) {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
    })
  }

  return sanitizeOnServer(value)
}
