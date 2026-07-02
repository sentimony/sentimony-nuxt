import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from '../../app/utils/sanitizeHtml'

describe('sanitizeHtml', () => {
  it('removes executable tags and event handlers', () => {
    const result = sanitizeHtml(
      '<p onclick="alert(1)">Safe<script>alert(1)</script><img src=x onerror="alert(1)"></p>',
    )

    expect(result).toContain('<p>Safe')
    expect(result).not.toContain('<script')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('onerror')
  })

  it('removes javascript URLs while preserving safe links', () => {
    const result = sanitizeHtml(
      '<a href="javascript:alert(1)">Bad</a><a href="/artist/test">Good</a>',
    )

    expect(result).not.toContain('javascript:')
    expect(result).toContain('href="/artist/test"')
  })

  it('preserves catalog formatting tags', () => {
    const source = '<p><small>01.</small> <b>Artist</b> - <i>Track</i><br><a href="/release/x">Release</a></p>'

    expect(sanitizeHtml(source)).toBe(source)
  })

  it('returns an empty string for non-string input', () => {
    expect(sanitizeHtml(undefined)).toBe('')
    expect(sanitizeHtml(null)).toBe('')
  })

  it('strips the inner content of disallowed tags', () => {
    const result = sanitizeHtml('<p>Safe</p><script>document.cookie</script>')

    expect(result).toContain('Safe')
    expect(result).not.toContain('document.cookie')
  })

  it('handles a literal > inside a quoted attribute value', () => {
    const result = sanitizeHtml('<a title="Price > 0" href="/releases">link</a>')

    expect(result).toContain('href="/releases"')
    expect(result).toContain('link')
    expect(result).not.toContain('0"&gt;')
  })
})
