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
const allowedAttributeSet = new Set(allowedAttributes)
const voidTags = new Set(['br'])

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function isSafeHref(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) return true

  try {
    const url = new URL(trimmed)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol)
  } catch {
    return false
  }
}

function sanitizeAttributes(rawAttributes: string) {
  const attributes: string[] = []
  const attributePattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

  for (const match of rawAttributes.matchAll(attributePattern)) {
    const name = match[1]?.toLowerCase()
    if (!name || !allowedAttributeSet.has(name)) continue

    const value = match[2] ?? match[3] ?? match[4] ?? ''
    if (name === 'href' && !isSafeHref(value)) continue
    if (name === 'target' && !['_blank', '_self', '_parent', '_top'].includes(value)) continue

    attributes.push(`${name}="${escapeAttribute(value)}"`)
  }

  return attributes.length ? ` ${attributes.join(' ')}` : ''
}

export function sanitizeHtml(value: unknown): string {
  if (typeof value !== 'string') return ''

  return value.replace(/<\/?([a-zA-Z][\w:-]*)([^>]*)>/g, (match, rawTag: string, rawAttributes: string) => {
    const tag = rawTag.toLowerCase()
    if (!allowedTagSet.has(tag)) return ''

    const isClosing = match.startsWith('</')
    if (isClosing) return voidTags.has(tag) ? '' : `</${tag}>`

    const attributes = sanitizeAttributes(rawAttributes ?? '')
    return voidTags.has(tag) ? `<${tag}${attributes}>` : `<${tag}${attributes}>`
  })
}
