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
const strippedContentPattern = new RegExp(
  `<(${strippedContentTags.join('|')})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`,
  'gi',
)

const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g
const attrPattern = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g

function sanitizeAttributes(raw: string): string {
  const kept: string[] = []
  for (const match of raw.matchAll(attrPattern)) {
    const name = match[1]!.toLowerCase()
    if (!allowedAttrSet.has(name)) continue
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    if (/^\s*(?:javascript|data|vbscript):/i.test(value)) continue
    kept.push(`${name}="${value.replace(/"/g, '&quot;')}"`)
  }
  return kept.length ? ` ${kept.join(' ')}` : ''
}

// Server-side fallback: DOMPurify needs a browser DOM, which we no longer ship
// (jsdom pulled an ESM-only transitive that crashes Netlify's CJS lambda). The
// catalog HTML is our own trusted export with a narrow tag allowlist, so an
// allowlist filter is sufficient here — this path only runs during SSR.
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
