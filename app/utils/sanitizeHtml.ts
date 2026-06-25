import DOMPurify from 'isomorphic-dompurify'

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

export function sanitizeHtml(value: unknown): string {
  if (typeof value !== 'string') return ''

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
  })
}
